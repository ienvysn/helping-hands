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

// Organization-only routes
router.post("/", isAuthenticated, isOrganization, createOpportunity);
router.put("/:id", isAuthenticated, isOrganization, updateOpportunity);
router.delete("/:id", isAuthenticated, isOrganization, deleteOpportunity);
router.get("/my/list", isAuthenticated, isOrganization, getMyOpportunities);

module.exports = router;
