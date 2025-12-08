const express = require("express");
const router = express.Router();
const passport = require("passport");
const { register, login } = require("../controller/authController");
const {
  forgetPassword,
  resetPassword,
} = require("../controller/resetPasswordController");
const {
  initiateGoogleAuth,
  handleGoogleCallback,
} = require("../controller/oauthController");

router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

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
