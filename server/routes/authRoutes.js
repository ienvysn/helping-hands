const express = require("express");
const router = express.Router();
const { register, login } = require("../controller/authController");
const {
  forgetPassword,
  resetPassword,
} = require("../controller/resetPasswordController");

router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
module.exports = router;
