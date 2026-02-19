import { applyCors } from '../server/auth/http.js';
import { checkRateLimit } from '../server/auth/rate-limit.js';

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (!checkRateLimit(req, res, 'default')) return;

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
        return;
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const token = body.token;
        const action = body.action || '';
        if (!token) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Missing token' }));
            return;
        }

        const RECAPTCHA_SECRET = (process.env.RECAPTCHA_SECRET || '6Lczk2ksAAAAAF2UG2QBljPW-WrJAL9GQLPYX_NO').trim();
        if (!RECAPTCHA_SECRET) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Missing RECAPTCHA_SECRET' }));
            return;
        }
        const params = new URLSearchParams();
        params.append('secret', RECAPTCHA_SECRET);
        params.append('response', token);

        const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        if (!verifyRes.ok) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Verification request failed' }));
            return;
        }

        const data = await verifyRes.json();
        const scoreOk = typeof data.score === 'number' ? data.score >= 0.5 : true;
        const actionOk = action ? data.action === action : true;
        const success = !!data.success && scoreOk && actionOk;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success,
            score: data.score,
            action: data.action,
            errors: data['error-codes'] || []
        }));
    } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Server error' }));
    }
}
