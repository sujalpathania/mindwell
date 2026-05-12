const express = require('express');
const router = express.Router();
const { getMoodLogs, createMoodLog, getStreak, detectFaceMood, getSmartSuggestions } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.route('/streak').get(protect, getStreak);
router.route('/smart-suggestions').get(protect, getSmartSuggestions);
router.route('/detect-face').post(protect, detectFaceMood);

router.route('/')
    .get(protect, getMoodLogs)
    .post(protect, createMoodLog);

module.exports = router;
