// server/models/User.js (Revised to include all profile fields)

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ... (existing email, passwordHash, googleId, userType fields)
    userType: {
      type: String,
      enum: ["volunteer", "organization"],
      required: true,
    },
    // ... (existing token fields)

    // --- NEW PROFILE FIELDS (To match frontend: Profile.jsx) ---
    displayName: {
        type: String,
        trim: true,
        default: '',
    },
    location: {
        type: String,
        trim: true,
        default: '',
    },
    preferredCauses: {
        type: String, 
        trim: true,
        default: '',
    },
    aboutMe: {
        type: String,
        trim: true,
        default: '',
        maxlength: 500
    },
    emailReminders: {
        type: Boolean,
        default: true,
    },
    levelUpdates: {
        type: Boolean,
        default: true,
    },
    // Adding fields from the profile design (even if not explicitly in Profile.jsx state)
    totalHours: {
        type: Number,
        default: 0,
        min: 0,
    },
    // We won't add 'level' as it can be a calculated virtual property based on totalHours
    // --- END PROFILE FIELDS ---
  },
  {
    timestamps: true,
    // Add a virtual property for 'level' based on totalHours
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  }
);

// Add the virtual property for the level calculation
userSchema.virtual("level").get(function () {
  if (this.totalHours < 10) return 1;
  if (this.totalHours < 25) return 2;
  if (this.totalHours < 50) return 3;
  if (this.totalHours < 100) return 4;
  if (this.totalHours < 200) return 5;
  return Math.floor(this.totalHours / 100) + 4;
});


module.exports = mongoose.model("User", userSchema);