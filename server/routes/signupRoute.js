const express = require("express");
const { signUpForOpportunity } = require("../controller/signUpController");
const { isAuthenticated, isVolunteer } = require("../middleware/auth");

router = express.Router();

const validate = require("../middleware/validate");
const { signupForOpportunitySchema } = require("../utils/validationSchemas");

router.post(
  "/",
  isAuthenticated,
  isVolunteer,
  validate(signupForOpportunitySchema),
  signUpForOpportunity
);

module.exports = router;
