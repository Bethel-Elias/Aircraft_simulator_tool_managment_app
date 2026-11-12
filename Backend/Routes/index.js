const express = require('express');
const router = express.Router();

const installRouter = require('./installRoute');
const authRouter = require('./authRoute');
const userRouter = require('./userRoutes');
const notificationRouter = require("./notificationRoutes");
const passwordResetRoutes = require("./passwordResetRoutes");

router.use(installRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use("/notifications", notificationRouter);
router.use("/auth", passwordResetRoutes);

module.exports = router;