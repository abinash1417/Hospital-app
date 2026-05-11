const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const {
  sendAppointmentEmail,
  sendAppointmentStatusEmail,
  generateOTP,
  generateBookingNumber
} = require('../utils/sendEmail');

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, problem } = req.body;

    const doctor = await Doctor.findById(doctorId)
      .populate('userId', 'name email');
    if (!doctor)
      return res.status(404).json({ message: 'Doctor not found' });

    if (doctor.isApproved !== 'approved')
      return res.status(400).json({ message: 'Doctor not approved yet' });

    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long'
    });

    const availableDays = doctor.availableSlots.map(slot => slot.day);
    if (!availableDays.includes(dayName)) {
      return res.status(400).json({
        message: `Dr. ${doctor.userId.name} is not available on ${dayName}. Available days: ${availableDays.join(', ')}`
      });
    }

    const daySlot = doctor.availableSlots.find(slot => slot.day === dayName);
    if (daySlot) {
      const [selHour, selMin] = time.split(':').map(Number);
      const [startHour, startMin] = daySlot.startTime.split(':').map(Number);
      const [endHour, endMin] = daySlot.endTime.split(':').map(Number);

      const selectedMinutes = selHour * 60 + selMin;
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (selectedMinutes < startMinutes || selectedMinutes >= endMinutes) {
        return res.status(400).json({
          message: `Please select a time between ${daySlot.startTime} and ${daySlot.endTime} for ${dayName}`
        });
      }
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: `This time slot is already booked. Please choose a different time.`
      });
    }

    const samePatientAppointment = await Appointment.findOne({
      doctorId,
      date,
      patientId: req.user._id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (samePatientAppointment) {
      return res.status(400).json({
        message: 'You already have an appointment with this doctor on this date.'
      });
    }

    let otp = generateOTP();
    let bookingNumber = generateBookingNumber();

    // OTP expires 2 hours after appointment time
    const appointmentDateTime = new Date(`${date}T${time}`);
    const otpExpiresAt = new Date(
      appointmentDateTime.getTime() + 2 * 60 * 60 * 1000
    );

    try {
      const result = await sendAppointmentEmail(
        req.user.email,
        req.user.name,
        doctor.userId.name,
        date,
        time,
        problem
      );
      otp = result.otp;
      bookingNumber = result.bookingNumber;
    } catch (e) {
      console.log('Email error:', e.message);
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      problem,
      otp,
      bookingNumber,
      otpExpiresAt
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email photo' }
      })
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor)
      return res.status(404).json({ message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email photo phone')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      });

    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    try {
      await sendAppointmentStatusEmail(
        appointment.patientId.email,
        appointment.patientId.name,
        status,
        appointment.doctorId.userId.name,
        appointment.date,
        appointment.time,
        appointment.bookingNumber
      );
    } catch (e) {
      console.log('Email error:', e.message);
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.patientId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment
};