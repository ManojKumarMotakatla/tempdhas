require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const path        = require("path");
const http        = require("http");
const fs          = require("fs");
const crypto      = require("crypto");
const rateLimit   = require("express-rate-limit");

const app = express();

// ── CHANGED: create an explicit http.Server so Socket.IO can attach
//             to the SAME server/port as Express. Previously the app
//             called app.listen() directly, which gave Socket.IO
//             nothing to bind to — this was the #1 reason chat never
//             worked: there was no socket endpoint at all. ──
const httpServer = http.createServer(app);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3007";

app.use(cors({
    origin: true,
    credentials: true
}));

app.options("/{*splat}", cors());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:5000,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: "Too many requests. Please wait a few minutes." }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: "Too many login attempts. Please wait 15 minutes." }
});

app.use(globalLimiter);

// ── Body parser — large enough for base64 report uploads ─────
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ limit: "12mb", extended: true }));
app.use((req, res, next) => {
    console.log("====== BODY DEBUG ======");
    console.log(req.method, req.originalUrl);
    console.log("Headers:", req.headers["content-type"]);
    console.log("Body:", req.body);
    next();
});

// ════════════════════════════════════════════════════════════════
// CACHING / CACHE-BUSTING (NEW)
//
// Problem this solves: mobile Chrome (especially via the registered
// Service Worker, sw.js) was serving stale HTML/JS/CSS after every
// deploy because nothing invalidated old cache entries automatically.
//
// Strategy:
//   - HTML: never cached (always revalidated) so navigations always
//     get the latest markup.
//   - JS/CSS: cached for a full year as "immutable", BUT every local
//     <script src="/js/..."> / <link href="/css/...">  reference
//     inside HTML responses gets an automatic "?v=<content-hash>"
//     query string appended. When a file's content changes, its hash
//     changes, the URL changes, and the browser is forced to fetch
//     the new version — no manual "?v=1, v=2, v=3" editing required.
//   - Images/fonts/other static assets: long-lived immutable caching.
//   - A tiny /build-id.js endpoint exposes a per-deploy build id
//     (Render's git commit SHA, falling back to process start time)
//     so the Service Worker (sw.js) can version its own cache name
//     automatically instead of relying on a hardcoded string that
//     has to be bumped by hand on every deploy.
// ════════════════════════════════════════════════════════════════

// Content-hash cache for local static assets — computed once per file
// per process lifetime. Render restarts the process on every deploy,
// so this is naturally fresh after every deployment with zero manual
// version bumps required.
const assetVersionCache = new Map();

function getAssetVersion(absPath) {
    if (assetVersionCache.has(absPath)) return assetVersionCache.get(absPath);
    try {
        const buf  = fs.readFileSync(absPath);
        const hash = crypto.createHash("md5").update(buf).digest("hex").slice(0, 10);
        assetVersionCache.set(absPath, hash);
        return hash;
    } catch {
        // File not found or unreadable — fall back to a per-boot value
        // so the URL still changes across deploys even if we can't hash it.
        const fallback = String(BOOT_ID);
        assetVersionCache.set(absPath, fallback);
        return fallback;
    }
}

// Per-process boot identifier, used as a fallback version and exposed
// to the client via /build-id.js so the Service Worker can namespace
// its cache per-deploy automatically.
const BOOT_ID = process.env.RENDER_GIT_COMMIT || Date.now().toString();

// Sets the correct Cache-Control header per file type for every
// response served through express.static below.
function staticCacheHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
    } else if (/\.(js|css)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else if (/\.(png|jpg|jpeg|svg|webp|gif|ico|woff2?)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
        res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
    }
}

// Rewrites local /js/*.js and /css/*.css references inside HTML
// responses to include an automatic "?v=<content-hash>" so browsers
// always fetch a fresh URL whenever the referenced file's content
// changes. Only touches text/html responses; every other response
// (JSON APIs, files, etc.) passes through completely untouched.
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        try {
            const contentType = res.get("Content-Type") || "";
            if (typeof body === "string" && contentType.includes("text/html")) {
                body = body.replace(
                    /(src|href)="(\/(?:js|css)\/[^"?]+\.(?:js|css))"/g,
                    (match, attr, assetPath) => {
                        const absPath = path.join(__dirname, "frontend", assetPath);
                        const v = getAssetVersion(absPath);
                        return `${attr}="${assetPath}?v=${v}"`;
                    }
                );
            }
        } catch (e) {
            console.warn("HTML asset-version rewrite skipped:", e.message);
        }
        return originalSend.call(this, body);
    };
    next();
});

