const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organization = require("../models/Organization");
const nodemailer = require("nodemailer");

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6)
    errors.push("Password must be at least 6 characters");

  if (!/[0-9]/.test(password)) errors.push("Must contain number");

  return errors;
};

const register = async (req, res) => {
  const { email, password, userType, username } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password requirements not met",
        errors: passwordErrors,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user
    user = new User({ email, passwordHash, userType });
    await user.save();

    // make profile based on userType
    if (userType === "volunteer") {
      const volunteerProfile = new Volunteer({
        userId: user._id,
        displayName: username || "",
      });
      await volunteerProfile.save();
    } else if (userType === "organization") {
      const organizationProfile = new Organization({
        userId: user._id,
        organizationName: username || "",
      });
      await organizationProfile.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        email,
        userType,
        username,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          userType: user.userType,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
};

const getCurrentUser = async (req, res) => {
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
          createdAt: user.createdAt,
        },
        profile,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.userType === "volunteer") {
      await Volunteer.deleteOne({ userId: user._id });
    } else if (user.userType === "organization") {
      await Organization.deleteOne({ userId: user._id });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};

module.exports = { register, login, logout, getCurrentUser, deleteAccount };
