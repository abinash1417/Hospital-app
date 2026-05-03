const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') 
    return res.status(403).json({ message: 'Admin only' });
  next();
};

const doctorOnly = (req, res, next) => {
  if (req.user.role !== 'doctor') 
    return res.status(403).json({ message: 'Doctor only' });
  next();
};

module.exports = { protect, adminOnly, doctorOnly };