const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const createPrescription = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      diagnosis,
      medicines,
      notes,
      followUpDate
    } = req.body;

    const existing = await Prescription.findOne({ appointmentId });
    if (existing)
      return res.status(400).json({
        message: 'Prescription already exists for this appointment'
      });

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor)
      return res.status(404).json({ message: 'Doctor profile not found' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.status !== 'confirmed' && appointment.status !== 'completed')
      return res.status(400).json({
        message: 'Can only prescribe for confirmed or completed appointments'
      });

    const prescription = await Prescription.create({
      appointmentId,
      doctorId: req.user._id,
      patientId,
      diagnosis,
      medicines,
      notes,
      followUpDate
    });

    // Mark appointment as completed
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'completed'
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('doctorId', 'name email photo')
      .populate('patientId', 'name email phone')
      .populate('appointmentId');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrescriptionByAppointment = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      appointmentId: req.params.appointmentId
    })
      .populate('doctorId', 'name email photo')
      .populate('patientId', 'name email phone')
      .populate('appointmentId');

    if (!prescription)
      return res.status(404).json({ message: 'No prescription found' });

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientId: req.user._id
    })
      .populate('doctorId', 'name email photo')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all prescriptions written by doctor
const getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      doctorId: req.user._id
    })
      .populate('patientId', 'name email phone')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPrescription,
  getPrescriptionByAppointment,
  getMyPrescriptions,
  getDoctorPrescriptions
};