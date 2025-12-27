const mongoose = require("mongoose");

const organizationProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    organizationName: {
      type: String,
      // required: true,
      trim: true,
    },
    mission: {
      type: String,
      trim: true,
      default: "",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      trim: true,
      default: "",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Organization", organizationProfileSchema);