// ── Static file serving ───────────────────────────────────────
// CHANGED: added etag/lastModified (explicit, though these are
// express.static defaults) and setHeaders: staticCacheHeaders so
// HTML/JS/CSS/images each get the correct Cache-Control policy.
app.use(express.static(path.join(__dirname, "frontend"), {
    etag: true,
    lastModified: true,
    setHeaders: staticCacheHeaders
}));
app.use(express.static(path.join(__dirname), {
    etag: true,
    lastModified: true,
    setHeaders: staticCacheHeaders
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.get("/test", (req, res) => {
    res.json({ success: true, message: "DHAS Backend is running", timestamp: new Date().toISOString() });
});

// ── NEW: exposes a per-deploy build id to the client so the Service
// Worker (sw.js) can version its cache name automatically. Uses
// Render's injected git commit SHA when available, otherwise falls
// back to the process boot time — either way this value changes on
// every deploy without any manual edits. ──
app.get("/build-id.js", (req, res) => {
    res.type("application/javascript");
    res.set("Cache-Control", "no-cache, must-revalidate");
    res.send(`window.__BUILD_ID = "${BOOT_ID}";`);
});

const authRoutes        = require("./Backend/routes/authRoutes");
const symptomRoutes     = require("./Backend/routes/symptomRoutes");
const reminderRoutes    = require("./Backend/routes/reminderRoutes");
const reminderLogRoutes = require("./Backend/routes/reminderlogroutes");
const reportRoutes      = require("./Backend/routes/reportRoutes");
const profileRoutes     = require("./Backend/routes/profileRoutes");
const doctorRoutes      = require("./Backend/routes/doctorRoutes");
// ── NEW: chat + E2E key-exchange routes ──
const chatRoutes        = require("./Backend/routes/chatRoutes");
const keyRoutes         = require("./Backend/routes/keyRoutes");

app.use("/login",       authLimiter);
app.use("/register",    authLimiter);
app.use("/auth/google", authLimiter);
app.use("/doctor/login",    authLimiter);
app.use("/doctor/register", authLimiter);

app.use("/",              authRoutes);
app.use("/profile",       profileRoutes);
app.use("/symptoms",      symptomRoutes);
app.use("/reminders",     reminderRoutes);
app.use("/reminder-logs", reminderLogRoutes);
app.use("/reports",       reportRoutes);
app.use("/doctor",        doctorRoutes);
// ── NEW: mount chat + keys (previously missing entirely) ──
app.use("/chat",          chatRoutes);
app.use("/keys",          keyRoutes);

app.use("/{*splat}", (req, res) => {
    if (req.accepts("html") && !req.path.startsWith("/api")) {
        return res.status(404).sendFile(path.join(__dirname, "frontend", "404.html"), (err) => {
            if (err) res.status(404).json({ success: false, message: "Not found." });
        });
    }
    res.status(404).json({ success: false, message: "Not found." });
});

app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "File too large. Maximum size is 10 MB." });
    }
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ success: false, message: "CORS policy blocked this request." });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
});

// ── NEW: initialise Socket.IO on the SAME http.Server/port.
//          allowedOriginRegexes mirrors isAllowedOrigin() above so
//          the websocket handshake uses identical CORS rules to the
//          REST API instead of duplicating a separate origin list. ──
const { initSocket } = require("./Backend/config/socket");

// Build the list of allowed Socket.IO origins.
// On Render the same process serves both the static files and the API,
// so the frontend origin IS the backend origin — we need to allow it.
const buildAllowedOrigins = () => {
    const regexes = [
        /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/,
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        // Allow HTTPS on any *.onrender.com subdomain (Render free tier)
        /^https:\/\/[^.]+\.onrender\.com$/,
    ];

    // ALLOWED_ORIGIN single env var (legacy)
    if (ALLOWED_ORIGIN && !ALLOWED_ORIGIN.includes("localhost")) {
        try {
            regexes.push(new RegExp(`^${ALLOWED_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
        } catch (_) {}
    }

    // ALLOWED_ORIGINS multi-value env var (comma-separated)
    const extra = process.env.ALLOWED_ORIGINS || "";
    extra.split(",").map(s => s.trim()).filter(Boolean).forEach(origin => {
        try {
            regexes.push(new RegExp(`^${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
        } catch (_) {}
    });

    return regexes;
};

initSocket(httpServer, buildAllowedOrigins());

const PORT = process.env.PORT || 3007;

// ── CHANGED: listen on httpServer instead of app, so both Express
//             routes AND Socket.IO share one port. ──
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ DHAS Server running on http://localhost:${PORT}`);
    console.log(`💬 Chat (REST + Socket.IO) is live on the same port`);
    console.log(`📦 Reports stored in MySQL database (no disk storage)`);
    console.log(`🏗️  Build id: ${BOOT_ID}`);
    console.log(`📱 For mobile: find your IP with "ipconfig" (Windows) or "ifconfig" (Mac/Linux)`);
    console.log(`   Then open: http://<YOUR-LOCAL-IP>:${PORT} on your phone`);
});
