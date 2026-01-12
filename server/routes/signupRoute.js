const express = require("express");
const { signUpForOpportunity, getMySignups } = require("../controller/signUpController");
const { isAuthenticated, isVolunteer } = require("../middleware/auth");


const router = express.Router();

const validate = require("../middleware/validate");
const { signupForOpportunitySchema } = require("../utils/validationSchemas");

router.post(
  "/",
  isAuthenticated,
  isVolunteer,
  validate(signupForOpportunitySchema),
  signUpForOpportunity
);

router.get("/my-signups", isAuthenticated, isVolunteer, getMySignups);

//test code removed
module.exports = router;

