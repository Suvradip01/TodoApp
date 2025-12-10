import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import SummaryModal from '../components/SummaryModal';
import { isToday, isFuture, parseISO } from 'date-fns';
import { ModeToggle } from '../components/mode-toggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, Plus, Pencil, Sun, Calendar, CheckCircle2, LogOut } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'Medium' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Feature States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState('dueDate');
    const [filterPriority, setFilterPriority] = useState('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Request Notification Permission
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        fetchTasks(1, true);
    }, [sortBy, filterPriority]);

    const fetchTasks = async (pageNum = 1, reset = false) => {
        try {
            setLoading(true);
            const params = {
                page: pageNum,
                limit: 10,
                sortBy,
                order: 'asc', // Default ascending
            };

            if (filterPriority !== 'all') params.priority = filterPriority;

            const res = await api.get('/todos', { params });

            let newTasks = [];
            let currentPage = 1;
            let totalPages = 1;

            if (Array.isArray(res.data)) {
                // Fallback for legacy backend or no pagination
                newTasks = res.data;

                // Client-side Filtering Fallback
                if (filterPriority !== 'all') {
                    newTasks = newTasks.filter(t => t.priority === filterPriority);
                }

                // Client-side Sorting Fallback
                if (sortBy === 'dueDate') {
                    newTasks.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
                } else if (sortBy === 'priority') {
                    const order = { High: 1, Medium: 2, Low: 3 };
                    newTasks.sort((a, b) => (order[a.priority] || 2) - (order[b.priority] || 2));
                } else if (sortBy === 'isCompleted') {
                    newTasks.sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));
                }
            } else if (res.data && res.data.todos) {
                newTasks = res.data.todos;
                currentPage = res.data.currentPage;
                totalPages = res.data.totalPages;
            }

            if (reset) {
                setTasks(newTasks);
                setPage(1);
            } else {
                setTasks(prev => [...prev, ...newTasks]);
                setPage(pageNum);
            }

            setHasMore(currentPage < totalPages);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // toast.error("Failed to load tasks"); // Optional: suppress if it's just a connection blip
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        fetchTasks(page + 1);
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await api.put(`/todos/${editId}`, newTask);
                setTasks(tasks.map(t => t._id === editId ? res.data : t));
                setIsEditing(false);
                setEditId(null);
                toast.success("Task updated successfully!");
            } else {
                const res = await api.post('/todos', newTask);
                // If sorting by due date (default), we might want to refetch or just prepend. 
                // For simplicity, let's prepend and let the user sort if needed, or better, refetch.
                // Prepending might break sort order. Refetching is safer.
                fetchTasks(1, true);
                toast.success("New task created!");
            }
            setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium' });
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (task) => {
        setNewTask({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '', // Format YYYY-MM-DDTHH:mm
            priority: task.priority
        });
        setIsEditing(true);
        setEditId(task._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        toast("Are you sure?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await api.delete(`/todos/${id}`);
                        setTasks(tasks.filter(t => t._id !== id));
                        toast.success("Task deleted");
                    } catch (error) {
                        toast.error("Failed to delete task");
                    }
                }
            },
            cancel: {
                label: "Cancel",
            },
        });
    };

    const handleToggleComplete = async (task) => {
        try {
            const updatedTask = { ...task, isCompleted: !task.isCompleted };
            const res = await api.put(`/todos/${task._id}`, updatedTask);
            setTasks(tasks.map(t => t._id === task._id ? res.data : t));

            if (updatedTask.isCompleted) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                toast.success("Task completed! Great job!");
            }
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error("Failed to update status");
        }
    };

    const handleGenerateSummary = async () => {
        setSummaryModalOpen(true);
        setLoadingSummary(true);
        try {
            // Get completed tasks from today (locally filtered for now, or could fetch from backend)
            const completedToday = tasks
                .filter(t => t.isCompleted && isToday(parseISO(t.updatedAt || t.createdAt)))
                .map(t => `${t.title} (${t.description || 'no desc'})`);

            if (completedToday.length === 0) {
                setSummaryData({ content: "You haven't completed any tasks today yet! Go crush it!" });
            } else {
                const res = await api.post('/ai/summarize', { tasks: completedToday });
                setSummaryData(res.data);
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            setSummaryData({ content: "Failed to generate summary. Please try again." });
        } finally {
            setLoadingSummary(false);
        }
    };

    // Check for local browser reminders check (client-side polling)
    useEffect(() => {
        const checkReminders = () => {
            if (Notification.permission === 'granted') {
                const now = new Date();
                tasks.forEach(task => {
                    if (!task.isCompleted && task.dueDate) {
                        const due = new Date(task.dueDate);
                        const diff = due - now;
                        // Notify if due in 15 mins (approx 900000ms) and positive
                        if (diff > 0 && diff <= 900000) {
                            // Use a simple local storage flag to avoid repeated notifications for the same task in this session
                            const notifiedKey = `notified-${task._id}`;
                            if (!sessionStorage.getItem(notifiedKey)) {
                                new Notification(`Reminder: ${task.title}`, {
                                    body: `Due in ${Math.ceil(diff / 60000)} minutes!`,
                                    icon: '/vite.svg' // optional
                                });
                                sessionStorage.setItem(notifiedKey, 'true');
                            }
                        }
                    }
                });
            }
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Check immediately on mount/update

        return () => clearInterval(interval);
    }, [tasks]);


    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Navbar */}
            <nav className="bg-card shadow-sm sticky top-0 z-10 border-b border-border">
                <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xl font-bold text-primary flex items-center gap-2"
                    >
                        <Rocket className="h-6 w-6" /> ToDo
                    </motion.h1>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground hidden sm:inline">Hello, {user.username}</span>
                        <Button
                            variant="secondary"
                            onClick={handleGenerateSummary}
                            className="flex items-center gap-1"
                        >
                            <Sparkles className="h-4 w-4" /> AI Summary
                        </Button>
                        <ModeToggle />
                        <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-destructive gap-1">
                            <LogOut className="h-4 w-4" /> Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Task Form */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                {isEditing ? <><Pencil className="h-5 w-5" /> Edit Task</> : <><Plus className="h-5 w-5" /> Add New Task</>}
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        type="text"
                                        placeholder="What needs to be done?"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <select
                                            className="px-4 py-2 bg-background border border-input rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        >
                                            <option value="Low">Low Priority</option>
                                            <option value="Medium">Medium Priority</option>
                                            <option value="High">High Priority</option>
                                        </select>
                                        <Input
                                            type="datetime-local"
                                            className=""
                                            value={newTask.dueDate}
                                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Description (optional)"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                    {isEditing && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => { setIsEditing(false); setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium' }); }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button type="submit">
                                        {isEditing ? 'Update Task' : 'Create Task'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Filter and Sort Controls */}
                <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <span className="text-sm font-medium">Sort By:</span>
                        <select
                            className="px-3 py-1 bg-background border border-input rounded-md text-sm"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                            <option value="isCompleted">Status</option>
                        </select>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-sm font-medium">Filter Priority:</span>
                        <select
                            className="px-3 py-1 bg-background border border-input rounded-md text-sm"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </div>

                {/* Task List */}
                <div className="grid gap-2">
                    <AnimatePresence mode="popLayout">
                        {tasks.map(task => (
                            <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Load More */}
                {hasMore && (
                    <div className="mt-8 flex justify-center">
                        <Button variant="outline" onClick={loadMore} disabled={loading}>
                            {loading ? 'Loading...' : 'Load More Tasks'}
                        </Button>
                    </div>
                )}

                {!hasMore && tasks.length > 0 && (
                    <p className="text-center text-muted-foreground mt-8 italic">No more tasks.</p>
                )}

                {tasks.length === 0 && !loading && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No tasks found. Add one to get started!</p>
                    </div>
                )}
            </main>

            <SummaryModal
                isOpen={summaryModalOpen}
                onClose={() => setSummaryModalOpen(false)}
                summary={summaryData}
                isLoading={loadingSummary}
            />
        </div>
    );
};

export default Dashboard;
