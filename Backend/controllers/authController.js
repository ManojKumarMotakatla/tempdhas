// ── CHANGED: P1.4 — no SQL error details sent to client
//            P5.2/P5.3 — backend input validation added
//            NEW — forgot / reset password via Brevo email
//            NEW — email OTP verification required before account creation
const db     = require("../config/db");
const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail, sendOtpEmail } = require("../utils/email");

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

function signToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

function isValidEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function isStrongPassword(password) {
    return (
        typeof password === "string" &&
        password.length >= 6 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}

function safeName(name) {
    return typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 100;
}

function generateOtp() {
    const n = crypto.randomInt(0, 1000000);
    return String(n).padStart(OTP_LENGTH, "0");
}

/**
 * Returns true if this email has a non-expired, verified OTP row.
 */
async function isEmailOtpVerified(email) {
    const normalized = email.trim().toLowerCase();
    const [rows] = await db.promise().query(
        `SELECT id FROM email_otps
         WHERE email = ? AND verified = 1 AND expires_at > NOW()
         ORDER BY id DESC LIMIT 1`,
        [normalized]
    );
    return rows.length > 0;
}

/* ── SEND EMAIL OTP ───────────────────────────────────────────────────── */
const sendEmailOtp = async (req, res) => {
    const { email, name } = req.body;

    if (!email || !isValidEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email address." });
    }

    const normalized = email.trim().toLowerCase();

    try {
        const [users] = await db.promise().query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [normalized]
        );
        if (users.length > 0) {
            return res.json({
                success: false,
                message: "This email is already registered. Please login.",
                alreadyExists: true
            });
        }

        const [doctors] = await db.promise().query(
            "SELECT id FROM doctors WHERE email = ? LIMIT 1",
            [normalized]
        );
        if (doctors.length > 0) {
            return res.json({
                success: false,
                message: "This email is already registered as a doctor. Please login.",
                alreadyExists: true
            });
        }

        await db.promise().query(
            "UPDATE email_otps SET verified = 0 WHERE email = ? AND verified = 0",
            [normalized]
        );

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await db.promise().query(
            `INSERT INTO email_otps (email, otp, verified, expires_at)
             VALUES (?, ?, 0, ?)`,
            [normalized, otp, expiresAt]
        );

        const emailResult = await sendOtpEmail({
            toEmail: normalized,
            toName:  (typeof name === "string" && name.trim()) || "there",
            otp
        });

        if (!emailResult.success) {
            console.error("Failed to send OTP email:", emailResult.error);
            return res.json({
                success: false,
                message: "Could not send verification email. Please try again in a moment."
            });
        }

        return res.json({
            success: true,
            message: `Verification code sent to ${normalized}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`
        });
    } catch (err) {
        console.error("sendEmailOtp error:", err.message);
        return res.json({ success: false, message: "Something went wrong. Please try again." });
    }
};

/* ── CONFIRM EMAIL OTP ────────────────────────────────────────────────── */
const confirmEmailOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !isValidEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email address." });
    }
    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
        return res.json({ success: false, message: "Please enter the 6-digit verification code." });
    }

    const normalized = email.trim().toLowerCase();
    const code = otp.trim();

    try {
        const [rows] = await db.promise().query(
            `SELECT id, otp, verified, expires_at FROM email_otps
             WHERE email = ?
             ORDER BY id DESC LIMIT 1`,
            [normalized]
        );

        if (rows.length === 0) {
            return res.json({
                success: false,
                message: "No verification code found for this email. Please request a new one."
            });
        }

        const row = rows[0];

        if (new Date(row.expires_at) <= new Date()) {
            return res.json({
                success: false,
                message: "This verification code has expired. Please request a new one."
            });
        }

        if (row.verified === 1) {
            return res.json({ success: true, message: "Email already verified. You can create your account." });
        }

        if (row.otp !== code) {
            return res.json({ success: false, message: "Incorrect verification code. Please try again." });
        }

        await db.promise().query(
            "UPDATE email_otps SET verified = 1, verified_at = NOW() WHERE id = ?",
            [row.id]
        );

        return res.json({
            success: true,
            message: "Email verified successfully. You can now create your account."
        });
    } catch (err) {
        console.error("confirmEmailOtp error:", err.message);
        return res.json({ success: false, message: "Something went wrong. Please try again." });
    }
};

