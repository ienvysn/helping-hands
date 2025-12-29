const Opportunity = require("../models/Opportunity");
const Organization = require("../models/Organization");
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

    const existingSignup = await Signup.findOne({
      volunteerId: req.user.volunteerProfile._id,
      opportunityId: opportunityId,
      status: { $ne: "cancelled" },
    });
    if (existingSignup) {
      res.status(400).message("You have already signed in");
    }

    const signup = await Signup.create({
      volunteerId: req.user.volunteerProfile._id,
      opportunityId: opportunityId,
      status: "pending",
      signedUpAt: new Date(),
      hoursAwarded: 0,
    });

    res.status(200).message({ message: "Registered sucessfully", signup });
  } catch (e) {
    res.status(400).message(e.message);
  }
};

module.export = { signUpForOpportunity };
