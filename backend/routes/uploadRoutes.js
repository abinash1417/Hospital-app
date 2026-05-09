const express = require('express');
const router = express.Router();
const { uploadPhoto } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/photo', protect, upload.single('photo'), uploadPhoto);

module.exports = router;