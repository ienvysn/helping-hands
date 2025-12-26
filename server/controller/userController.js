const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organization = require("../models/Organization");

const getProfile = async (req, res) => {
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
  } else if (user.userType === "organization") {
    profile = await Organization.findOne({ userId: user._id });
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
};

const updateVolunteerProfile = async (req, res) => {
  const { displayName, aboutMe, profilePictureUrl } = req.body;

  const profile = await Volunteer.findOne({ userId: req.user.id });

  if (!profile) {
    console.log("17. Profile not found for user:", req.user.id);
    return res.status(404).json({
      success: false,
      message: "Profile not found",
    });
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
};

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

  const profile = await Organization.findOne({ userId: req.user.id });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Profile not found",
    });
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
};

module.exports = {
  getProfile,
  updateVolunteerProfile,
  updateOrganizationProfile,
};
