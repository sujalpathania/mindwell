const mongoose = require('mongoose');

const journalEntrySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String, // Encrypted content
        required: true
    },
    prompt: {
        type: String, // The prompt answered, if any
        required: false
    }
}, {
    timestamps: true
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

module.exports = JournalEntry;
