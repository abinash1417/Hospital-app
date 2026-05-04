const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Create doctor profile
const createDoctorProfile = async (req, res) => {
  try {
    const { specialization, experience, fees, about, availableSlots } = req.body;

    const existing = await Doctor.findOne({ userId: req.user._id });
    if (existing)
      return res.status(400).json({ message: 'Doctor profile already exists' });

    const doctor = await Doctor.create({
      userId: req.user._id,
      specialization,
      experience,
      fees,
      about,
      availableSlots
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all approved doctors
const getAllDoctors = async (req, res) => {
  try {
    const { search, specialization } = req.query;

    const approvedUsers = await User.find({ role: 'doctor' });
    const approvedUserIds = approvedUsers.map(u => u._id);

    let query = {
      userId: { $in: approvedUserIds },
      isApproved: 'approved'
    };

    if (specialization) query.specialization = specialization;

    let doctors = await Doctor.find(query).populate('userId', 'name email photo phone');

    if (search) {
      doctors = doctors.filter(d =>
        d.userId.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single doctor
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email photo phone');

    if (!doctor)
      return res.status(404).json({ message: 'Doctor not found' });

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my doctor profile
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'name email photo phone');

    if (!doctor)
      return res.status(404).json({ message: 'Profile not found' });

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor)
      return res.status(404).json({ message: 'Profile not found' });

    const updated = await Doctor.findByIdAndUpdate(
      doctor._id,
      { ...req.body },
      { new: true }
    ).populate('userId', 'name email photo phone');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile
};