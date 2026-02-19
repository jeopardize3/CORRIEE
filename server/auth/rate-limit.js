import { AUTH_CONFIG } from './config.js';
import { getClientIp, sendJson } from './http.js';

const RATE_LIMIT_STORE = new Map();

function getBucketKey(key, ip) {
    return `${key}:${ip}`;
}

function getRateLimitConfig(key) {
    const defaults = AUTH_CONFIG.rateLimits || {};
    return defaults[key] || defaults.default || { windowMs: 60_000, max: 20 };
}

export function checkRateLimit(req, res, key) {
    const ip = getClientIp(req) || 'unknown';
    const config = getRateLimitConfig(key);
    const bucketKey = getBucketKey(key, ip);
    const now = Date.now();
    const entry = RATE_LIMIT_STORE.get(bucketKey);

    if (!entry || now >= entry.resetAt) {
        RATE_LIMIT_STORE.set(bucketKey, { count: 1, resetAt: now + config.windowMs });
        return true;
    }

    if (entry.count >= config.max) {
        const retryAfter = Math.max(0, Math.ceil((entry.resetAt - now) / 1000));
        res.setHeader('Retry-After', retryAfter.toString());
        sendJson(res, 429, {
            error: 'Too many requests. Please try again shortly.'
        });
        return false;
    }

    entry.count += 1;
    return true;
}

export function resetRateLimits() {
    RATE_LIMIT_STORE.clear();
}
