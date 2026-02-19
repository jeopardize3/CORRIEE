import { AUTH_CONFIG } from './config.js';
import { parseCookies, setCookie, sendError } from './http.js';
import { randomToken } from './crypto.js';

function getCookieOptions(req) {
    const proto = req.headers['x-forwarded-proto'] || (req.socket && req.socket.encrypted ? 'https' : 'http');
    const secure = proto === 'https';
    return {
        httpOnly: false,
        sameSite: 'Lax',
        secure,
        path: '/',
        domain: AUTH_CONFIG.cookieDomain || undefined
    };
}

function normalizeToken(value) {
    return (value || '').toString().trim();
}

export function ensureCsrfToken(req, res) {
    const cookies = parseCookies(req);
    const existing = normalizeToken(cookies[AUTH_CONFIG.csrfCookieName]);
    if (existing && existing.length >= 24) {
        return existing;
    }
    const token = randomToken(24);
    setCookie(res, AUTH_CONFIG.csrfCookieName, token, getCookieOptions(req));
    return token;
}

export function requireCsrf(req, res) {
    const cookies = parseCookies(req);
    const cookieToken = normalizeToken(cookies[AUTH_CONFIG.csrfCookieName]);
    const headerToken = normalizeToken(req.headers['x-csrf-token'] || req.headers['csrf-token']);

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        sendError(res, 403, 'Invalid CSRF token.');
        return false;
    }

    return true;
}
