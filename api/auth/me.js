import { applyCors, sendError, sendJson } from '../../server/auth/http.js';
import { readStore, pruneExpiredSessions } from '../../server/auth/store.js';
import { sanitizeUser } from '../../server/auth/users.js';
import { verifyJwt } from '../../server/auth/jwt.js';

function getBearerToken(req) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return '';
    return token;
}

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (req.method !== 'GET') {
        sendError(res, 405, 'Method Not Allowed');
        return;
    }

    const token = getBearerToken(req);
    const payload = verifyJwt(token);
    if (!payload || !payload.sub) {
        sendError(res, 401, 'Unauthorized');
        return;
    }

    const store = await readStore();
    pruneExpiredSessions(store);
    const user = store.users.find((entry) => entry.id === payload.sub);
    if (!user) {
        sendError(res, 401, 'Unauthorized');
        return;
    }

    sendJson(res, 200, { success: true, user: sanitizeUser(user) });
}
