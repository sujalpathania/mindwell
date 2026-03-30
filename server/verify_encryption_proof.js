const dotenv = require('dotenv');
dotenv.config({ path: './.env' }); // Ensure .env is loaded

if (!process.env.ENCRYPTION_KEY) {
    console.error('FATAL: ENCRYPTION_KEY is missing from .env');
    process.exit(1);
}

const mongoose = require('mongoose');
const JournalEntry = require('./models/JournalEntry');
const User = require('./models/User');
const { encrypt } = require('./utils/crypto');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // cleanup
        await User.deleteMany({ email: 'test@proof.com' });
        await JournalEntry.deleteMany({ prompt: 'PROOF_TEST' });

        // Create User
        const user = await User.create({
            name: 'Proof User',
            email: 'test@proof.com',
            password: 'password123'
        });

        // Create Encrypted Entry
        const secretText = "This is a super secret journal entry that should be encrypted.";
        const encryptedText = encrypt(secretText);

        await JournalEntry.create({
            user: user._id,
            content: encryptedText,
            prompt: 'PROOF_TEST'
        });

        console.log('Entry created with text:', secretText);

        // Fetch Raw
        const rawEntry = await JournalEntry.findOne({ prompt: 'PROOF_TEST' }).lean();

        console.log('\n--- DATABASE INSPECTION ---');
        console.log('ID:', rawEntry._id);
        console.log('Content (Raw in DB):', rawEntry.content);
        console.log('Is Encrypted?', rawEntry.content !== secretText);
        console.log('Contains IV?', rawEntry.content.includes(':'));
        console.log('---------------------------\n');

        if (rawEntry.content !== secretText && rawEntry.content.includes(':')) {
            console.log('SUCCESS: Data is encrypted at rest.');
        } else {
            console.log('FAILURE: Data is NOT encrypted.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
