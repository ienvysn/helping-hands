const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = async (req, res) => {
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

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account deactivated",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      userType: user.userType,
    };
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const isVolunteer = (req, res) => {
  if (req.user && req.user.userType === "volunteer") {
  }
  res.status(403).json({
    success: false,
    message: "Volunteers only",
  });
};

const isOrganization = (req, res) => {
  if (req.user && req.user.userType === "organization") {
  }
  res.status(403).json({
    success: false,
    message: "Organizations only",
  });
};

module.exports = { isAuthenticated, isVolunteer, isOrganization };
