import { format } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
    const priorityColor = {
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Low: 'bg-green-100 text-green-800',
    };

    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${task.isCompleted ? 'border-green-500 opacity-75' : 'border-blue-500'} mb-3 transition hover:shadow-md`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => onToggleComplete(task)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                        />
                        <h3 className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                        </h3>
                    </div>
                    {task.description && <p className="text-gray-600 text-sm mb-2 ml-7">{task.description}</p>}

                    <div className="flex items-center gap-4 ml-7 text-xs text-gray-500">
                        {task.dueDate && (
                            <span className="flex items-center gap-1">
                                📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}
                            </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full ${priorityColor[task.priority] || 'bg-gray-100'}`}>
                            {task.priority}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 ml-2">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onDelete(task._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
