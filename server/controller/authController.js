const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organization = require("../models/Organization");

const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8)
    errors.push("Password must be at least 8 characters");

  if (!/[0-9]/.test(password)) errors.push("Must contain number");

  return errors;
};

const register = async (req, res) => {
  try {
    const { email, password, userType, displayName, organizationName } =
      req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and user type are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!["volunteer", "organization"].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "User type must be 'volunteer' or 'organization'",
      });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password requirements not met",
        errors: passwordErrors,
      });
    }

    if (userType === "organization" && !organizationName) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      userType,
    });

    if (userType === "volunteer") {
      await Volunteer.create({
        userId: user._id,
        displayName: displayName || "",
      });
    } else {
      await Organization.create({
        userId: user._id,
        organizationName,
      });
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
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
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

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
  localStorage.removeItem("token");
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

module.exports = { register, login, logout, getCurrentUser };
