const jwt = require('jsonwebtoken'); // Import the library to verify JSON Web Tokens
const User = require('../models/User'); // Import the User model to look up the user in the database

// Middleware to protect routes
// This logic runs BEFORE the route handler (e.g., getting todos).
// It checks if the user sent a valid "Badge" (JWT Token).
const protect = async (req, res, next) => {
    let token; // Initialize a variable to store the token

    // 1. Check if the "Authorization" header exists and starts with "Bearer"
    // Format: "Bearer <token_string_here>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Get the token string (remove "Bearer " space)
            token = req.headers.authorization.split(' ')[1]; // Split string by space and take the second part (the token)

            // 3. Verify the token using our Secret Key
            // If invalid or expired, this throws an error.
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token to get the payload (user id)

            // 4. Attach the User to the Request (req.user)
            // Now the route handler knows WHO is asking!
            // .select('-password') excludes the password field from the returned user object for security
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Move to the next step (the actual route handler)
            next();
        } catch (error) {
            console.log(error); // Log the error if verification fails
            res.status(401).json({ message: 'Not authorized' }); // Send 401 Unauthorized response
        }
    }

    if (!token) { // If no token was found in the header
        res.status(401).json({ message: 'Not authorized, no token' }); // Send error that token is missing
    }
};

module.exports = { protect }; // Export the protect function so it can be used in routes
