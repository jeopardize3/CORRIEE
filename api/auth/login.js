import { applyCors, parseJsonBody, sendError, sendJson } from '../../server/auth/http.js';
import { requireCsrf } from '../../server/auth/csrf.js';
import { checkRateLimit } from '../../server/auth/rate-limit.js';
import { updateStore, pruneExpiredSessions } from '../../server/auth/store.js';
import { normalizeEmail, sanitizeUser, validateEmail } from '../../server/auth/users.js';
import { verifyPassword } from '../../server/auth/crypto.js';
import { createSession } from '../../server/auth/sessions.js';

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (req.method !== 'POST') {
        sendError(res, 405, 'Method Not Allowed');
        return;
    }

    if (!checkRateLimit(req, res, 'login')) return;
    if (!requireCsrf(req, res)) return;

    const body = await parseJsonBody(req);
    const emailInput = (body.email || '').toString().trim();
    const password = (body.password || '').toString();
    const rememberMe = !!body.rememberMe;

    const email = normalizeEmail(emailInput);
    if (!validateEmail(email) || !password) {
        sendError(res, 400, 'Email or password is incorrect.');
        return;
    }

    let user = null;
    let accessToken = '';

    try {
        await updateStore((store) => {
            pruneExpiredSessions(store);
            user = store.users.find((entry) => normalizeEmail(entry.email) === email);
            if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
                throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' };
            }
            if (!user.verified) {
                throw { status: 403, code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email to continue.' };
            }

            const sessionResult = createSession({ store, userId: user.id, rememberMe, req, res });
            accessToken = sessionResult.accessToken;
            user.loginTime = new Date().toISOString();
        });
    } catch (error) {
        if (error && error.status) {
            sendJson(res, error.status, { error: error.message, code: error.code });
            return;
        }
        console.error('Login error:', error);
        sendError(res, 500, 'Unable to sign in. Please try again.');
        return;
    }

    sendJson(res, 200, {
        success: true,
        accessToken,
        user: sanitizeUser(user)
    });
}
