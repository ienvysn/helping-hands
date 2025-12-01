const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
} = require("../controller/authController");

router.post("/register", register);
router.post("/login", login);

router.post("/getCurrentUser", getCurrentUser);
module.exports = router;
