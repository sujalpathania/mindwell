const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 🔹 Check if token exists in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 🔹 Get token from header
            token = req.headers.authorization.split(' ')[1];

            // 🔹 Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 🔹 Find user from DB
            const user = await User.findById(decoded.id).select('-password');

            // ❌ If user not found
            if (!user) {
                return res.status(401).json({
                    message: 'User not found'
                });
            }

            // ✅ Attach user to request
            req.user = user;

            // Move to next middleware/controller
            return next();

        } catch (error) {
            console.error("Auth Error:", error.message);

            return res.status(401).json({
                message: 'Not authorized, token failed'
            });
        }
    }

  
    return res.status(401).json({
        message: 'Not authorized, no token'
    });
};

module.exports = { protect };