const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema: Blueprint for what a "User" looks like in the database.
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' fields

// --------------------------------------------------------------------------------
// PASSWORD ENCRYPTION (Security)
// --------------------------------------------------------------------------------
// This "pre-save" hook runs automatically BEFORE a user is saved to the DB.
// It encrypts the password so we never store plain text passwords.
UserSchema.pre('save', async function (next) { // "next" is called when we are done
    // If password wasn't changed, skip hashing (e.g., updating email only)
    if (!this.isModified('password')) return next();

    // Generate a "Salt" (random data to make hash unique)
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to verify password during Login
// Returns true if entering password matches stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
