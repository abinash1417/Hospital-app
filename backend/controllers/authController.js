const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  sendWelcomeEmail,
  sendLoginEmail,
  sendEmail,
  emailTemplate
} = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Block admin registration through API
    if (role === 'admin') {
      return res.status(403).json({
        message: 'Admin registration is not allowed through this form'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, email,
      password: hashedPassword,
      role: role || 'patient',
      phone
    });

    try {
      await sendWelcomeEmail(email, name, role || 'patient');
    } catch (e) {
      console.log('Email error:', e.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    try {
      await sendLoginEmail(email, user.name);
    } catch (e) {
      console.log('Email error:', e.message);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  res.json(req.user);
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({
        message: 'No account found with this email'
      });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const content = `
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>You requested a password reset for your MediCare account.</p>
      <p>Click the button below to reset your password.
        This link is valid for <strong>30 minutes</strong>.
      </p>
      <div style="text-align:center;margin:30px 0">
        <a href="${resetUrl}"
          style="background:#0ea5e9;color:white;padding:14px 32px;
          border-radius:8px;text-decoration:none;font-weight:bold;
          font-size:16px;display:inline-block">
          Reset My Password
        </a>
      </div>
      <p style="font-size:13px;color:#64748b">
        Or copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color:#0ea5e9">${resetUrl}</a>
      </p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;
        border-radius:8px;padding:12px;font-size:13px;
        color:#9a3412;margin-top:15px">
        If you did not request this, please ignore this email.
        Your password will not change.
      </div>
    `;

    await sendEmail(
      email,
      'Reset Your MediCare Password',
      emailTemplate('Password Reset Request', content)
    );

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.log('Forgot password error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({
        message: 'Reset link is invalid or has expired. Please request a new one.'
      });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
};