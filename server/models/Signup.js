const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VolunteerProfile",
      required: true,
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "no-show", "rejected", "attended"],
      default: "pending",
    },

    signedUpAt: {
      type: Date,
      default: Date.now,
    },

    attended: {
      type: Boolean,
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },

    hoursAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SignUp", signupSchema);
