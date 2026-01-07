const express = require("express");
const router = express.Router();
const { getMyNotifications, markNotificationAsRead } = require("../controller/notificationController");
const { isAuthenticated } = require("../middleware/auth");

router.get("/", isAuthenticated, getMyNotifications);
router.put("/:id/read", isAuthenticated, markNotificationAsRead);

module.exports = router;
