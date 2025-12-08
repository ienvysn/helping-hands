const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6)
    errors.push("Password must be at least 6 characters");

  if (!/[0-9]/.test(password)) errors.push("Must contain number");

  return errors;
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `Click this link to reset your password: ${resetLink}\n\nThis link expires in 1 hour.`
    );

    res.json({
      success: true,
      message: "Password reset link generated (check mail)",
    });
  } catch (error) {
    console.error("Forget password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password requirements not met",
        errors: passwordErrors,
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { forgetPassword, resetPassword };
