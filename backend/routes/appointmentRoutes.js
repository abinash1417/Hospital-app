const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect, doctorOnly } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/doctor', protect, doctorOnly, getDoctorAppointments);
router.put('/:id/status', protect, doctorOnly, updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;