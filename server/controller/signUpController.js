const Volunteer = require("../models/Volunteer");
const Opportunity = require("../models/Opportunity");
const Signup = require("../models/SignUp");

const signUpForOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.body;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity || !opportunity.isActive) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    if (new Date(opportunity.eventDate) < new Date()) {
      return res.status(400).json({ error: "Event signup closed" });
    }

    const currentSignups = await Signup.countDocuments({
      opportunityId,
      status: { $in: ["pending", "confirmed"] },
    });

    if (
      opportunity.maxVolunteers &&
      currentSignups >= opportunity.maxVolunteers
    ) {
      return res.status(400).json({ error: "Event is full" });
    }
    console.log(req.user);

    console.log(req.user.volunteerProfile);
    const existingSignup = await Signup.findOne({
      volunteerId: req.user.volunteerProfile._id,
      opportunityId: opportunityId,
      status: { $ne: "cancelled" },
    });

    if (existingSignup) {
      return res.status(400).json({ error: "You have already signed up" });
    }

    const signup = await Signup.create({
      volunteerId: req.user.volunteerProfile._id,
      opportunityId: opportunityId,
      status: "pending",
      signedUpAt: new Date(),
      hoursAwarded: 0,
    });

    // Create notifications
    const { createNotification } = require("../utils/notificationHelper");
    const Organization = require("../models/Organization");


    await createNotification(
      req.user._id,
      "signup_confirmation",
      "Signup Confirmation",
      `You have successfully signed up for "${opportunity.title}".`
    );


    const organization = await Organization.findById(opportunity.organizationId);
    if (organization) {
      await createNotification(
        organization.userId,
        "new_signup",
        "New Signup",
        `A new volunteer has signed up for "${opportunity.title}".`
      );
    }

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: signup,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getMySignups = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.id });
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }

    const signups = await Signup.find({ volunteerId: volunteer._id })
      .populate({
        path: "opportunityId",
        populate: {
          path: "organizationId",
          select: "organizationName logoUrl",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: signups,
    });
  } catch (error) {
    console.error("Get my signups error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your signups",
      error: error.message,
    });
  }
};

module.exports = { signUpForOpportunity, getMySignups};
