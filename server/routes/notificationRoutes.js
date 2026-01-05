const express = require("express");
const router = express.Router();
const { getMyNotifications } = require("../controller/notificationController");
const { isAuthenticated } = require("../middleware/auth");

router.get("/", isAuthenticated, getMyNotifications);

module.exports = router;
