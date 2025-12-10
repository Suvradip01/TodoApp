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

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/todos');
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error("Failed to load tasks");
        }
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
                setTasks([...tasks, res.data]);
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
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
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
            // Get completed tasks from today
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

    // Grouping Tasks
    const todayTasks = tasks.filter(t => !t.isCompleted && t.dueDate && isToday(parseISO(t.dueDate)));
    const upcomingTasks = tasks.filter(t => !t.isCompleted && t.dueDate && isFuture(parseISO(t.dueDate)));
    const noDateTasks = tasks.filter(t => !t.isCompleted && !t.dueDate);
    const completedTasks = tasks.filter(t => t.isCompleted);

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
                                            type="date"
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

                {/* Task Sections */}
                <div className="space-y-8">
                    {/* Today's Focus */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <Sun className="h-5 w-5 text-orange-500" /> Today's Focus <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{todayTasks.length}</span>
                        </h2>
                        {todayTasks.length > 0 ? (
                            <div className="grid gap-2">
                                <AnimatePresence mode="popLayout">
                                    {todayTasks.map(task => (
                                        <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">No tasks due today.</p>
                        )}
                    </section>

                    {/* Upcoming */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" /> Upcoming <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">{upcomingTasks.length + noDateTasks.length}</span>
                        </h2>
                        {upcomingTasks.length > 0 || noDateTasks.length > 0 ? (
                            <div className="grid gap-2">
                                <AnimatePresence mode="popLayout">
                                    {[...upcomingTasks, ...noDateTasks].map(task => (
                                        <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">No upcoming tasks.</p>
                        )}
                    </section>

                    {/* Completed */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" /> Completed <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{completedTasks.length}</span>
                        </h2>
                        {completedTasks.length > 0 ? (
                            <div className="grid gap-2 opacity-75 hover:opacity-100 transition">
                                <AnimatePresence mode="popLayout">
                                    {completedTasks.map(task => (
                                        <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">No completed tasks yet.</p>
                        )}
                    </section>
                </div>
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
