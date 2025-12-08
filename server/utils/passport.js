const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organization = require("../models/Organization");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log(
          "🔵 Google Profile received:",
          profile.id,
          profile.emails[0].value
        );

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        const userType = req.session.userType || "volunteer";

        // Create new user
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          userType: userType,
        });
        await user.save();

        if (userType === "volunteer") {
          const volunteerProfile = new Volunteer({
            userId: user._id,
            displayName: profile.displayName || "",
          });
          await volunteerProfile.save();
        } else if (userType === "organization") {
          const organizationProfile = new Organization({
            userId: user._id,
            organizationName: profile.displayName || "",
          });
          await organizationProfile.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
