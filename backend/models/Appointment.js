const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  problem: { type: String, default: '' },
  bookingNumber: { type: String, default: '' },
  otp: { type: String, default: '' },
  otpExpiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);