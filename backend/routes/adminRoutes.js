const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllDoctors,
  updateDoctorApproval,
  deleteDoctor,
  getAllPatients,
  deletePatient,
  getAllAppointments
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/doctors', protect, adminOnly, getAllDoctors);
router.put('/doctors/:id/approval', protect, adminOnly, updateDoctorApproval);
router.delete('/doctors/:id', protect, adminOnly, deleteDoctor);
router.get('/patients', protect, adminOnly, getAllPatients);
router.delete('/patients/:id', protect, adminOnly, deletePatient);
router.get('/appointments', protect, adminOnly, getAllAppointments);

module.exports = router;