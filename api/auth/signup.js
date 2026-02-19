import { applyCors, parseJsonBody, sendError, sendJson } from '../../server/auth/http.js';
import { requireCsrf } from '../../server/auth/csrf.js';
import { checkRateLimit } from '../../server/auth/rate-limit.js';
import { updateStore, pruneExpiredSessions } from '../../server/auth/store.js';
import { buildUsername, createUserId, normalizeEmail, sanitizeUser, validateEmail, validatePassword } from '../../server/auth/users.js';
import { hashPassword, hashToken, randomToken } from '../../server/auth/crypto.js';
import { sendVerificationEmail } from '../../server/auth/email.js';
import { AUTH_CONFIG } from '../../server/auth/config.js';

export default async function handler(req, res) {
    if (!applyCors(req, res)) return;

    if (req.method !== 'POST') {
        sendError(res, 405, 'Method Not Allowed');
        return;
    }

    if (!checkRateLimit(req, res, 'signup')) return;
    if (!requireCsrf(req, res)) return;

    const body = await parseJsonBody(req);
    const firstName = (body.firstName || '').toString().trim();
    const lastName = (body.lastName || '').toString().trim();
    const emailInput = (body.email || '').toString().trim();
    const password = (body.password || '').toString();
    const newsletter = !!body.newsletter;

    if (!firstName || !lastName) {
        sendError(res, 400, 'First and last name are required.');
        return;
    }

    const email = normalizeEmail(emailInput);
    if (!validateEmail(email)) {
        sendError(res, 400, 'Please enter a valid email address.');
        return;
    }

    if (!validatePassword(password)) {
        sendError(res, 400, 'Password must be at least 8 characters and include uppercase, lowercase, and a number.');
        return;
    }

    const verifyToken = randomToken(32);
    const verifyTokenHash = hashToken(verifyToken);
    const verifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    let newUser = null;
    try {
        await updateStore((store) => {
            pruneExpiredSessions(store);
            const exists = store.users.some((user) => normalizeEmail(user.email) === email);
            if (exists) {
                throw { status: 409, message: 'This email is already registered.' };
            }

            const createdAt = new Date().toISOString();
            const username = `@${buildUsername(firstName, lastName, email)}`;
            newUser = {
                id: createUserId(),
                firstName,
                lastName,
                email,
                phone: null,
                passwordHash: hashPassword(password),
                newsletter,
                createdAt,
                verified: false,
                username,
                avatarUrl: null,
                verifyTokenHash,
                verifyTokenExpiresAt: verifyExpiresAt
            };

            store.users.push(newUser);
        });
    } catch (error) {
        if (error && error.status) {
            sendError(res, error.status, error.message || 'Signup failed.');
            return;
        }
        console.error('Signup error:', error);
        sendError(res, 500, 'Unable to create account. Please try again.');
        return;
    }

    const sendResult = await sendVerificationEmail({
        req,
        to: email,
        name: firstName,
        token: verifyToken
    });

    const response = {
        success: true,
        user: sanitizeUser(newUser),
        needsVerification: true,
        verificationSent: !!sendResult.ok
    };

    if (AUTH_CONFIG.exposeVerifyUrl && sendResult.previewUrl) {
        response.verificationUrl = sendResult.previewUrl;
    }

    sendJson(res, 201, response);
}
