import { format } from 'date-fns';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trash2, Pencil, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
    const priorityColor = {
        High: 'bg-red-500/10 text-red-600 dark:text-red-400',
        Medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        Low: 'bg-green-500/10 text-green-600 dark:text-green-400',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
        >
            <Card className={`mb-3 transition-colors hover:bg-muted/50 ${task.isCompleted ? 'opacity-70' : ''}`}>
                <div className={`border-l-4 rounded-l-lg h-full absolute top-0 left-0 ${task.isCompleted ? 'border-green-500' : 'border-blue-500'}`}></div>
                <CardContent className="p-4 flex justify-between items-start relative">

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <input
                                type="checkbox"
                                checked={task.isCompleted}
                                onChange={() => onToggleComplete(task)}
                                className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                            <h3 className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
                                {task.title}
                            </h3>
                        </div>
                        {task.description && <p className="text-muted-foreground text-sm mb-2 ml-7">{task.description}</p>}

                        <div className="flex items-center gap-4 ml-7 text-xs text-muted-foreground">
                            {task.dueDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full ${priorityColor[task.priority] || 'bg-secondary'}`}>
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 ml-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(task)}
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                            title="Edit"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(task._id)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TaskCard;
