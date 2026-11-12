const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const {
  forgotPassword,
  resetPassword,
} = require("../Controllers/passwordResetController");

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

router.post("/forgot-password", passwordResetLimiter, forgotPassword);

router.post("/reset-password", passwordResetLimiter, resetPassword);

module.exports = router;
