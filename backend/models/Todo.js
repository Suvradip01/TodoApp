const mongoose = require('mongoose');

// Schema: Blueprint for a "Todo Task"
const TodoSchema = new mongoose.Schema({
    // RELATIONSHIP: Link this task to a specific User
    user: {
        type: mongoose.Schema.Types.ObjectId, // Defines this field as an ID
        required: true,
        ref: 'User' // Connects to the 'User' model (allows us to .populate() later)
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String
    },
    dueDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    reminderSent: {
        type: Boolean,
        default: false
        // This flag acts as a "Lock". Once we send an email, we turn this to true.
        // Even if the server restarts or the timing window overlaps, we check this flag
        // before sending again. This guarantees exactly 1 email per task.
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Todo', TodoSchema);
