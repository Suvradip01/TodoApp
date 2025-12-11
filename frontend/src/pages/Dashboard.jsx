import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import ActivityGraph from '../components/ActivityGraph';
import SummaryModal from '../components/SummaryModal';
import { isToday, isFuture, parseISO, format } from 'date-fns';
import { ModeToggle } from '../components/mode-toggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, Sparkles, Plus, Pencil, Search,
    Calendar as CalendarIcon, Filter, SortAsc,
    LayoutList, CheckCircle2, ListTodo, Clock, Loader2
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'Medium' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false); // Collapsible add task

    // Feature States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState('dueDate');
    const [filterPriority, setFilterPriority] = useState('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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
            const params = { page: pageNum, limit: 10, sortBy, order: 'asc' };
            if (filterPriority !== 'all') params.priority = filterPriority;

            const res = await api.get('/todos', { params });
            let newTasks = [];
            let currentPage = 1;
            let totalPages = 1;

            if (Array.isArray(res.data)) {
                newTasks = res.data;
                if (filterPriority !== 'all') newTasks = newTasks.filter(t => t.priority === filterPriority);
                if (sortBy === 'dueDate') newTasks.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
                else if (sortBy === 'priority') {
                    const order = { High: 1, Medium: 2, Low: 3 };
                    newTasks.sort((a, b) => (order[a.priority] || 2) - (order[b.priority] || 2));
                }
            } else if (res.data?.todos) {
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
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => fetchTasks(page + 1);

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
                await api.post('/todos', newTask);
                fetchTasks(1, true);
                toast.success("New task created!");
            }
            setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium' });
            setIsAddTaskOpen(false); // Close after adding
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (task) => {
        setNewTask({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
            priority: task.priority
        });
        setIsEditing(true);
        setEditId(task._id);
        setIsAddTaskOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        toast("Are you sure?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    await api.delete(`/todos/${id}`);
                    setTasks(tasks.filter(t => t._id !== id));
                    toast.success("Task deleted");
                }
            },
            cancel: { label: "Cancel" },
        });
    };

    const handleToggleComplete = async (task) => {
        try {
            const updatedTask = { ...task, isCompleted: !task.isCompleted };
            const res = await api.put(`/todos/${task._id}`, updatedTask);
            setTasks(tasks.map(t => t._id === task._id ? res.data : t));
            if (updatedTask.isCompleted) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                toast.success("Task completed!");
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleGenerateSummary = async () => {
        setSummaryModalOpen(true);
        setLoadingSummary(true);
        try {
            const completedToday = tasks
                .filter(t => t.isCompleted && isToday(parseISO(t.updatedAt || t.createdAt)))
                .map(t => `${t.title}`);
            const res = completedToday.length > 0
                ? await api.post('/ai/summarize', { tasks: completedToday })
                : { data: { content: "No tasks completed today yet." } };
            setSummaryData(res.data);
        } catch (error) {
            setSummaryData({ content: "Failed to generate summary." });
        } finally {
            setLoadingSummary(false);
        }
    };

    // Stats for Hero Section
    const pendingCount = tasks.filter(t => !t.isCompleted).length;
    const completedCount = tasks.filter(t => t.isCompleted).length;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 relative">
            {/* Decorative Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Floating Navbar */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-4 z-50 mx-auto max-w-6xl px-4"
            >
                <div className="bg-background/70 backdrop-blur-xl border border-border/40 shadow-lg rounded-2xl px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <Rocket className="h-5 w-5" />
                        </div>
                        ToDo
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mr-2">
                            <span>Hello, <span className="text-foreground font-medium">{user.username}</span></span>
                        </div>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={handleGenerateSummary}
                            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity border-0"
                        >
                            <Sparkles className="h-3.5 w-3.5" /> AI Summary
                        </Button>
                        <ModeToggle />
                        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
                            <Clock className="h-4 w-4 mr-2 md:hidden" />
                            <span className="hidden md:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </motion.nav>

            <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                {/* Hero Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
                >
                    <div className="md:col-span-2 bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/10 rounded-3xl p-6 flex flex-col justify-center">
                        <h2 className="text-2xl font-bold mb-2">Ready to be productive?</h2>
                        <p className="text-muted-foreground">You have <span className="font-semibold text-primary">{pendingCount} pending tasks</span>. Let's get them done.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card border border-border/50 rounded-3xl p-5 flex flex-col items-center justify-center shadow-sm">
                            <span className="text-3xl font-bold text-primary">{tasks.length}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total</span>
                        </div>
                        <div className="bg-card border border-border/50 rounded-3xl p-5 flex flex-col items-center justify-center shadow-sm">
                            <span className="text-3xl font-bold text-green-500">{completedCount}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Done</span>
                        </div>
                    </div>
                </motion.div>

                {/* Activity Graph - Full Width */}
                <div className="mb-8">
                    <ActivityGraph />
                </div>

                {/* Main Controls - Filter & Add */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="flex gap-2">
                        <div className="relative group">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <select
                                className="pl-9 pr-4 py-2 bg-card border border-border/50 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-shadow cursor-pointer hover:border-border"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                            >
                                <option value="all">All Priorities</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div className="relative group">
                            <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <select
                                className="pl-9 pr-4 py-2 bg-card border border-border/50 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-shadow cursor-pointer hover:border-border"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="dueDate">Due Date</option>
                                <option value="priority">Priority</option>
                                <option value="isCompleted">Status</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsAddTaskOpen(!isAddTaskOpen)}
                        className={`rounded-xl transition-all duration-300 ${isAddTaskOpen ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : ''}`}
                    >
                        {isAddTaskOpen ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Task</>}
                    </Button>
                </div>

                {/* Collapsible Add Task Form */}
                <AnimatePresence>
                    {isAddTaskOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-8"
                        >
                            <Card className="border-primary/10 shadow-xl overflow-hidden">
                                <CardContent className="p-6 bg-gradient-to-b from-card to-background">
                                    <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-4">
                                            <Input
                                                type="text"
                                                placeholder="What needs to be done?"
                                                value={newTask.title}
                                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                required
                                                className="text-lg font-medium border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                                            />
                                            <textarea
                                                placeholder="Add details..."
                                                className="w-full min-h-[60px] resize-none text-sm text-muted-foreground bg-transparent border-0 outline-none placeholder:text-muted-foreground/50"
                                                value={newTask.description}
                                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-border/30">
                                            <div className="flex gap-2">
                                                <div className="relative">
                                                    <select
                                                        className="pl-3 pr-8 py-1.5 bg-secondary/50 rounded-lg text-xs font-medium focus:outline-none cursor-pointer hover:bg-secondary transition-colors appearance-none"
                                                        value={newTask.priority}
                                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                                    >
                                                        <option value="Low">Low Priority</option>
                                                        <option value="Medium">Medium Priority</option>
                                                        <option value="High">High Priority</option>
                                                    </select>
                                                </div>
                                                <Input
                                                    type="datetime-local"
                                                    className="w-auto h-8 text-xs bg-secondary/50 border-0 rounded-lg"
                                                    value={newTask.dueDate}
                                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                                />
                                            </div>
                                            <Button type="submit" size="sm" className="rounded-lg">
                                                {isEditing ? 'Update Task' : 'Create Task'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Task List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                            ))
                        ) : (
                            !loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="bg-secondary/30 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ListTodo className="h-10 w-10 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-muted-foreground">No tasks found. Add one to get started!</p>
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>

                {hasMore && tasks.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <Button variant="ghost" onClick={loadMore} disabled={loading} className="text-muted-foreground hover:text-primary">
                            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            {loading ? 'Loading...' : 'Load More Tasks'}
                        </Button>
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
