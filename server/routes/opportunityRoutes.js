const express = require("express");
const router = express.Router();
const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  confirmAllSignups,
  confirmOneSignup,
  rejectOneSignup,
} = require("../controller/opportunityController");
const { isAuthenticated, isOrganization } = require("../middleware/auth");

// Public routes
router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);

// Organization-only routes
router.post("/", isAuthenticated, isOrganization, createOpportunity);
router.get("/my/list", isAuthenticated, isOrganization, getMyOpportunities);
router.put("/:id", isAuthenticated, isOrganization, updateOpportunity);
router.delete("/:id", isAuthenticated, isOrganization, deleteOpportunity);
router.get("/:id/signups", isAuthenticated, isOrganization, getMyOpportunities);
router.post(
  "/:id/signups/confirmAll",
  isAuthenticated,
  isOrganization,
  confirmAllSignups
);
router.post(
  "/:id/signups/confirmOne",
  isAuthenticated,
  isOrganization,
  confirmOneSignup
);
router.post(
  "/:id/signups/rejectOne",
  isAuthenticated,
  isOrganization,
  rejectOneSignup
);

module.exports = router;
