const express = require('express');
const router = express.Router();
const { getMoodLogs, createMoodLog, getStreak } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.route('/streak').get(protect, getStreak);

router.route('/')
    .get(protect, getMoodLogs)
    .post(protect, createMoodLog);

module.exports = router;
