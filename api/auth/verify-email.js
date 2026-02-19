import { applyCors, parseJsonBody, sendError, sendJson } from '../../server/auth/http.js';
import { requireCsrf } from '../../server/auth/csrf.js';
import { checkRateLimit } from '../../server/auth/rate-limit.js';
import { updateStore, pruneExpiredSessions } from '../../server/auth/store.js';
import { hashToken } from '../../server/auth/crypto.js';

function extractToken(req, body) {
    if (body && body.token) return body.token;
    if (req.query && req.query.token) return req.query.token;
    if (req.url) {
        try {
            const url = new URL(req.url, 'http://localhost');
            return url.searchParams.get('token') || '';
        } catch (error) {
            return '';
        }
    }
    return '';
}

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (req.method !== 'GET' && req.method !== 'POST') {
        sendError(res, 405, 'Method Not Allowed');
        return;
    }

    if (!checkRateLimit(req, res, 'verify')) return;
    if (req.method === 'POST' && !requireCsrf(req, res)) return;

    const body = req.method === 'POST' ? await parseJsonBody(req) : {};
    const token = (extractToken(req, body) || '').toString().trim();
    if (!token) {
        sendError(res, 400, 'Missing verification token.');
        return;
    }

    const tokenHash = hashToken(token);
    let verified = false;

    try {
        await updateStore((store) => {
            pruneExpiredSessions(store);
            const user = store.users.find((entry) => entry.verifyTokenHash === tokenHash);
            if (!user) {
                throw { status: 400, message: 'Invalid or expired verification link.' };
            }
            if (user.verifyTokenExpiresAt) {
                const expires = new Date(user.verifyTokenExpiresAt);
                if (Number.isNaN(expires.getTime()) || expires.getTime() < Date.now()) {
                    throw { status: 400, message: 'Verification link expired.' };
                }
            }
            user.verified = true;
            user.verifyTokenHash = null;
            user.verifyTokenExpiresAt = null;
            verified = true;
        });
    } catch (error) {
        if (error && error.status) {
            sendError(res, error.status, error.message);
            return;
        }
        console.error('Verify email error:', error);
        sendError(res, 500, 'Unable to verify email.');
        return;
    }

    sendJson(res, 200, { success: verified });
}
