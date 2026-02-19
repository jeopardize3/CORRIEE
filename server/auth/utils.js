export function parseCsv(value) {
    return (value || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
}

export function safeJsonParse(value, fallback) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

export function toSafeString(value) {
    return (value == null) ? '' : String(value);
}
