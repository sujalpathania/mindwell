const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const updateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Set lastCheckIn to yesterday so checking in today increments the streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const result = await User.updateMany(
            {}, 
            { 
                $set: { 
                    streak: 1, 
                    isPremium: false,
                    lastCheckIn: yesterday 
                } 
            }
        );

        console.log(`Updated ${result.modifiedCount} users. Streak is now 1, and lastCheckIn is yesterday.`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateUsers();