/* ── REGISTER ─────────────────────────────────────────────────────────── */
const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!safeName(name)) {
        return res.json({ success: false, message: "Full name must be 2–100 characters." });
    }
    if (!isValidEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email address." });
    }
    if (!isStrongPassword(password)) {
        return res.json({
            success: false,
            message: "Password must be at least 6 characters and include uppercase, lowercase, number, and symbol."
        });
    }

    const normalized = email.trim().toLowerCase();

    try {
        const verified = await isEmailOtpVerified(normalized);
        if (!verified) {
            return res.json({
                success: false,
                message: "Please verify your email with the OTP code before creating an account.",
                needsOtp: true
            });
        }

        const [existing] = await db.promise().query(
            "SELECT id FROM users WHERE email = ?",
            [normalized]
        );

        if (existing.length > 0) {
            return res.json({
                success: false,
                message: "This email is already registered. Please login.",
                alreadyExists: true
            });
        }

        const salt       = await bcrypt.genSalt(10);
        const bcryptHash = await bcrypt.hash(password, salt);

        await db.promise().query(
            "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())",
            [name.trim(), normalized, bcryptHash]
        );

        await db.promise().query(
            "UPDATE email_otps SET verified = 0 WHERE email = ? AND verified = 1",
            [normalized]
        );

        res.json({ success: true, message: "Account created successfully! Please login." });
    } catch (error) {
        console.error("Register error:", error.message);
        return res.json({ success: false, message: "Server error. Please try again later." });
    }
};

/* ── LOGIN ────────────────────────────────────────────────────────────── */
const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required." });
    }
    if (!isValidEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email address." });
    }

    db.query(
        "SELECT id, name, email, password FROM users WHERE email = ?",
        [email.trim().toLowerCase()],
        async (err, result) => {
            if (err) {
                console.error("Login query error:", err.message);
                return res.json({ success: false, message: "Login failed. Please try again." });
            }

            if (result.length === 0) {
                return res.json({
                    success: false,
                    message: "No account found with this email. Please register first.",
                    notRegistered: true
                });
            }

            const user = result[0];

            if (!user.password) {
                return res.json({
                    success: false,
                    message: "This account uses Google Sign-In. Please login with Google."
                });
            }

            try {
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return res.json({ success: false, message: "Incorrect password. Please try again." });
                }

                const token = signToken(user.id);
                res.json({
                    success: true,
                    message: "Login successful!",
                    token,
                    user: { id: user.id, name: user.name, email: user.email }
                });
            } catch (error) {
                console.error("Bcrypt compare error:", error.message);
                return res.json({ success: false, message: "Authentication error. Please try again." });
            }
        }
    );
};

/* ── GOOGLE AUTH ──────────────────────────────────────────────────────── */
const googleAuth = (req, res) => {
    const { name, email, google_id } = req.body;

    if (!email || !google_id) {
        return res.status(400).json({ success: false, message: "Missing Google credentials." });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email from Google." });
    }

    db.query(
        "SELECT * FROM users WHERE google_id = ? OR email = ?",
        [google_id, email.trim().toLowerCase()],
        (err, rows) => {
            if (err) {
                console.error("Google auth query error:", err.message);
                return res.json({ success: false, message: "Login failed. Please try again." });
            }

            if (rows.length > 0) {
                const user = rows[0];

                if (!user.google_id) {
                    db.query(
                        "UPDATE users SET google_id = ?, provider = 'google' WHERE id = ?",
                        [google_id, user.id],
                        (err2) => {
                            if (err2) {
                                console.error("Google link error:", err2.message);
                                return res.json({ success: false, message: "Failed to link Google account." });
                            }
                            const token = signToken(user.id);
                            return res.json({
                                success: true,
                                token,
                                user: { id: user.id, name: user.name, email: user.email }
                            });
                        }
                    );
                } else {
                    const token = signToken(user.id);
                    return res.json({
                        success: true,
                        token,
                        user: { id: user.id, name: user.name, email: user.email }
                    });
                }
            } else {
                const insertSql = `
                    INSERT INTO users (name, email, password, provider, google_id, created_at)
                    VALUES (?, ?, NULL, 'google', ?, NOW())
                `;
                db.query(insertSql, [name || "User", email.trim().toLowerCase(), google_id], (err2, result) => {
                    if (err2) {
                        console.error("Google register error:", err2.message);
                        return res.json({ success: false, message: "Failed to create account. Please try again." });
                    }
                    const token = signToken(result.insertId);
                    res.json({
                        success: true,
                        token,
                        user: { id: result.insertId, name: name || "User", email: email.trim().toLowerCase() }
                    });
                });
            }
        }
    );
};

