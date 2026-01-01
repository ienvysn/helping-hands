const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  register,
  login,
  deleteAccount,
} = require("../controller/authController");
const { isAuthenticated } = require("../middleware/auth");
const {
  forgetPassword,
  resetPassword,
} = require("../controller/resetPasswordController");
const {
  initiateGoogleAuth,
  handleGoogleCallback,
} = require("../controller/oauthController");

const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../utils/validationSchemas");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.delete("/delete", isAuthenticated, deleteAccount);

// Google OAuth routes
router.get("/google", initiateGoogleAuth);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login?error=auth_failed",
    session: false,
  }),
  handleGoogleCallback
);

module.exports = router;
