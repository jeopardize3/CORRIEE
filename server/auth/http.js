import { AUTH_CONFIG } from './config.js';

export function parseCookies(req) {
    const header = (req && req.headers && req.headers.cookie) ? req.headers.cookie : '';
    if (!header) return {};
    const cookies = {};
    header.split(';').forEach((part) => {
        const [rawKey, ...rest] = part.trim().split('=');
        if (!rawKey) return;
        const key = decodeURIComponent(rawKey.trim());
        const value = decodeURIComponent(rest.join('=') || '');
        cookies[key] = value;
    });
    return cookies;
}

export function setCookie(res, name, value, options = {}) {
    if (!res || !name) return;
    const parts = [`${name}=${encodeURIComponent(value)}`];
    parts.push(`Path=${options.path || '/'}`);

    if (options.domain) {
        parts.push(`Domain=${options.domain}`);
    }
    if (typeof options.maxAge === 'number') {
        parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
    }
    if (options.httpOnly !== false) {
        parts.push('HttpOnly');
    }
    if (options.sameSite) {
        parts.push(`SameSite=${options.sameSite}`);
    } else {
        parts.push('SameSite=Lax');
    }
    if (options.secure) {
        parts.push('Secure');
    }

    const header = res.getHeader('Set-Cookie');
    if (!header) {
        res.setHeader('Set-Cookie', parts.join('; '));
        return;
    }
    const next = Array.isArray(header) ? header.concat(parts.join('; ')) : [header, parts.join('; ')];
    res.setHeader('Set-Cookie', next);
}

export function clearCookie(res, name, options = {}) {
    setCookie(res, name, '', {
        ...options,
        maxAge: 0
    });
}

export function sendJson(res, status, payload) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
}

export function sendError(res, status, message, extra = {}) {
    sendJson(res, status, { error: message, ...extra });
}

export async function parseJsonBody(req) {
    if (req && req.body) {
        if (typeof req.body === 'string') {
            try {
                return JSON.parse(req.body);
            } catch (error) {
                return {};
            }
        }
        if (typeof req.body === 'object') return req.body;
    }

    return await new Promise((resolve) => {
        let raw = '';
        req.on('data', (chunk) => {
            raw += chunk;
        });
        req.on('end', () => {
            if (!raw) return resolve({});
            try {
                resolve(JSON.parse(raw));
            } catch (error) {
                resolve({});
            }
        });
        req.on('error', () => resolve({}));
    });
}

export function getRequestOrigin(req) {
    const proto = req.headers['x-forwarded-proto']
        || (req.socket && req.socket.encrypted ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (!host) return '';
    return `${proto}://${host}`;
}

export function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || '';
}

export function applyCors(req, res) {
    const origin = req.headers.origin || '';
    const allowedOrigins = AUTH_CONFIG.allowedOrigins || [];
    const allowAny = allowedOrigins.length === 0;
    const originAllowed = allowAny || (origin && allowedOrigins.includes(origin));

    if (origin && originAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');

    if (req.method === 'OPTIONS') {
        res.statusCode = originAllowed ? 204 : 403;
        res.end();
        return false;
    }

    if (!originAllowed) {
        sendError(res, 403, 'Origin not allowed');
        return false;
    }

    return true;
}
