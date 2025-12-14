// server/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateVolunteerProfile,
  updateOrganizationProfile,
} = require("../controller/userController");
const {
  isAuthenticated,
  isVolunteer,
  isOrganization,
} = require("../middleware/auth");

router.get("/profile", isAuthenticated, getProfile);
router.put(
  "/profile/volunteer",
  isAuthenticated,
  isVolunteer,
  updateVolunteerProfile
);
router.put(
  "/profile/organization",
  isAuthenticated,
  isOrganization,
  updateOrganizationProfile
);

module.exports = router;
