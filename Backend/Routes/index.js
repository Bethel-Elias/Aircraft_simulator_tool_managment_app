const express = require('express');
const router = express.Router();

const installRouter = require('./installRoute');

router.use(installRouter);

module.exports = router;