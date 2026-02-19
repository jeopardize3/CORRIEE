import { AUTH_CONFIG } from './config.js';
import { getRequestOrigin } from './http.js';

function normalizeBase(base) {
    return (base || '').trim().replace(/\/+$/g, '');
}

function buildVerifyUrlFromConfig(token, req) {
    const tokenParam = encodeURIComponent(token);
    if (AUTH_CONFIG.verifyUrl) {
        if (AUTH_CONFIG.verifyUrl.includes('{token}')) {
            return AUTH_CONFIG.verifyUrl.replace('{token}', tokenParam);
        }
        const joiner = AUTH_CONFIG.verifyUrl.includes('?') ? '&' : '?';
        return `${AUTH_CONFIG.verifyUrl}${joiner}token=${tokenParam}`;
    }

    const base = normalizeBase(AUTH_CONFIG.appBaseUrl || getRequestOrigin(req));
    if (!base) return '';
    return `${base}/pages/verify-email.html?token=${tokenParam}`;
}

async function getTransport() {
    const smtp = AUTH_CONFIG.smtp;
    if (!smtp.host || !smtp.user || !smtp.pass) return null;

    try {
        const mod = await import('nodemailer');
        const nodemailer = mod.default || mod;
        return nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure,
            auth: { user: smtp.user, pass: smtp.pass }
        });
    } catch (error) {
        console.error('Email transport unavailable:', error);
        return null;
    }
}

export async function sendVerificationEmail({ req, to, name, token }) {
    const verifyUrl = buildVerifyUrlFromConfig(token, req);
    if (!verifyUrl) {
        console.warn('Verification URL could not be resolved.');
        return { ok: false, previewUrl: '' };
    }

    const subject = 'Verify your CORRIESELLS email';
    const safeName = (name || 'there').toString().trim() || 'there';
    const text = `Hi ${safeName},\n\nPlease verify your email to finish creating your CORRIESELLS account:\n${verifyUrl}\n\nIf you did not sign up, you can ignore this email.`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2 style="color:#111;">Verify your email</h2>
            <p>Hi ${safeName},</p>
            <p>Thanks for creating a CORRIESELLS account. Click the button below to verify your email:</p>
            <p style="margin: 24px 0;">
                <a href="${verifyUrl}" style="background:#111;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;">Verify email</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verifyUrl}</p>
            <p>If you did not sign up, you can safely ignore this email.</p>
        </div>
    `;

    const transport = await getTransport();
    if (!transport) {
        console.warn('SMTP not configured. Verification link:', verifyUrl);
        return { ok: false, previewUrl: verifyUrl };
    }

    try {
        await transport.sendMail({
            from: AUTH_CONFIG.emailFrom,
            to,
            subject,
            text,
            html
        });
        return { ok: true, previewUrl: '' };
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return { ok: false, previewUrl: verifyUrl };
    }
}

export { buildVerifyUrlFromConfig as buildVerifyUrl };
