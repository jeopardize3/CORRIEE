import { randomId } from './crypto.js';

export function normalizeEmail(value) {
    return (value || '').toString().trim().toLowerCase();
}

export function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

export function validatePassword(value) {
    return /[A-Z]/.test(value || '')
        && /[a-z]/.test(value || '')
        && /\d/.test(value || '')
        && (value || '').length >= 8;
}

export function buildUsername(firstName, lastName, email) {
    const clean = (value) => (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
    const first = clean(firstName);
    const last = clean(lastName);
    if (first || last) return `${first}${last}`;
    if (email) return clean(email.split('@')[0]);
    return 'member';
}

export function createUserId() {
    return randomId('user');
}

export function sanitizeUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phone: user.phone || null,
        createdAt: user.createdAt || null,
        verified: !!user.verified,
        username: user.username || null,
        avatarUrl: user.avatarUrl || user.avatar || user.photoUrl || null
    };
}
