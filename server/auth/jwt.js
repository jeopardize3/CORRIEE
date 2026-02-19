import crypto from 'node:crypto';
import { AUTH_CONFIG, assertJwtSecret } from './config.js';

function base64UrlEncode(value) {
    const json = typeof value === 'string' ? value : JSON.stringify(value);
    return Buffer.from(json)
        .toString('base64')
        .replace(/=+$/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(value) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '==='.slice((normalized.length + 3) % 4);
    return Buffer.from(padded, 'base64').toString('utf8');
}

export function signJwt(payload, options = {}) {
    assertJwtSecret();
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = options.expiresInSec || AUTH_CONFIG.accessTokenMinutes * 60;
    const body = {
        ...payload,
        iat: now,
        exp: now + expiresIn
    };
    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(body);
    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createHmac('sha256', AUTH_CONFIG.jwtSecret)
        .update(unsigned)
        .digest('base64')
        .replace(/=+$/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${unsigned}.${signature}`;
}

export function verifyJwt(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const unsigned = `${header}.${payload}`;
    const expected = crypto
        .createHmac('sha256', AUTH_CONFIG.jwtSecret)
        .update(unsigned)
        .digest('base64')
        .replace(/=+$/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    if (expected.length !== signature.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;

    try {
        const decoded = JSON.parse(base64UrlDecode(payload));
        if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
}
