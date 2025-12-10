const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Todo = require('../models/Todo');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendReminders = async () => {
    try {
        const now = new Date();
        // Widen the window to catch tasks that might have just passed (e.g. while restarting server)
        // Check from 10 minutes AGO up to 10 minutes in FUTURE
        const past = new Date(now.getTime() - 10 * 60000);
        const future = new Date(now.getTime() + 10 * 60000);

        console.log(`[DEBUG] Reminder Job Running at: ${now.toISOString()}`);
        console.log(`[DEBUG] Looking for tasks between: ${past.toISOString()} and ${future.toISOString()}`);

        const todos = await Todo.find({
            dueDate: {
                $gte: past,
                $lte: future
            },
            isCompleted: false
        }).populate('user', 'email');

        console.log(`[DEBUG] Found ${todos.length} tasks due.`);

        for (const todo of todos) {
            console.log(`[DEBUG] Processing task: "${todo.title}" for user: ${todo.user ? todo.user.email : 'No User Found'}`);

            if (todo.user && todo.user.email) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: todo.user.email,
                    subject: `Reminder: Task "${todo.title}" is due soon!`,
                    text: `Your task "${todo.title}" is due at ${todo.dueDate}. Please complete it soon!`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('[ERROR] Failed to send email:', error);
                    } else {
                        console.log('[SUCCESS] Reminder email sent:', info.response);
                    }
                });
            } else {
                console.warn(`[WARN] Skipping task "${todo.title}" - No user email found.`);
            }
        }
    } catch (error) {
        console.error('[CRITICAL ERROR] Error in reminder service:', error);
    }
};

// Schedule task to run every minute
const initReminders = () => {
    cron.schedule('* * * * *', () => {
        console.log('Checking for tasks due...');
        sendReminders();
    });
};

module.exports = initReminders;
