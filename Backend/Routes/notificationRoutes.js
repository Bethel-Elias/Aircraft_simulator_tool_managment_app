const express = require("express");
const router = express.Router();

const notificationController = require("../Controllers/notificationController");
const authMiddleware = require("../Middlewares/ authMiddleware");

router.get("/", authMiddleware, notificationController.getNotifications);

router.patch("/read-all", authMiddleware, notificationController.markAllAsRead);

router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

module.exports = router;
