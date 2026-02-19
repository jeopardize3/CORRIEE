import { applyCors, sendJson } from '../../server/auth/http.js';
import { requireCsrf } from '../../server/auth/csrf.js';
import { checkRateLimit } from '../../server/auth/rate-limit.js';
import { updateStore, pruneExpiredSessions } from '../../server/auth/store.js';
import { getSessionFromRequest, clearSessionCookie } from '../../server/auth/sessions.js';

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end();
        return;
    }

    if (!checkRateLimit(req, res, 'logout')) return;
    if (!requireCsrf(req, res)) return;

    await updateStore((store) => {
        pruneExpiredSessions(store);
        const sessionInfo = getSessionFromRequest(req, store);
        if (sessionInfo && sessionInfo.session) {
            store.sessions = store.sessions.filter((entry) => entry.id !== sessionInfo.session.id);
        }
    });

    clearSessionCookie(req, res);
    sendJson(res, 200, { success: true });
}
