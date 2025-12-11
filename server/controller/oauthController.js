const jwt = require("jsonwebtoken");
const passport = require("passport");

const initiateGoogleAuth = (req, res, next) => {
  // Store userType in session before redirecting to Google
  req.session.userType = req.query.userType || "volunteer";

  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

const handleGoogleCallback = (req, res) => {
  try {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    // Redirect to frontend with token and userType
    return res.redirect(
      `http://localhost:3000/auth/callback?token=${token}&userType=${req.user.userType}`
    );
  } catch (err) {
    console.error("Google callback error:", err);
    return res.redirect("http://localhost:3000/login?error=auth_failed");
  }
};

module.exports = {
  initiateGoogleAuth,
  handleGoogleCallback,
};
