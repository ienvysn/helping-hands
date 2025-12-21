const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organization = require("../models/Organization");

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6)
    errors.push("Password must be at least 6 characters");
  if (!/[0-9]/.test(password)) errors.push("Must contain number");
  return errors;
};

const register = async (req, res) => {
  const { email, password, userType, displayName } = req.body;
  try {
    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // 2. Validate Password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password requirements not met",
        errors: passwordErrors,
      });
    }

    // 3. Create Base User
    const passwordHash = await bcrypt.hash(password, 10);
    user = new User({ email, passwordHash, userType });
    await user.save();

    // make profile based on userType
    if (userType === "volunteer") {
      const volunteerProfile = new Volunteer({
        userId: user._id,
        displayName: displayName || "",
      });
      await volunteerProfile.save();
    } else if (userType === "organization") {
      const organizationProfile = new Organization({
        userId: user._id,
        organizationName: displayName || "",
      });
      await organizationProfile.save();
    }

    // 5. Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email,
        userType,
        displayName,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Not Found",
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

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await Volunteer.deleteOne({ userId });
    await Organization.deleteOne({ userId });
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

module.exports = { register, login, logout, deleteAccount };
