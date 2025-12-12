const express = require('express'); // Import Express framework to build the server
const mongoose = require('mongoose'); // Import Mongoose to interact with MongoDB database
const cors = require('cors'); // Import CORS to allow the frontend to communicate with this backend
const dotenv = require('dotenv'); // Import dotenv to load environment variables from .env file

dotenv.config(); // Load the variables from .env file into process.env

const app = express(); // Initialize the Express application
const PORT = process.env.PORT || 5000; // Set the port to the value in .env or default to 5000

// Middleware (The "Gatekeepers" of data)
app.use(express.json()); // Allows the server to accept and parse JSON data sent in the request body (req.body)
app.use(cors());         // Enable Cross-Origin Resource Sharing so our React app (on a different port) can talk to this API

// Database Connection
console.log('Attempting to connect to MongoDB...'); // Log a message to the console for debugging
mongoose.connect(process.env.MONGO_URI) // Connect to MongoDB using the URI from our environment variables
    .then(() => console.log('MongoDB Connected')) // If connection is successful, log success message
    .catch(err => console.error(err)); // If connection fails, log the error

// Routes (The "Map" of our API)
// Any request starting with /api/auth goes to authRoutes.js
app.use('/api/auth', require('./routes/authRoutes'));
// Any request starting with /api/todos goes to todoRoutes.js
app.use('/api/todos', require('./routes/todoRoutes'));
// Any request starting with /api/ai goes to aiRoutes.js
app.use('/api/ai', require('./routes/aiRoutes'));

// Initialize Reminder Service
const initReminders = require('./services/reminderService'); // Import the reminder service function
initReminders(); // Run the function to start the background cron job for emails

// Basic route to check if server is running
app.get('/', (req, res) => { // Define a GET request for the root URL ('/')
    res.send('API is running...'); // Send a simple text response
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Listen for incoming requests on the specified PORT
