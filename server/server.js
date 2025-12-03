require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const session = require("express-session");
const connectDB = require("./config/db");
const passport = require("./utils/passport");

const app = express();

connectDB();
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

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

app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) =>
  res.json({ message: "Volunteer App API is running" })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
