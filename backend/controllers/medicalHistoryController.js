const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');

const getMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patientId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email photo' }
      })
      .sort({ createdAt: -1 });

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name email photo')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    const doctorIds = [...new Set(
      appointments
        .filter(a => a.status === 'completed' || a.status === 'confirmed')
        .map(a => a.doctorId?._id?.toString())
        .filter(Boolean)
    )];

    const doctorsVisited = await Doctor.find({
      _id: { $in: doctorIds }
    }).populate('userId', 'name email photo');

    const stats = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(
        a => a.status === 'completed'
      ).length,
      cancelledAppointments: appointments.filter(
        a => a.status === 'cancelled'
      ).length,
      totalPrescriptions: prescriptions.length,
      doctorsVisited: doctorsVisited.length
    };

    res.json({
      stats,
      appointments,
      prescriptions,
      doctorsVisited
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get medical history for a specific doctor's patient (doctor view)
const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({
      patientId,
      doctorId: await Doctor.findOne({ userId: req.user._id }).then(d => d?._id)
    })
      .sort({ createdAt: -1 });

    const prescriptions = await Prescription.find({
      patientId,
      doctorId: req.user._id
    }).sort({ createdAt: -1 });

    res.json({ appointments, prescriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMedicalHistory, getPatientHistory };