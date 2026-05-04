const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { sendDoctorApprovalEmail } = require('../utils/sendEmail');

const getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingDoctors = await Doctor.countDocuments({ isApproved: 'pending' });
    const todayAppointments = await Appointment.countDocuments({
      date: new Date().toISOString().split('T')[0]
    });

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      pendingDoctors,
      todayAppointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email photo phone');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDoctorApproval = async (req, res) => {
  try {
    const { status } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: status },
      { new: true }
    ).populate('userId', 'name email');

    if (!doctor)
      return res.status(404).json({ message: 'Doctor not found' });

    try {
      await sendDoctorApprovalEmail(
        doctor.userId.email,
        doctor.userId.name,
        status
      );
    } catch (e) {
      console.log('Email error:', e.message);
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor)
      return res.status(404).json({ message: 'Doctor not found' });

    await User.findByIdAndDelete(doctor.userId);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllDoctors,
  updateDoctorApproval,
  deleteDoctor,
  getAllPatients,
  deletePatient,
  getAllAppointments
};