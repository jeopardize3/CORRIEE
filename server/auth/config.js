import { parseCsv } from './utils.js';

const DEFAULT_JWT_SECRET = 'change-this-in-production';

function toInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toMs(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

const allowedOrigins = parseCsv(process.env.ALLOWED_ORIGINS || process.env.AUTH_ALLOWED_ORIGINS || '');

export const AUTH_CONFIG = {
    accessTokenMinutes: toInt(process.env.AUTH_ACCESS_MINUTES, 15),
    refreshTokenDays: toInt(process.env.AUTH_REFRESH_DAYS, 7),
    refreshTokenDaysRemember: toInt(process.env.AUTH_REFRESH_DAYS_REMEMBER, 30),
    jwtSecret: (process.env.AUTH_JWT_SECRET || DEFAULT_JWT_SECRET).trim(),
    cookieName: (process.env.AUTH_REFRESH_COOKIE || 'corriesells_refresh').trim(),
    cookieDomain: (process.env.AUTH_COOKIE_DOMAIN || '').trim(),
    csrfCookieName: (process.env.AUTH_CSRF_COOKIE || 'corriesells_csrf').trim(),
    appBaseUrl: (process.env.AUTH_APP_URL || '').trim(),
    verifyUrl: (process.env.AUTH_VERIFY_URL || '').trim(),
    emailFrom: (process.env.AUTH_EMAIL_FROM || 'CORRIESELLS <no-reply@corriesells.com>').trim(),
    exposeVerifyUrl: (process.env.AUTH_EXPOSE_VERIFY_URL || '').toLowerCase() === 'true'
        || (process.env.NODE_ENV || '').toLowerCase() !== 'production',
    allowedOrigins,
    rateLimits: {
        default: {
            windowMs: toMs(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 60_000),
            max: toInt(process.env.AUTH_RATE_LIMIT_MAX, 20)
        },
        login: {
            windowMs: toMs(process.env.AUTH_RATE_LIMIT_LOGIN_WINDOW_MS, 60_000),
            max: toInt(process.env.AUTH_RATE_LIMIT_LOGIN_MAX, 10)
        },
        signup: {
            windowMs: toMs(process.env.AUTH_RATE_LIMIT_SIGNUP_WINDOW_MS, 60_000),
            max: toInt(process.env.AUTH_RATE_LIMIT_SIGNUP_MAX, 5)
        },
        resend: {
            windowMs: toMs(process.env.AUTH_RATE_LIMIT_RESEND_WINDOW_MS, 300_000),
            max: toInt(process.env.AUTH_RATE_LIMIT_RESEND_MAX, 3)
        },
        verify: {
            windowMs: toMs(process.env.AUTH_RATE_LIMIT_VERIFY_WINDOW_MS, 60_000),
            max: toInt(process.env.AUTH_RATE_LIMIT_VERIFY_MAX, 10)
        },
        refresh: {
            windowMs: toMs(process.env.AUTH_RATE_LIMIT_REFRESH_WINDOW_MS, 60_000),
            max: toInt(process.env.AUTH_RATE_LIMIT_REFRESH_MAX, 30)
        },
        logout: {
            windowMs: toMs(process.env.AUTH_RATE_LIMIT_LOGOUT_WINDOW_MS, 60_000),
            max: toInt(process.env.AUTH_RATE_LIMIT_LOGOUT_MAX, 20)
        }
    },
    smtp: {
        host: (process.env.AUTH_SMTP_HOST || '').trim(),
        port: toInt(process.env.AUTH_SMTP_PORT, 587),
        secure: (process.env.AUTH_SMTP_SECURE || '').toLowerCase() === 'true',
        user: (process.env.AUTH_SMTP_USER || '').trim(),
        pass: (process.env.AUTH_SMTP_PASS || '').trim()
    }
};

export function isProduction() {
    return (process.env.NODE_ENV || '').toLowerCase() === 'production';
}

export function hasValidJwtSecret() {
    return AUTH_CONFIG.jwtSecret && AUTH_CONFIG.jwtSecret !== DEFAULT_JWT_SECRET;
}

export function assertJwtSecret() {
    if (isProduction() && !hasValidJwtSecret()) {
        throw new Error('AUTH_JWT_SECRET is required in production.');
    }
}