/* ── FORGOT PASSWORD (patient) ────────────────────────────────────────── */
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email address." });
    }

    const normalized = email.trim().toLowerCase();
    const genericMsg = "If an account exists with that email, a reset link has been sent.";

    try {
        const [rows] = await db.promise().query(
            "SELECT id, name, password, google_id FROM users WHERE email = ?",
            [normalized]
        );

        if (rows.length === 0) {
            return res.json({ success: true, message: genericMsg });
        }

        const user = rows[0];

        if (!user.password && user.google_id) {
            return res.json({
                success: false,
                message: "This account uses Google Sign-In. Please login with Google."
            });
        }

        await db.promise().query(
            "UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND user_type = 'patient' AND used = 0",
            [user.id]
        );

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await db.promise().query(
            `INSERT INTO password_reset_tokens (user_id, doctor_id, user_type, token, expires_at)
             VALUES (?, NULL, 'patient', ?, ?)`,
            [user.id, token, expiresAt]
        );

        const baseUrl = (process.env.FRONTEND_URL || "https://tempdhas.onrender.com").replace(/\/$/, "");
        const resetLink = `${baseUrl}/reset_password.html?token=${token}&type=patient`;

        const emailResult = await sendPasswordResetEmail({
            toEmail: normalized,
            toName:  user.name,
            resetLink,
            role:    "patient"
        });

        if (!emailResult.success) {
            console.error("Failed to send patient reset email for user", user.id, emailResult.error);
        }

        return res.json({ success: true, message: genericMsg });
    } catch (err) {
        console.error("forgotPassword error:", err.message);
        return res.json({ success: false, message: "Something went wrong. Please try again." });
    }
};

/* ── RESET PASSWORD (patient) ─────────────────────────────────────────── */
const resetPassword = async (req, res) => {
    const { token, new_password } = req.body;

    if (!token || typeof token !== "string") {
        return res.json({ success: false, message: "Invalid or missing token." });
    }
    if (!isStrongPassword(new_password)) {
        return res.json({
            success: false,
            message: "Password must be at least 6 characters and include uppercase, lowercase, number, and symbol."
        });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT id, user_id FROM password_reset_tokens
             WHERE token = ? AND user_type = 'patient' AND used = 0 AND expires_at > NOW()`,
            [token]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: "This reset link is invalid or has expired." });
        }

        const { id: tokenId, user_id } = rows[0];
        const hash = await bcrypt.hash(new_password, 10);

        await db.promise().query(
            "UPDATE users SET password = ? WHERE id = ?",
            [hash, user_id]
        );

        await db.promise().query(
            "UPDATE password_reset_tokens SET used = 1 WHERE id = ?",
            [tokenId]
        );

        await db.promise().query(
            "UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND user_type = 'patient'",
            [user_id]
        );

        return res.json({ success: true, message: "Password updated successfully. You can now login." });
    } catch (err) {
        console.error("resetPassword error:", err.message);
        return res.json({ success: false, message: "Failed to reset password. Please try again." });
    }
};

module.exports = {
    register,
    login,
    googleAuth,
    forgotPassword,
    resetPassword,
    sendEmailOtp,
    confirmEmailOtp
};