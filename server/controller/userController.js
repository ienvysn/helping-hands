const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organization = require("../models/Organization");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = null;

    if (user.userType === "volunteer") {
      profile = await Volunteer.findOne({ userId: user._id });

      if (!profile) {
        console.log(
          `Auto-creating missing volunteer profile for user ${user._id}`
        );
        profile = await Volunteer.create({
          userId: user._id,
          displayName: "Volunteer",
        });
      }
    } else if (user.userType === "organization") {
      profile = await Organization.findOne({ userId: user._id });

      if (!profile) {
        console.log(
          `Auto-creating missing organization profile for user ${user._id}`
        );
        profile = await Organization.create({
          userId: user._id,
          organizationName: "Organization",
        });
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          userType: user.userType,
        },
        profile,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/user/profile/volunteer
const updateVolunteerProfile = async (req, res) => {
  const { displayName, aboutMe, profilePictureUrl } = req.body;

  try {
    // Validation
    if (aboutMe && aboutMe.length > 250) {
      return res.status(400).json({
        success: false,
        message: "About Me cannot exceed 250 characters",
      });
    }

    let profile = await Volunteer.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new Volunteer({ userId: req.user.id });
    }

    if (displayName !== undefined) profile.displayName = displayName;
    if (aboutMe !== undefined) profile.aboutMe = aboutMe;
    if (profilePictureUrl !== undefined)
      profile.profilePictureUrl = profilePictureUrl;

    await profile.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Update Volunteer Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/user/profile/organization
const updateOrganizationProfile = async (req, res) => {
  const {
    organizationName,
    mission,
    logoUrl,
    contactEmail,
    contactPhone,
    website,
    address,
  } = req.body;

  try {
    let profile = await Organization.findOne({ userId: req.user.id });

    // UPSERT for Organization
    if (!profile) {
      profile = new Organization({ userId: req.user.id });
    }

    if (organizationName !== undefined)
      profile.organizationName = organizationName;
    if (mission !== undefined) profile.mission = mission;
    if (logoUrl !== undefined) profile.logoUrl = logoUrl;
    if (contactEmail !== undefined) profile.contactEmail = contactEmail;
    if (contactPhone !== undefined) profile.contactPhone = contactPhone;
    if (website !== undefined) profile.website = website;
    if (address !== undefined) profile.address = address;

    await profile.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Update Org Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getProfile,
  updateVolunteerProfile,
  updateOrganizationProfile,
};

// server/controller/userController.js

const User = require('../models/User'); 

// 1. GET /api/user/profile - Fetch the logged-in user's complete profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all required data from the single User model
    // Excluding sensitive fields like passwordHash from the result
    const user = await User.findById(userId).select('-passwordHash -resetPasswordToken -resetPasswordExpiry'); 
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Construct the data object to match the frontend state expectations (Profile.jsx)
    // We use default values (|| '') if the database field is null/undefined
    const profileData = {
      // Core Profile fields
      displayName: user.displayName || user.email.split('@')[0], 
      email: user.email,
      location: user.location || '',
      preferredCauses: user.preferredCauses || '',
      aboutMe: user.aboutMe || '',

      // Notification Settings
      emailReminders: user.emailReminders ?? true, // Use ?? to handle null/undefined if you want to default to true
      levelUpdates: user.levelUpdates ?? true,

      // Volunteer Stats (used for display and level calculation)
      totalHours: user.totalHours || 0, 
      level: user.level, // Accesses the virtual property defined in User.js
    };

    res.json(profileData);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 2. PUT /api/user/profile - Update the logged-in user's profile
exports.updateProfile = async (req, res) => {
  // Destructure all fields the frontend is sending
  const { 
    displayName, email, location, preferredCauses, aboutMe, 
    emailReminders, levelUpdates 
  } = req.body;

  try {
    const userId = req.user.id;
    
    // Update the single User model with all fields using findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(userId, {
        displayName, 
        email, 
        location, 
        preferredCauses, 
        aboutMe, 
        emailReminders, 
        levelUpdates,
        // We do NOT update totalHours here, as that should be managed by event completion logic
    }, { 
        new: true, // Return the updated document
        runValidators: true, // Ensure mongoose validation rules are applied
        omitUndefined: true // A good practice to avoid updating fields that might be missing in req.body
    }).select('-passwordHash');

    if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Success response matches the alert triggered on your frontend
    res.json({ 
        success: true, 
        message: 'Profile updated successfully!', 
        user: updatedUser
    });

  } catch (err) {
    console.error('Error updating profile:', err.message);
    // You should add more specific error handling here (e.g., for duplicate email)
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};