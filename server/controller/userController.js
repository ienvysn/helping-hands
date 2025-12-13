// server/controller/userController.js

const User = require('../models/User'); 

// 1. GET /api/user/profile - Fetch the logged-in user's complete profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all required data from the single User model
    // Excluding sensitive fields like passwordHash from the result
    const user = await User.findById(userId).select('-passwordHash -resetPasswordToken -resetPasswordExpiry'); 
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Construct the data object to match the frontend state expectations (Profile.jsx)
    // We use default values (|| '') if the database field is null/undefined
    const profileData = {
      // Core Profile fields
      displayName: user.displayName || user.email.split('@')[0], 
      email: user.email,
      location: user.location || '',
      preferredCauses: user.preferredCauses || '',
      aboutMe: user.aboutMe || '',

      // Notification Settings
      emailReminders: user.emailReminders ?? true, // Use ?? to handle null/undefined if you want to default to true
      levelUpdates: user.levelUpdates ?? true,

      // Volunteer Stats (used for display and level calculation)
      totalHours: user.totalHours || 0, 
      level: user.level, // Accesses the virtual property defined in User.js
    };

    res.json(profileData);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 2. PUT /api/user/profile - Update the logged-in user's profile
exports.updateProfile = async (req, res) => {
  // Destructure all fields the frontend is sending
  const { 
    displayName, email, location, preferredCauses, aboutMe, 
    emailReminders, levelUpdates 
  } = req.body;

  try {
    const userId = req.user.id;
    
    // Update the single User model with all fields using findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(userId, {
        displayName, 
        email, 
        location, 
        preferredCauses, 
        aboutMe, 
        emailReminders, 
        levelUpdates,
        // We do NOT update totalHours here, as that should be managed by event completion logic
    }, { 
        new: true, // Return the updated document
        runValidators: true, // Ensure mongoose validation rules are applied
        omitUndefined: true // A good practice to avoid updating fields that might be missing in req.body
    }).select('-passwordHash');

    if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Success response matches the alert triggered on your frontend
    res.json({ 
        success: true, 
        message: 'Profile updated successfully!', 
        user: updatedUser
    });

  } catch (err) {
    console.error('Error updating profile:', err.message);
    // You should add more specific error handling here (e.g., for duplicate email)
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};