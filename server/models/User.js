const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      sparse: true,
    },
    userType: {
      type: String,
      enum: ["volunteer", "organization"],
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
