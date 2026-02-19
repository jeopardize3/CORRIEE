import http from 'node:http';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MAX_BODY_SIZE = 1_000_000;

await loadEnv();

const csrfHandler = (await import('../api/auth/csrf.js')).default;
const loginHandler = (await import('../api/auth/login.js')).default;
const logoutHandler = (await import('../api/auth/logout.js')).default;
const meHandler = (await import('../api/auth/me.js')).default;
const refreshHandler = (await import('../api/auth/refresh.js')).default;
const resendHandler = (await import('../api/auth/resend-verification.js')).default;
const signupHandler = (await import('../api/auth/signup.js')).default;
const verifyHandler = (await import('../api/auth/verify-email.js')).default;
const recaptchaHandler = (await import('../api/recaptcha-verify.js')).default;

const apiRoutes = new Map([
    ['/api/auth/csrf', csrfHandler],
    ['/api/auth/login', loginHandler],
    ['/api/auth/logout', logoutHandler],
    ['/api/auth/me', meHandler],
    ['/api/auth/refresh', refreshHandler],
    ['/api/auth/resend-verification', resendHandler],
    ['/api/auth/signup', signupHandler],
    ['/api/auth/verify-email', verifyHandler],
    ['/api/recaptcha-verify', recaptchaHandler]
]);

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.map': 'application/json; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
    try {
        const hostHeader = req.headers.host || `${HOST}:${PORT}`;
        const base = hostHeader.startsWith('http://') || hostHeader.startsWith('https://')
            ? hostHeader
            : `http://${hostHeader}`;
        const url = new URL(req.url || '/', base);
        const pathname = url.pathname || '/';
        req.query = Object.fromEntries(url.searchParams.entries());

        if (pathname.startsWith('/api/')) {
            await handleApiRequest(req, res, pathname);
            return;
        }

        await serveStatic(req, res, pathname);
    } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Server error');
    }
});

server.listen(PORT, HOST, () => {
    console.log(`CORRIESELLS server running at http://${HOST}:${PORT}`);
});

async function handleApiRequest(req, res, pathname) {
    const handler = apiRoutes.get(pathname);
    if (!handler) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
    }

    if (!(await attachBody(req, res))) return;
    await handler(req, res);
}

async function attachBody(req, res) {
    const method = (req.method || 'GET').toUpperCase();
    if (method === 'GET' || method === 'HEAD') {
        req.body = '';
        return true;
    }

    return await new Promise((resolve) => {
        const chunks = [];
        let size = 0;

        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_BODY_SIZE) {
                res.statusCode = 413;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'Payload too large' }));
                req.destroy();
                resolve(false);
                return;
            }
            chunks.push(chunk);
        });

        req.on('end', () => {
            req.body = Buffer.concat(chunks).toString('utf8');
            resolve(true);
        });

        req.on('error', () => {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Bad request' }));
            resolve(false);
        });
    });
}

async function serveStatic(req, res, pathname) {
    let decodedPathname = pathname;
    try {
        decodedPathname = decodeURIComponent(pathname);
    } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Bad request');
        return;
    }

    let filePath = decodedPathname === '/' ? '/index.html' : decodedPathname;
    filePath = filePath.replace(/^\/+/, '');
    const resolvedPath = path.normalize(path.join(ROOT_DIR, filePath));

    if (!resolvedPath.startsWith(ROOT_DIR)) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Forbidden');
        return;
    }

    try {
        let stats = await fs.stat(resolvedPath);
        if (stats.isDirectory()) {
            const indexPath = path.join(resolvedPath, 'index.html');
            stats = await fs.stat(indexPath);
            filePath = path.join(filePath, 'index.html');
        }
    } catch (error) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Not found');
        return;
    }

    const finalPath = path.normalize(path.join(ROOT_DIR, filePath));
    if (!finalPath.startsWith(ROOT_DIR)) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Forbidden');
        return;
    }

    try {
        const data = await fs.readFile(finalPath);
        const ext = path.extname(finalPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        if (ext === '.html') {
            res.setHeader('Cache-Control', 'no-cache');
        }
        res.end(data);
    } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Server error');
    }
}

async function loadEnv() {
    const envPath = path.join(ROOT_DIR, '.env');
    try {
        const raw = await fs.readFile(envPath, 'utf8');
        raw.split(/\r?\n/).forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const idx = trimmed.indexOf('=');
            if (idx < 0) return;
            const key = trimmed.slice(0, idx).trim();
            let value = trimmed.slice(idx + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (!(key in process.env)) {
                process.env[key] = value;
            }
        });
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn('Unable to load .env:', error.message);
        }
    }
}
