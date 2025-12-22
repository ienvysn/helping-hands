const mongoose = require("mongoose");

const volunteerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    profilePictureUrl: {
      type: String,
      default: "",
    },
    aboutMe: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

volunteerProfileSchema.virtual("level").get(function () {
  if (this.totalHours < 10) return 1;
  if (this.totalHours < 25) return 2;
  if (this.totalHours < 50) return 3;
  if (this.totalHours < 100) return 4;
  if (this.totalHours < 200) return 5;
  return Math.floor(this.totalHours / 100) + 4;
});
volunteerProfileSchema.set('toJSON', { virtuals: true });
volunteerProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("VolunteerProfile", volunteerProfileSchema);
