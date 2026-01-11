const Review = require("../models/Review");
const Signup = require("../models/SignUp");
const Opportunity = require("../models/Opportunity");
const Volunteer = require("../models/Volunteer");
const Organization = require("../models/Organization");

const createReview = async (req, res) => {
  try {
    const { opportunityId, rating, comment } = req.body;

    //yo validation ho check garxa sabai comment , review xa ki nai
    if (!opportunityId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // volunteer profile get garxa
    const volunteer = await Volunteer.findOne({ userId: req.user.id });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }

    // opportunnity xa ki nai herxa
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    // volunteer le sign up garera event gareko ho vane matra review garna pauxa
    const signup = await Signup.findOne({
      volunteerId: volunteer._id,
      opportunityId: opportunityId,
      status: "attended", 
    });

    if (!signup) {
      return res.status(403).json({
        success: false,
        message: "You can only review events you have attended",
      });
    }

    // hamile date sakisakeko event matra review garna pauxa so tyo event sakeko xa ki nai herxa
    if (new Date(opportunity.eventDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: "You can only review past events",
      });
    }

    // review already aaisakeko xa vane double garna paiyena
    const existingReview = await Review.findOne({
      volunteerId: volunteer._id,
      opportunityId: opportunityId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this event",
      });
    }

    // esle actuaally ma nai review create garxa mathiko sabai milyo vane
    const review = await Review.create({
      volunteerId: volunteer._id,
      opportunityId: opportunityId,
      organizationId: opportunity.organizationId,
      rating,
      comment,
    });

    // tyo star rating milauxa
    await updateOrganizationRating(opportunity.organizationId);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating review",
      error: error.message,
    });
  }
};

//Review get garxa for volunteer
const getMyReviews = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.id });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }

    const reviews = await Review.find({ volunteerId: volunteer._id })
      .populate({
        path: "opportunityId",
        select: "title eventDate",
      })
      .populate({
        path: "organizationId",
        select: "organizationName logoUrl",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
      error: error.message,
    });
  }
};

//Review get garxa for organizations
const getOrganizationReviews = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const reviews = await Review.find({ organizationId })
      .populate({
        path: "volunteerId",
        select: "displayName profilePictureUrl",
      })
      .populate({
        path: "opportunityId",
        select: "title eventDate",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get organization reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
      error: error.message,
    });
  }
};

//kunai euta opportunnity ko sabai review haru get garxa
const getOpportunityReviews = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const reviews = await Review.find({ opportunityId })
      .populate({
        path: "volunteerId",
        select: "displayName profilePictureUrl",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get opportunity reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const volunteer = await Volunteer.findOne({ userId: req.user.id });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }

    // review xa ki nai tyo ni verify garxa ani usle aafai banako review matra update garna pauxa
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (!review.volunteerId.equals(volunteer._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    await updateOrganizationRating(review.organizationId);

    res.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating review",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const volunteer = await Volunteer.findOne({ userId: req.user.id });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (!review.volunteerId.equals(volunteer._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    const organizationId = review.organizationId;
    await Review.findByIdAndDelete(reviewId);

    await updateOrganizationRating(organizationId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting review",
      error: error.message,
    });
  }
};

//organization ko review garepaxi rating calculate garxa
const updateOrganizationRating = async (organizationId) => {
  try {
    const reviews = await Review.find({ organizationId });
    
    if (reviews.length === 0) {
      await Organization.findByIdAndUpdate(organizationId, {
        averageRating: 0,
        totalReviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Organization.findByIdAndUpdate(organizationId, {
      averageRating: Math.round(averageRating * 10) / 10, 
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Update organization rating error:", error);
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getOrganizationReviews,
  getOpportunityReviews,
  updateReview,
  deleteReview,
};


