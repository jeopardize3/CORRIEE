import { AUTH_CONFIG } from './config.js';
import { hashToken, randomToken } from './crypto.js';
import { parseCookies, setCookie, clearCookie, getClientIp } from './http.js';
import { signJwt } from './jwt.js';
import { isSessionExpired } from './store.js';

function getCookieOptions(req, rememberMe) {
    const proto = req.headers['x-forwarded-proto'] || (req.socket && req.socket.encrypted ? 'https' : 'http');
    const secure = proto === 'https';
    const options = {
        httpOnly: true,
        sameSite: 'Lax',
        secure,
        path: '/',
        domain: AUTH_CONFIG.cookieDomain || undefined
    };
    if (rememberMe) {
        const ttlSeconds = AUTH_CONFIG.refreshTokenDaysRemember * 24 * 60 * 60;
        options.maxAge = ttlSeconds;
    }
    return options;
}

export function createSession({ store, userId, rememberMe, req, res }) {
    const sessionId = `sess_${randomToken(12)}`;
    const refreshToken = randomToken(32);
    const refreshTokenHash = hashToken(refreshToken);
    const now = Date.now();
    const ttlDays = rememberMe ? AUTH_CONFIG.refreshTokenDaysRemember : AUTH_CONFIG.refreshTokenDays;
    const expiresAt = new Date(now + ttlDays * 24 * 60 * 60 * 1000).toISOString();

    const session = {
        id: sessionId,
        userId,
        refreshTokenHash,
        createdAt: new Date(now).toISOString(),
        expiresAt,
        remember: !!rememberMe,
        userAgent: req.headers['user-agent'] || '',
        ip: getClientIp(req)
    };
    store.sessions.push(session);

    const cookieValue = `${sessionId}.${refreshToken}`;
    setCookie(res, AUTH_CONFIG.cookieName, cookieValue, getCookieOptions(req, rememberMe));

    const accessToken = signJwt({ sub: userId, sid: sessionId });
    return { accessToken, session };
}

export function getSessionFromRequest(req, store) {
    const cookies = parseCookies(req);
    const raw = cookies[AUTH_CONFIG.cookieName];
    if (!raw) return null;
    const [sessionId, refreshToken] = raw.split('.');
    if (!sessionId || !refreshToken) return null;
    const session = store.sessions.find((entry) => entry.id === sessionId);
    if (!session) return null;
    if (isSessionExpired(session)) return null;
    return { session, refreshToken };
}

export function rotateSession({ store, session, req, res }) {
    const refreshToken = randomToken(32);
    session.refreshTokenHash = hashToken(refreshToken);
    if (session.remember) {
        const ttlMs = AUTH_CONFIG.refreshTokenDaysRemember * 24 * 60 * 60 * 1000;
        session.expiresAt = new Date(Date.now() + ttlMs).toISOString();
    }
    const cookieValue = `${session.id}.${refreshToken}`;
    setCookie(res, AUTH_CONFIG.cookieName, cookieValue, getCookieOptions(req, session.remember));
    const accessToken = signJwt({ sub: session.userId, sid: session.id });
    return { accessToken, session };
}

export function clearSessionCookie(req, res) {
    clearCookie(res, AUTH_CONFIG.cookieName, getCookieOptions(req, true));
}
