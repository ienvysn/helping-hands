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
    
    profile: {
      displayName: {
        type: String,
        default: '',
      },
      level: {
        type: Number,
        default: 1,
        min: 1,
        max: 5,
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
      bio: {
        type: String,
        default: '',
        maxlength: 500,
      },
      avatar: {
        type: String,
        default: '',
      },
    },
    
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);