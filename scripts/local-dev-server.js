/**
 * Local dev server: static files + /api/* without Vercel CLI login.
 * Loads variables from .env in the project root (simple parser, no extra deps).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = path.join(__dirname, '..');
const preferredPort = parseInt(process.env.PORT || '3000', 10);
const portAttempts = Math.max(
    1,
    parseInt(process.env.DEV_PORT_ATTEMPTS || '10', 10),
);
/** Set once the server has bound (may differ if preferred port was busy). */
let listenPort = preferredPort;

/** Load root .env into process.env when keys are unset */
function loadEnvFile() {
    const envPath = path.join(ROOT, '.env');
    if (!fs.existsSync(envPath)) {
        return;
    }
    let text = fs.readFileSync(envPath, 'utf8');
    text = text.replace(/^\uFEFF/, '');
    for (const line of text.split(/\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }
        const eq = trimmed.indexOf('=');
        if (eq === -1) {
            continue;
        }
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
        ) {
            val = val.slice(1, -1);
        }
        const existing = process.env[key];
        // Override missing or empty so a blank Windows user env var can't hide .env values
        if (existing === undefined || existing === '') {
            process.env[key] = val;
        }
    }
}

/** Mimic Vercel helper methods used by api/*.js handlers */
function enhanceResponse(res) {
    res.status = function status(code) {
        res.statusCode = code;
        return res;
    };
    res.json = function json(body) {
        if (!res.getHeader('Content-Type')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        res.end(JSON.stringify(body));
    };
}

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function safeResolve(urlPath) {
    const decoded = decodeURIComponent(urlPath.split('?')[0]);
    const relative = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
    const full = path.join(ROOT, relative);
    if (!full.startsWith(ROOT)) {
        return null;
    }
    return full;
}

function serveStatic(fullPath, res) {
    fs.stat(fullPath, (err, st) => {
        if (err || !st.isFile()) {
            res.statusCode = 404;
            res.end('Not found');
            return;
        }
        const ext = path.extname(fullPath).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        fs.createReadStream(fullPath).pipe(res);
    });
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

const handlers = {
    POST: {
        '/api/submit-quote': require('../api/submit-quote'),
        '/api/submit-comment': require('../api/submit-comment'),
    },
    GET: {
        '/api/get-quotes': require('../api/get-quotes'),
        '/api/get-comments': require('../api/get-comments'),
    },
};

async function handleApi(req, res, pathname, method) {
    enhanceResponse(res);
    const map = handlers[method];
    if (!map) {
        res.status(405).json({ success: false, error: 'Method not allowed' });
        return;
    }
    const handler = map[pathname];
    if (!handler) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
    }

    const host = req.headers.host || `localhost:${listenPort}`;
    const url = new URL(req.url || '/', `http://${host}`);
    req.query = Object.fromEntries(url.searchParams.entries());

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        const raw = await readBody(req);
        req.body = raw.length ? raw : undefined;
    }

    try {
        await handler(req, res);
    } catch (err) {
        console.error('Unhandled API error:', pathname, err);
        if (!res.headersSent) {
            try {
                const { sendApiCatch } = require('../utils/api-helpers');
                sendApiCatch(res, err, pathname);
            } catch {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
            }
        }
    }
}

loadEnvFile();

const requestListener = async (req, res) => {
    try {
        const host = req.headers.host || `localhost:${listenPort}`;
        const url = new URL(req.url || '/', `http://${host}`);
        let pathname = url.pathname.replace(/\/$/, '') || '/';

        if (pathname.startsWith('/api/')) {
            const apiPath =
                pathname.endsWith('/') && pathname.length > 1
                    ? pathname.slice(0, -1)
                    : pathname;
            await handleApi(req, res, apiPath, req.method || 'GET');
            return;
        }

        let filePath =
            pathname === '/' ? path.join(ROOT, 'index.html') : safeResolve(pathname.slice(1));
        if (!filePath) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
        }

        fs.stat(filePath, (err, st) => {
            if (!err && st.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            serveStatic(filePath, res);
        });
    } catch (e) {
        console.error(e);
        if (!res.headersSent) {
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    }
};

/**
 * Try binding starting at `startPort`; on EADDRINUSE try up to portAttempts consecutive ports.
 */
function listenWithFallback(startPort, attemptsLeft) {
    const server = http.createServer(requestListener);

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attemptsLeft > 1) {
            const next = startPort + 1;
            console.warn(`Port ${startPort} is in use, trying ${next}…`);
            listenWithFallback(next, attemptsLeft - 1);
            return;
        }
        console.error(err.message || err);
        if (err.code === 'EADDRINUSE') {
            console.error('No free port in range. Stop the other app or set a different port, e.g.');
            console.error('  PowerShell:  $env:PORT=3001; npm run dev');
            console.error('  cmd.exe:     set PORT=3001&& npm run dev');
        }
        process.exit(1);
    });

    server.listen(startPort, () => {
        const addr = server.address();
        listenPort = typeof addr === 'object' && addr && addr.port ? addr.port : startPort;
        console.log(`Nameless Ink local server http://localhost:${listenPort}`);
        console.log(`LOCAL_DEV=${process.env.LOCAL_DEV || '(unset)'}`);
    });
}

listenWithFallback(preferredPort, portAttempts);
