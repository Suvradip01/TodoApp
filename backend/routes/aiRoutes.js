const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Summary = require('../models/Summary');
const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// @route   POST /api/ai/summarize
// @desc    Generate summary for completed tasks
// @access  Private
router.post('/summarize', protect, async (req, res) => {
    const { tasks } = req.body; // Expecting an array of task titles/descriptions

    if (!tasks || tasks.length === 0) {
        return res.status(400).json({ message: 'No tasks provided for summary' });
    }

    try {
        const prompt = `Summarize the following tasks I completed today in a natural language, encouraging tone: ${tasks.join(', ')}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile', // Updated model
        });

        const summaryContent = chatCompletion.choices[0]?.message?.content || "Could not generate summary.";

        // Save summary to DB
        const summary = await Summary.create({
            user: req.user.id,
            content: summaryContent,
            date: new Date()
        });

        res.json(summary);
    } catch (error) {
        console.error('Groq Error:', error);
        res.status(500).json({ message: 'Error generating summary', error: error.message });
    }
});

// @route   GET /api/ai/history
// @desc    Get summary history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const summaries = await Summary.find({ user: req.user.id }).sort({ date: -1 });
        res.json(summaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
