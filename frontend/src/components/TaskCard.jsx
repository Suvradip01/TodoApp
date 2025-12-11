import { format } from 'date-fns';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trash2, Pencil, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
    const priorityColors = {
        High: 'bg-red-500/10 text-red-600 border-red-500/20',
        Medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        Low: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card className={`group relative border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-card/60 backdrop-blur-sm ${task.isCompleted ? 'opacity-60' : 'opacity-100'}`}>
                {/* Priority Indicator Strip */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${task.priority === 'High' ? 'bg-red-500' :
                        task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />

                <CardContent className="p-4 pl-6 flex items-start gap-4">
                    {/* Checkbox Area */}
                    <div className="pt-1">
                        <div
                            onClick={() => onToggleComplete(task)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors duration-300 ${task.isCompleted
                                    ? 'bg-primary border-primary'
                                    : 'border-muted-foreground/40 hover:border-primary'
                                }`}
                        >
                            {task.isCompleted && (
                                <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3.5 h-3.5 text-primary-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-medium text-lg leading-tight truncate mb-1 transition-all ${task.isCompleted ? 'text-muted-foreground line-through decoration-auto' : 'text-foreground'}`}>
                                {task.title}
                            </h3>

                            {/* Actions (visible on hover/focus) */}
                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(task)}
                                    className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(task._id)}
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {task.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {task.dueDate && (
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${isOverdue ? 'bg-red-500/10 text-red-600' : 'bg-secondary/50'}`}>
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{format(new Date(task.dueDate), 'MMM d, h:mm a')}</span>
                                </div>
                            )}

                            <div className={`px-2 py-1 rounded-md border ${priorityColors[task.priority]}`}>
                                {task.priority}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TaskCard;
