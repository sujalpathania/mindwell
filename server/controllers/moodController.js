const MoodLog = require('../models/MoodLog');
const User = require('../models/User');

// @desc    Get user mood logs
// @route   GET /api/mood
// @access  Private
const getMoodLogs = async (req, res) => {
    try {
        const logs = await MoodLog.find({ user: req.user._id }).sort({ createdAt: 1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new mood log + update streak
// @route   POST /api/mood
// @access  Private
const createMoodLog = async (req, res) => {
    const { mood, energy, note } = req.body;

    if (!mood) {
        return res.status(400).json({ message: 'Mood level is required' });
    }

    try {
        // Save the mood log
        const log = await MoodLog.create({
            user: req.user._id,
            mood,
            energy,
            note
        });

        // --- Streak logic ---
        const user = await User.findById(req.user._id);

        const today  = new Date();
        today.setHours(0, 0, 0, 0);

        const lastCI = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
        if (lastCI) lastCI.setHours(0, 0, 0, 0);

        const diffDays = lastCI
            ? Math.round((today - lastCI) / (1000 * 60 * 60 * 24))
            : null;

        let newStreak = user.streak;

        if (diffDays === 0) {
            // Already checked in today — keep streak as-is
        } else if (diffDays === 1) {
            newStreak = user.streak + 1;
        } else {
            // First check-in ever, or missed a day
            newStreak = 1;
        }

        const newIsPremium = user.isPremium || newStreak >= 30;

        // Use updateOne to skip the pre-save hook (no password re-hashing)
        await User.updateOne(
            { _id: req.user._id },
            { streak: newStreak, isPremium: newIsPremium, lastCheckIn: new Date() }
        );

        res.status(201).json({
            log,
            streak: newStreak,
            isPremium: newIsPremium
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current user streak info
// @route   GET /api/mood/streak
// @access  Private
const getStreak = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('streak isPremium lastCheckIn');
        res.json({
            streak: user.streak,
            isPremium: user.isPremium,
            lastCheckIn: user.lastCheckIn
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getMoodLogs, createMoodLog, getStreak };
