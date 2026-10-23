const express = require("express");
const router = express.Router();

const authenticateToken = require("../Middlewares/ authMiddleware");
const authorizeRoles = require("../Middlewares/authorizeMiddleware");
const userController = require("../Controllers/userController");

// Every route in this file requires a valid login.
router.use(authenticateToken);

// ADMIN and MANAGER can view users.
router.get("/", authorizeRoles("ADMIN", "MANAGER"), userController.listUsers);

router.get("/:id", authorizeRoles("ADMIN", "MANAGER"), userController.getUser);

// Only ADMIN can create, update, or deactivate users.
router.post("/", authorizeRoles("ADMIN"), userController.createUser);

router.put("/:id", authorizeRoles("ADMIN"), userController.updateUser);

router.delete("/:id", authorizeRoles("ADMIN"), userController.deactivateUser);

router.patch( "/:id/status", authorizeRoles("ADMIN"), userController.updateUserStatus);

module.exports = router;
