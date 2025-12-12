const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Todo = require('../models/Todo');

// @route   GET /api/todos/stats
// @desc    Get all todos for statistics (lightweight)
// @access  Private
// note: "protect" argument makes sure only logged-in users can reach here!
router.get('/stats', protect, async (req, res) => {
    try {
        // Query: Find all Todos where 'user' matches the ID from the token (req.user.id).
        // .select(...) tells Mongo to ONLY return specific fields (faster).
        const todos = await Todo.find({ user: req.user.id })
            .select('createdAt completedAt isCompleted')
            .sort({ createdAt: 1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/todos
// @desc    Get all user todos with pagination, filtering, and sorting
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // PAGINATION MATH
        // page 1, limit 10 -> skip 0
        // page 2, limit 10 -> skip 10
        const skip = (page - 1) * limit;

        const { sortBy, order, priority, isCompleted, dueDate } = req.query;

        // Filtering: Build a "filter" object dynamically
        const filter = { user: req.user.id }; // ALWAYS filter by current user
        if (priority) filter.priority = priority;
        if (isCompleted !== undefined) filter.isCompleted = isCompleted === 'true';

        // Sorting: Build a "sortOptions" object
        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = order === 'desc' ? -1 : 1;
        } else {
            sortOptions.dueDate = 1; // Default
        }

        const todos = await Todo.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const total = await Todo.countDocuments(filter);

        res.json({
            todos,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTodos: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/todos
// @desc    Create new todo
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Please add a title' });
    }

    try {
        const todo = await Todo.create({
            user: req.user.id,
            title,
            description,
            dueDate,
            priority
        });
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/todos/:id
// @desc    Update todo
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the todo user
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Create update object
        let updateData = { ...req.body };

        // Handle completedAt logic separately if isCompleted is being changed
        if (req.body.isCompleted !== undefined) {
            if (req.body.isCompleted && !todo.isCompleted) {
                updateData.completedAt = new Date();
            } else if (!req.body.isCompleted && todo.isCompleted) {
                updateData.completedAt = null;
            }
        }

        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });

        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/todos/:id
// @desc    Delete todo
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the todo user
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await todo.deleteOne();

        res.json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
