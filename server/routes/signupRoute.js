const express = require("express");
const { signUpForOpportunity, getMySignups } = require("../controller/signUpController");
const { isAuthenticated, isVolunteer } = require("../middleware/auth");
const Signup = require("../models/SignUp");
const Volunteer = require("../models/Volunteer");
const Opportunity = require("../models/Opportunity");

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

// TEST ROUTE - Create attended signup for testing reviews
// REMOVE THIS BEFORE PRODUCTION!
router.post(
  "/test/create-attended",
  isAuthenticated,
  isVolunteer,
  async (req, res) => {
    try {
      const { opportunityId } = req.body;

      const volunteer = await Volunteer.findOne({ userId: req.user.id });
      if (!volunteer) {
        return res.status(404).json({
          success: false,
          message: "Volunteer profile not found",
        });
      }

      const opportunity = await Opportunity.findById(opportunityId);
      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found",
        });
      }

      const existingSignup = await Signup.findOne({
        volunteerId: volunteer._id,
        opportunityId: opportunityId,
      });

      if (existingSignup) {
        existingSignup.status = "attended";
        existingSignup.attended = true;
        existingSignup.hoursAwarded = opportunity.durationHours || 3;
        await existingSignup.save();

        return res.json({
          success: true,
          message: "Updated existing signup to attended",
          data: existingSignup,
        });
      }

      const signup = await Signup.create({
        volunteerId: volunteer._id,
        opportunityId: opportunityId,
        status: "attended",
        attended: true,
        signedUpAt: new Date(),
        confirmedAt: new Date(),
        hoursAwarded: opportunity.durationHours || 3,
      });

      res.status(201).json({
        success: true,
        message: "Test attended signup created successfully",
        data: signup,
      });
    } catch (error) {
      console.error("Test signup error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating test signup",
        error: error.message,
      });
    }
  }
);
module.exports = router;
