require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
const authRoute = require("./routes/authRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const userRoutes = require("./routes/userRoutes");
const signupRoutes = require("./routes/signupRoute");
const reviewRoutes = require("./routes/reviewRoutes")
const notificationRoutes= require("./routes/notificationRoutes")

require("./utils/passport");

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(helmet());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);


///required for Oauth
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 10 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRoute);
app.use("/api/user", userRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/signups", signupRoutes);
app.use("/api/reviews", reviewRoutes)
app.use("/api/notifications",notificationRoutes)



app.get("/", (req, res) =>
  res.json({ message: "Volunteer App API is running" })
);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
