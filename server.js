require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const path        = require("path");
const http        = require("http");
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

// ── Static file serving ───────────────────────────────────────
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.get("/test", (req, res) => {
    res.json({ success: true, message: "DHAS Backend is running", timestamp: new Date().toISOString() });
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
    console.log(`📱 For mobile: find your IP with "ipconfig" (Windows) or "ifconfig" (Mac/Linux)`);
    console.log(`   Then open: http://<YOUR-LOCAL-IP>:${PORT} on your phone`);
});
