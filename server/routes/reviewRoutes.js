const express = require("express");
const router = express.Router();
const {
  createReview,
  getMyReviews,
  getOrganizationReviews,
  getOpportunityReviews,
  updateReview,
  deleteReview,
} = require("../controller/reviewController");
const { isAuthenticated, isVolunteer } = require("../middleware/auth");

//volunteer ko private routes arule yo garna paudaina
router.post("/", isAuthenticated, isVolunteer, createReview);
router.get("/my-reviews", isAuthenticated, isVolunteer, getMyReviews);
router.put("/:reviewId", isAuthenticated, isVolunteer, updateReview);
router.delete("/:reviewId", isAuthenticated, isVolunteer, deleteReview);

//jasle ni herna payo public route
router.get("/organization/:organizationId", getOrganizationReviews);
router.get("/opportunity/:opportunityId", getOpportunityReviews);

module.exports = router;