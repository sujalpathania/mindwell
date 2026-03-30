const express = require('express');
const router = express.Router();
const { getMoodLogs, createMoodLog } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMoodLogs)
    .post(protect, createMoodLog);

module.exports = router;
