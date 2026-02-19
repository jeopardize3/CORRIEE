import { applyCors, parseJsonBody, sendJson } from '../../server/auth/http.js';
import { requireCsrf } from '../../server/auth/csrf.js';
import { checkRateLimit } from '../../server/auth/rate-limit.js';
import { updateStore, pruneExpiredSessions } from '../../server/auth/store.js';
import { normalizeEmail, validateEmail } from '../../server/auth/users.js';
import { hashToken, randomToken } from '../../server/auth/crypto.js';
import { sendVerificationEmail } from '../../server/auth/email.js';
import { AUTH_CONFIG } from '../../server/auth/config.js';

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end();
        return;
    }

    if (!checkRateLimit(req, res, 'resend')) return;
    if (!requireCsrf(req, res)) return;

    const body = await parseJsonBody(req);
    const emailInput = (body.email || '').toString().trim();
    if (!emailInput || !validateEmail(emailInput)) {
        sendJson(res, 400, { error: 'Invalid email address.' });
        return;
    }

    const email = normalizeEmail(emailInput);

    let previewUrl = '';
    if (email) {
        const token = randomToken(32);
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        let shouldSend = false;
        let firstName = 'there';

        await updateStore((store) => {
            pruneExpiredSessions(store);
            const user = store.users.find((entry) => normalizeEmail(entry.email) === email);
            if (!user || user.verified) return;
            user.verifyTokenHash = tokenHash;
            user.verifyTokenExpiresAt = expiresAt;
            firstName = user.firstName || 'there';
            shouldSend = true;
        });

        if (shouldSend) {
            const sendResult = await sendVerificationEmail({ req, to: email, name: firstName, token });
            if (AUTH_CONFIG.exposeVerifyUrl && sendResult.previewUrl) {
                previewUrl = sendResult.previewUrl;
            }
        }
    }

    sendJson(res, 200, { success: true, verificationUrl: previewUrl || undefined });
}
