const express = require('express');
const router = express.Router();
const { getJournalEntries, createJournalEntry, deleteJournalEntry } = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getJournalEntries)
    .post(protect, createJournalEntry);

router.route('/:id')
    .delete(protect, deleteJournalEntry);

module.exports = router;
