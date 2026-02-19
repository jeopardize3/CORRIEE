import { applyCors, sendError, sendJson } from '../../server/auth/http.js';
import { requireCsrf } from '../../server/auth/csrf.js';
import { checkRateLimit } from '../../server/auth/rate-limit.js';
import { updateStore, pruneExpiredSessions } from '../../server/auth/store.js';
import { getSessionFromRequest, rotateSession } from '../../server/auth/sessions.js';
import { hashToken } from '../../server/auth/crypto.js';
import { sanitizeUser } from '../../server/auth/users.js';

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (req.method !== 'POST') {
        sendError(res, 405, 'Method Not Allowed');
        return;
    }

    if (!checkRateLimit(req, res, 'refresh')) return;
    if (!requireCsrf(req, res)) return;

    let accessToken = '';
    let safeUser = null;

    try {
        await updateStore((store) => {
            pruneExpiredSessions(store);
            const sessionInfo = getSessionFromRequest(req, store);
            if (!sessionInfo || !sessionInfo.session) {
                throw { status: 401, message: 'Session expired.' };
            }

            const { session, refreshToken } = sessionInfo;
            const tokenHash = hashToken(refreshToken);
            if (tokenHash !== session.refreshTokenHash) {
                throw { status: 401, message: 'Session invalid.' };
            }

            const user = store.users.find((entry) => entry.id === session.userId);
            if (!user) {
                throw { status: 401, message: 'User not found.' };
            }

            const rotated = rotateSession({ store, session, req, res });
            accessToken = rotated.accessToken;
            safeUser = sanitizeUser(user);
        });
    } catch (error) {
        if (error && error.status) {
            sendError(res, error.status, error.message);
            return;
        }
        console.error('Refresh error:', error);
        sendError(res, 500, 'Unable to refresh session.');
        return;
    }

    sendJson(res, 200, { success: true, accessToken, user: safeUser });
}
