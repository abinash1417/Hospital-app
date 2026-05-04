const express = require('express');
const router = express.Router();
const {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile
} = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/authMiddleware');

router.get('/', getAllDoctors);
router.get('/profile/me', protect, doctorOnly, getMyDoctorProfile);
router.get('/:id', getDoctorById);
router.post('/profile', protect, doctorOnly, createDoctorProfile);
router.put('/profile', protect, doctorOnly, updateDoctorProfile);

module.exports = router;