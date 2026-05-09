const express = require('express');
const router = express.Router();
const {
  getMedicalHistory,
  getPatientHistory
} = require('../controllers/medicalHistoryController');
const { protect, doctorOnly } = require('../middleware/authMiddleware');

router.get('/my', protect, getMedicalHistory);
router.get('/patient/:patientId', protect, doctorOnly, getPatientHistory);

module.exports = router;