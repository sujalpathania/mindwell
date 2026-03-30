const MoodLog = require('../models/MoodLog');

// @desc    Get user mood logs
// @route   GET /api/mood
// @access  Private
const getMoodLogs = async (req, res) => {
    try {
        const logs = await MoodLog.find({ user: req.user._id }).sort({ createdAt: 1 }); // Sort ascending for charts
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new mood log
// @route   POST /api/mood
// @access  Private
const createMoodLog = async (req, res) => {
    const { mood, energy, note } = req.body;

    if (!mood) {
        res.status(400).json({ message: 'Mood level is required' });
        return;
    }

    try {
        const log = await MoodLog.create({
            user: req.user._id,
            mood,
            energy,
            note
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getMoodLogs, createMoodLog };
