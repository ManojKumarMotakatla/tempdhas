const express  = require("express");
const router   = express.Router();
const {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

router.post("/register",        register);
router.post("/login",           login);
router.post("/auth/google",     googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

module.exports = router;