const jwt = require("jsonwebtoken");
const User = require("../models/User");
const VolunteerProfile = require("../models/Volunteer");
const OrganizationProfile = require("../models/Organization");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      userType: user.userType,
    };

    if (user.userType === "volunteer") {
      req.user.volunteerProfile = await VolunteerProfile.findOne({
        userId: user._id,
      });
    } else if (user.userType === "organization") {
      req.user.organizationProfile = await OrganizationProfile.findOne({
        userId: user._id,
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const isVolunteer = (req, res, next) => {
  if (req.user && req.user.userType === "volunteer") {
    return next();
  }
  res.status(403).json({
    success: false,
    message: "Volunteers only",
  });
};
const isOrganization = (req, res, next) => {
  if (req.user && req.user.userType === "organization") {
    return next();
  }
  res.status(403).json({
    success: false,
    message: "Organizations only",
  });
};

module.exports = { isAuthenticated, isVolunteer, isOrganization };
