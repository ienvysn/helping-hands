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
