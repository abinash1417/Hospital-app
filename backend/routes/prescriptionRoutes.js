const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptionByAppointment,
  getMyPrescriptions,
  getDoctorPrescriptions
} = require('../controllers/prescriptionController');
const { protect, doctorOnly } = require('../middleware/authMiddleware');

router.post('/', protect, doctorOnly, createPrescription);
router.get('/my', protect, getMyPrescriptions);
router.get('/doctor', protect, doctorOnly, getDoctorPrescriptions);
router.get('/appointment/:appointmentId', protect, getPrescriptionByAppointment);

module.exports = router;