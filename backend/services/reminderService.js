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
        // Target tasks due in exactly 10 minutes.
        // We create a 2-minute window (10 +/- 1 min) to account for cron execution time
        const startWindow = new Date(now.getTime() + 9 * 60000); // Now + 9 mins
        const endWindow = new Date(now.getTime() + 11 * 60000); // Now + 11 mins

        console.log(`[DEBUG] Reminder Job Running at: ${now.toISOString()}`);
        console.log(`[DEBUG] Looking for tasks due between: ${startWindow.toISOString()} and ${endWindow.toISOString()}`);

        const todos = await Todo.find({
            dueDate: {
                $gte: startWindow,
                $lte: endWindow
            },
            isCompleted: false,
            reminderSent: false // Ensure we haven't sent it already
        }).populate('user', 'email');

        console.log(`[DEBUG] Found ${todos.length} tasks due for reminder.`);

        for (const todo of todos) {
            console.log(`[DEBUG] Processing reminder for task: "${todo.title}" (User: ${todo.user?.email})`);

            if (todo.user && todo.user.email) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: todo.user.email,
                    subject: `Reminder: Task "${todo.title}" is due in 10 minutes!`,
                    text: `Your task "${todo.title}" is due at ${new Date(todo.dueDate).toLocaleString()}. You have 10 minutes left!`
                };

                // Send Email
                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.error(`[ERROR] Failed to send email for task "${todo.title}":`, error);
                    } else {
                        console.log(`[SUCCESS] Reminder email sent for task "${todo.title}":`, info.response);

                        // Mark as sent to prevent duplicates
                        todo.reminderSent = true;
                        await todo.save();
                        console.log(`[SUCCESS] Marked task "${todo.title}" as reminded.`);
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
