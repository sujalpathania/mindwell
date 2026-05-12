const JournalEntry = require('../models/JournalEntry');
const { encrypt, decrypt } = require('../utils/crypto');


const getJournalEntries = async (req, res) => {
    try {
        const entries = await JournalEntry.find({ user: req.user._id }).sort({ createdAt: -1 });

        const decryptedEntries = entries.map(entry => {
            return {
                ...entry._doc,
                content: decrypt(entry.content)
            };
        });

        res.json(decryptedEntries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const createJournalEntry = async (req, res) => {
    const { content, prompt } = req.body;

    if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return;
    }

    try {
        const encryptedContent = encrypt(content);

        const entry = await JournalEntry.create({
            user: req.user._id,
            content: encryptedContent,
            prompt
        });

     
        res.status(201).json({
            ...entry._doc,
            content: content 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const deleteJournalEntry = async (req, res) => {
    try {
        const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        await JournalEntry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Entry removed' });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getJournalEntries, createJournalEntry, deleteJournalEntry };
