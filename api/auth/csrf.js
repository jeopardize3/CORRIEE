import { applyCors, sendJson } from '../../server/auth/http.js';
import { checkRateLimit } from '../../server/auth/rate-limit.js';
import { ensureCsrfToken } from '../../server/auth/csrf.js';

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (!checkRateLimit(req, res, 'default')) return;

    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end();
        return;
    }

    const token = ensureCsrfToken(req, res);
    sendJson(res, 200, { csrfToken: token });
}
