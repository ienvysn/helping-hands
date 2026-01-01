const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    tasks: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    requirements: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      trim: true,
      default: "",
    },

    durationHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    opportunityType: {
      type: String,
      enum: ["on-site", "remote"],
      required: true,
      default: "on-site",
    },
    cause: {
      type: String,
      enum: [
        "Animals",
        "Education",
        "Environment",
        "Health",
        "Community",
        "Arts & Culture",
        "Social Services",
        "Other",
      ],
      default: "Other",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    maxVolunteers: {
      type: Number,
      min: 1,
      default: null, // null means unlimited
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

opportunitySchema.index({ isActive: 1, eventDate: 1 });
opportunitySchema.index({ organizationId: 1, isActive: 1 });
opportunitySchema.index({ cause: 1, isActive: 1 });
opportunitySchema.index({ opportunityType: 1, isActive: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);
