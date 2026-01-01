const express = require("express");
const router = express.Router();
const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
 

} = require("../controller/opportunityController");
const { isAuthenticated, isOrganization } = require("../middleware/auth");

// Public routes
router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);
// Volunteer signup route (authenticated users only)
router.post("/:id/signup", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    if (!opportunity.isActive) {
      return res.status(400).json({
        success: false,
        message: "This opportunity is no longer active",
      });
    }

    if (opportunity.volunteers && opportunity.volunteers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already signed up for this event",
      });
    }

    if (
      opportunity.maxVolunteers &&
      opportunity.volunteers &&
      opportunity.volunteers.length >= opportunity.maxVolunteers
    ) {
      return res.status(400).json({
        success: false,
        message: "This event is full",
      });
    }

    opportunity.volunteers = opportunity.volunteers || [];
    opportunity.volunteers.push(userId);
    opportunity.registeredVolunteers = opportunity.volunteers.length;

    await opportunity.save();

    res.json({
      success: true,
      message: "Successfully signed up for the event",
      data: opportunity,
    });
  } catch (error) {
    console.error("Error signing up for opportunity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sign up",
      error: error.message,
    });
  }
});


// Organization-only routes
router.post("/", isAuthenticated, isOrganization, createOpportunity);
router.put("/:id", isAuthenticated, isOrganization, updateOpportunity);
router.delete("/:id", isAuthenticated, isOrganization, deleteOpportunity);
router.get("/my/list", isAuthenticated, isOrganization, getMyOpportunities);

module.exports = router;
