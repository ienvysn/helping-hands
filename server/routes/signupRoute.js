const express = require("express");
const { signUpForOpportunity } = require("../controller/signUpController");
const { isAuthenticated, isVolunteer } = require("../middleware/auth");

router = express.Router;

router.post("/signups", isAuthenticated, isVolunteer, signUpForOpportunity);

module.export = router;
