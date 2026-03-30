const mongoose = require('mongoose');

const moodLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    mood: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    energy: {
        type: Number,
        required: false,
        min: 1,
        max: 10
    },
    note: {
        type: String, // Short note, optional
        required: false
    }
}, {
    timestamps: true
});

const MoodLog = mongoose.model('MoodLog', moodLogSchema);

module.exports = MoodLog;
