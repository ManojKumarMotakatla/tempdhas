require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const path        = require("path");
const http        = require("http");
const fs          = require("fs");
const crypto      = require("crypto");
const rateLimit   = require("express-rate-limit");

const app = express();

const httpServer = http.createServer(app);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3006";

app.use(cors({
    origin: true,
    credentials: true
}));

app.options("/{*splat}", cors());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
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
// CACHING / CACHE-BUSTING
// ════════════════════════════════════════════════════════════════

const assetVersionCache = new Map();

function getAssetVersion(absPath) {
    if (assetVersionCache.has(absPath)) return assetVersionCache.get(absPath);
    try {
        const buf  = fs.readFileSync(absPath);
        const hash = crypto.createHash("md5").update(buf).digest("hex").slice(0, 10);
        assetVersionCache.set(absPath, hash);
        return hash;
    } catch {
        const fallback = String(BOOT_ID);
        assetVersionCache.set(absPath, fallback);
        return fallback;
    }
}

const BOOT_ID = process.env.RENDER_GIT_COMMIT || Date.now().toString();

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

app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        try {
            const contentType = res.get("Content-Type") || "";
            if (typeof body === "string" && contentType.includes("text/html")) {
                body = body.replace(
                    /(src|href)="((?:\.\/)?(?:js|css)\/[^"?]+\.(?:js|css))"/g,
                    (match, attr, assetPath) => {
                        const cleanPath = assetPath.replace(/^\.\//, "").replace(/^\//, "");
                        const absPath = path.join(__dirname, "frontend", cleanPath);
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
const chatRoutes        = require("./Backend/routes/chatRoutes");
const keyRoutes         = require("./Backend/routes/keyRoutes");

app.use("/login",                  authLimiter);
app.use("/register",               authLimiter);
app.use("/auth/google",            authLimiter);
app.use("/forgot-password",        authLimiter);
app.use("/reset-password",         authLimiter);
app.use("/email-otp/send",         authLimiter);
app.use("/email-otp/confirm",      authLimiter);
app.use("/doctor/login",           authLimiter);
app.use("/doctor/register",        authLimiter);
app.use("/doctor/forgot-password", authLimiter);
app.use("/doctor/reset-password",  authLimiter);

app.use("/",              authRoutes);
app.use("/profile",       profileRoutes);
app.use("/symptoms",      symptomRoutes);
app.use("/reminders",     reminderRoutes);
app.use("/reminder-logs", reminderLogRoutes);
app.use("/reports",       reportRoutes);
app.use("/doctor",        doctorRoutes);
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

const { initSocket } = require("./Backend/config/socket");

const buildAllowedOrigins = () => {
    const regexes = [
        /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/,
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        /^https:\/\/[^.]+\.onrender\.com$/,
    ];

    if (ALLOWED_ORIGIN && !ALLOWED_ORIGIN.includes("localhost")) {
        try {
            regexes.push(new RegExp(`^${ALLOWED_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
        } catch (_) {}
    }

    const extra = process.env.ALLOWED_ORIGINS || "";
    extra.split(",").map(s => s.trim()).filter(Boolean).forEach(origin => {
        try {
            regexes.push(new RegExp(`^${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
        } catch (_) {}
    });

    return regexes;
};

initSocket(httpServer, buildAllowedOrigins());

const PORT = process.env.PORT || 3006;

httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ DHAS Server running on http://localhost:${PORT}`);
    console.log(`💬 Chat (REST + Socket.IO) is live on the same port`);
    console.log(`📦 Reports stored in MySQL database (no disk storage)`);
    console.log(`🏗️  Build id: ${BOOT_ID}`);
    console.log(`📱 For mobile: find your IP with "ipconfig" (Windows) or "ifconfig" (Mac/Linux)`);
    console.log(`   Then open: http://<YOUR-LOCAL-IP>:${PORT} on your phone`);
});