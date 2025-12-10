import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import SummaryModal from '../components/SummaryModal';
import { isToday, isFuture, parseISO, compareAsc } from 'date-fns';

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
            } else {
                const res = await api.post('/todos', newTask);
                setTasks([...tasks, res.data]);
            }
            setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium' });
        } catch (error) {
            console.error('Error saving task:', error);
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/todos/${id}`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            const res = await api.put(`/todos/${task._id}`, { ...task, isCompleted: !task.isCompleted });
            setTasks(tasks.map(t => t._id === task._id ? res.data : t));
        } catch (error) {
            console.error('Error updating task:', error);
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
                setSummaryData({ content: "You haven't completed any tasks today yet! Go crush it! 🚀" });
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
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        🚀 ToDo GenAI
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 hidden sm:inline">Hello, {user.username}</span>
                        <button
                            onClick={handleGenerateSummary}
                            className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-purple-200 transition flex items-center gap-1"
                        >
                            ✨ AI Summary
                        </button>
                        <button onClick={logout} className="text-gray-500 hover:text-red-500">Logout</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Task Form */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        {isEditing ? '✏️ Edit Task' : '➕ Add New Task'}
                    </h2>
                    <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="What needs to be done?"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                            <div className="flex gap-2">
                                <select
                                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="Low">Low Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="High">High Priority</option>
                                </select>
                                <input
                                    type="date"
                                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <textarea
                            placeholder="Description (optional)"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(false); setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium' }); }}
                                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                            >
                                {isEditing ? 'Update Task' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Task Sections */}
                <div className="space-y-8">
                    {/* Today's Focus */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            🌞 Today's Focus <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{todayTasks.length}</span>
                        </h2>
                        {todayTasks.length > 0 ? (
                            <div className="grid gap-2">
                                {todayTasks.map(task => (
                                    <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No tasks due today.</p>
                        )}
                    </section>

                    {/* Upcoming */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            📅 Upcoming <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">{upcomingTasks.length + noDateTasks.length}</span>
                        </h2>
                        {upcomingTasks.length > 0 || noDateTasks.length > 0 ? (
                            <div className="grid gap-2">
                                {[...upcomingTasks, ...noDateTasks].map(task => (
                                    <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No upcoming tasks.</p>
                        )}
                    </section>

                    {/* Completed */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            ✅ Completed <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{completedTasks.length}</span>
                        </h2>
                        {completedTasks.length > 0 ? (
                            <div className="grid gap-2 opacity-75 hover:opacity-100 transition">
                                {completedTasks.map(task => (
                                    <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No completed tasks yet.</p>
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
