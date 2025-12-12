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
        // --------------------------------------------------------------------------------
        // LOGIC: "Exactly 10 Minutes Before"
        // --------------------------------------------------------------------------------
        // Time works in milliseconds in JavaScript. 60000 ms = 1 minute.
        // We look for tasks where the 'dueDate' is between 9 and 11 minutes from "now".
        // Why a range? Because the cron job runs every 1 minute.
        // If we looked for EXACTLY 10 mins (e.g., 10:00:00), we might miss a task if the job runs at 10:00:01.
        // A 2-minute window (9 to 11 mins) guarantees we catch it during one of the scans.
        // --------------------------------------------------------------------------------
        const startWindow = new Date(now.getTime() + 9 * 60000); // Now + 9 mins
        const endWindow = new Date(now.getTime() + 11 * 60000); // Now + 11 mins

        console.log(`[DEBUG] Reminder Job Running at: ${now.toISOString()}`);
        console.log(`[DEBUG] Looking for tasks due between: ${startWindow.toISOString()} and ${endWindow.toISOString()}`);

        const todos = await Todo.find({
            dueDate: {
                $gte: startWindow,
                $lte: endWindow
            },
            isCompleted: false,    // Don't remind for done tasks!
            reminderSent: false    // CRITICAL: Only send if we haven't sent one yet. This prevents duplicates.
        }).populate('user', 'email'); // .populate() gets the User details (like email) associated with the Todo

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

                        // --------------------------------------------------------------------------------
                        // PREVENT DUPLICATES (Idempotency)
                        // --------------------------------------------------------------------------------
                        // Since our window is 2 minutes wide, this job might pick up the SAME task twice
                        // (once when it's due in 10m 30s, and again when it's due in 9m 30s).
                        // To allow only ONE email, we mark "reminderSent = true" in the database immediately.
                        // Next time the query runs, "reminderSent: false" will exclude this task.
                        // --------------------------------------------------------------------------------
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
