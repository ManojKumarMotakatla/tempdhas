const express  = require("express");
const router   = express.Router();
const {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  sendEmailOtp,
  confirmEmailOtp
} = require("../controllers/authController");

router.post("/register",        register);
router.post("/login",           login);
router.post("/auth/google",     googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// Email OTP verification (shared by patient + doctor registration)
router.post("/email-otp/send",    sendEmailOtp);
router.post("/email-otp/confirm", confirmEmailOtp);

module.exports = router;