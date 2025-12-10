const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Summary', SummarySchema);
