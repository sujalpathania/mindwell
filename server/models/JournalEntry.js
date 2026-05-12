const mongoose = require('mongoose');

const journalEntrySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String, 
        required: true
    },
    prompt: {
        type: String, 
        required: false
    }
}, {
    timestamps: true
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

module.exports = JournalEntry;
