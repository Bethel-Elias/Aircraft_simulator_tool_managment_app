const express = require("express");
const router = express.Router();

const authController = require("../Controllers/authController");
const authMiddleware = require("../Middlewares/ authMiddleware");

// Public route
router.post("/login", authController.login);

// Protected routes
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authMiddleware, authController.logout);
router.post("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
