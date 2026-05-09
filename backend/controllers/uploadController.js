const { cloudinary } = require('../config/cloudinary');
const User = require('../models/User');

// Upload profile photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update user photo in database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { photo: req.file.path },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Photo uploaded successfully',
      photo: req.file.path,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete old photo from cloudinary
const deletePhoto = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log('Delete photo error:', error.message);
  }
};

module.exports = { uploadPhoto, deletePhoto };