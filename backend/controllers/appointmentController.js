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

    let otp = generateOTP();
    let bookingNumber = generateBookingNumber();

    // OTP expires 2 hours after appointment time
    const appointmentDateTime = new Date(`${date}T${time}`);
    const otpExpiresAt = new Date(appointmentDateTime.getTime() + 2 * 60 * 60 * 1000);

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