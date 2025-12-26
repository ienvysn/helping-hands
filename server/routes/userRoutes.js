<<<<<<<<< Temporary merge branch 1
// server/routes/userRoutes.js
=========
>>>>>>>>> Temporary merge branch 2
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
<<<<<<<<< Temporary merge branch 1
=========

>>>>>>>>> Temporary merge branch 2
router.put(
  "/profile/volunteer",
  isAuthenticated,
  isVolunteer,
  updateVolunteerProfile
);
<<<<<<<<< Temporary merge branch 1
=========

>>>>>>>>> Temporary merge branch 2
router.put(
  "/profile/organization",
  isAuthenticated,
  isOrganization,
  updateOrganizationProfile
);

module.exports = router;
