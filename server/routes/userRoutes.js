// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();

// Import middleware for checking login and user type
const { isAuthenticated, isVolunteer } = require('../middleware/auth'); 

// Import the profile functions from the new controller
const { getProfile, updateProfile } = require('../controller/userController'); 

// @route   GET /api/user/profile
// @desc    Get logged-in volunteer's profile data
// @access  Private (Requires JWT token) and Volunteer only
router.get('/profile', isAuthenticated, isVolunteer, getProfile);

// @route   PUT /api/user/profile
// @desc    Update logged-in volunteer's profile data
// @access  Private (Requires JWT token) and Volunteer only
router.put('/profile', isAuthenticated, isVolunteer, updateProfile);

module.exports = router;