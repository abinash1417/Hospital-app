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
const Appointment = require('../models/Appointment');

router.post('/', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/doctor', protect, doctorOnly, getDoctorAppointments);
router.put('/:id/status', protect, doctorOnly, updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);

// Get booked time slots for a doctor on a specific date
router.get('/booked-slots/:doctorId', protect, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const appointments = await Appointment.find({
      doctorId,
      date,
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');

    const bookedTimes = appointments.map(apt => apt.time);
    res.json({ bookedTimes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;