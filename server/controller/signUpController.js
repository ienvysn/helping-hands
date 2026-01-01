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

module.exports = { signUpForOpportunity };
