const express = require('express');
const router = express.Router();
const { checkSymptoms, chatbot } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/symptoms', protect, checkSymptoms);
router.post('/chatbot', chatbot);

module.exports = router;