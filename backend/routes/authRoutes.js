const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middleware/authMiddleware');

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Get admin contact for chat
router.get('/admin-contact', protect, async (req, res) => {
  try {
    const User = require('../models/User');

    const admin = await User.findOne({ role: 'admin' })
      .select('name email photo role');

    res.json(admin);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;