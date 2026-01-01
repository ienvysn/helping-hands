const express = require("express");
const router = express.Router();
const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getOpportunitySignups,
  getMyOpportunities,
  confirmAllSignups,
  confirmOneSignup,
  rejectOneSignup,
  markAttendance,
} = require("../controller/opportunityController");
const { isAuthenticated, isOrganization } = require("../middleware/auth");

// Public routes
router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);

const validate = require("../middleware/validate");
const {
  createOpportunitySchema,
  updateOpportunitySchema,
} = require("../utils/validationSchemas");

// Organization-only routes
router.post(
  "/",
  isAuthenticated,
  isOrganization,
  validate(createOpportunitySchema),
  createOpportunity
);
router.get("/my/list", isAuthenticated, isOrganization, getMyOpportunities);
router.put(
  "/:id",
  isAuthenticated,
  isOrganization,
  validate(updateOpportunitySchema),
  updateOpportunity
);
router.delete("/:id", isAuthenticated, isOrganization, deleteOpportunity);
router.get(
  "/:opportunityId/signups",
  isAuthenticated,
  isOrganization,
  getOpportunitySignups
);

router.post(
  "/:opportunityId/signups/confirmAll",
  isAuthenticated,
  isOrganization,
  confirmAllSignups
);

router.put(
  "/:opportunityId/signups/confirmOne",
  isAuthenticated,
  isOrganization,
  confirmOneSignup
);

router.post(
  "/:opportunityId/signups/rejectOne",
  isAuthenticated,
  isOrganization,
  rejectOneSignup
);

router.put(
  "/:opportunityId/attendance",
  isAuthenticated,
  isOrganization,
  markAttendance
);

module.exports = router;
