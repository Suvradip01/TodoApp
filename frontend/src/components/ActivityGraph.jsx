import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

import api from '../api/axios';

const ActivityGraph = () => {
    const [dataset, setDataset] = useState([]);
    const theme = useTheme();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/todos/stats');
                console.log("ActivityGraph Fetched Data:", res.data); // DEBUG LOG
                processData(res.data || []);
            } catch (error) {
                console.error("Failed to load graph data", error);
                processData([]);
            }
        };
        fetchStats();
    }, []);

    const processData = (todos) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                date: date,
                label: format(date, 'EEE'),
                created: 0,
                completed: 0
            };
        });

        todos.forEach(todo => {
            const createdDate = parseISO(todo.createdAt);
            const createdDayStat = last7Days.find(d => isSameDay(d.date, createdDate));
            if (createdDayStat) {
                createdDayStat.created += 1;
            }

            if (todo.isCompleted && todo.completedAt) {
                const completedDate = parseISO(todo.completedAt);
                const completedDayStat = last7Days.find(d => isSameDay(d.date, completedDate));
                if (completedDayStat) {
                    completedDayStat.completed += 1;
                }
            } else if (todo.isCompleted && !todo.completedAt) {
                // Fallback for old tasks that might not have completedAt
                // We use updatedAt as a proxy or just ignore them to avoid "invalid" data
                const updatedDate = parseISO(todo.updatedAt || todo.createdAt);
                const fallbackStat = last7Days.find(d => isSameDay(d.date, updatedDate));
                if (fallbackStat) fallbackStat.completed += 1;
            }
        });

        setDataset(last7Days);
    };



    const chartSetting = {
        yAxis: [{
            label: 'Tasks',
            labelStyle: { fill: 'var(--chart-text)' },
            tickLabelStyle: { fill: 'var(--chart-text)' },
        }],
        series: [
            {
                dataKey: 'created',
                label: 'Created',
                color: '#3b82f6', // Bright Blue
                area: true,
                showMark: false,
                curve: 'catmullRom'
            },
            {
                dataKey: 'completed',
                label: 'Completed',
                color: '#eab308', // Yellow/Gold
                area: true,
                showMark: false,
                curve: 'catmullRom'
            },
        ],
        height: 300,
        sx: {
            // Light Mode Defaults
            [`.${axisClasses.root}`]: {
                [`.${axisClasses.tick}, .${axisClasses.line}`]: {
                    stroke: 'var(--chart-text)',
                    strokeWidth: 1,
                },
                [`.${axisClasses.text}`]: {
                    fill: 'var(--chart-text)',
                },
            },

            // Custom styling for the area gradients
            '& .MuiAreaElement-series-created': {
                fill: "url('#createdGradient')",
            },
            '& .MuiAreaElement-series-completed': {
                fill: "url('#completedGradient')",
            },
        },
    };

    return (
        <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            background: '#ffffff', // Light Mode Default
            color: '#0f172a', // Slate-900
            border: '1px solid #e2e8f0', // Border for light mode

            // Define CSS Variable for Chart Text
            '--chart-text': '#64748b',

            // DARK MODE CONFIGURATION
            '.dark &': {
                background: 'linear-gradient(to bottom right, #000000, #0f172a)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',

                // Update CSS Variable for Dark Mode
                '--chart-text': '#ffffff',
            },

            // Force Hide Default Legend (CSS Override)
            '& .MuiChartsLegend-root': {
                display: 'none !important',
            },
        }} className="h-full group">
            <CardContent>
                <div className="flex flex-row items-start justify-between mb-4">
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'inherit' }}>
                        Weekly Activity
                        <Typography component="span" variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 'normal', '.dark &': { color: '#ffffff !important' } }}>
                            Tasks created vs completed
                        </Typography>
                    </Typography>

                    {/* Custom Legend */}
                    <div className="flex items-center gap-4 text-sm mt-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                            <span className="text-slate-600 dark:text-white" style={{ color: 'var(--chart-text)' }}>Created</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                            <span className="text-slate-600 dark:text-white" style={{ color: 'var(--chart-text)' }}>Completed</span>
                        </div>
                    </div>
                </div>
                <div style={{ width: '100%', flexGrow: 1 }}>
                    <LineChart
                        dataset={dataset}
                        xAxis={[{
                            scaleType: 'point',
                            dataKey: 'label',
                            tickLabelStyle: { fill: 'var(--chart-text)' },
                            labelStyle: { fill: 'var(--chart-text)' },
                        }]}
                        {...chartSetting}
                        margin={{ left: 30, right: 30, top: 30, bottom: 30 }}
                        grid={{ horizontal: true }}
                        slotProps={{
                            legend: {
                                hidden: true,
                            },
                            popper: {
                                sx: {
                                    '.MuiChartsTooltip-root': {
                                        backgroundColor: 'rgba(15, 23, 42, 0.9) !important',
                                        border: '1px solid rgba(255,255,255,0.2) !important',
                                        color: '#ffffff !important',
                                    },
                                    '& .MuiChartsTooltip-table .MuiChartsTooltip-cell': {
                                        color: '#ffffff !important',
                                    },
                                    '& .MuiTypography-root': {
                                        color: '#ffffff !important',
                                    }
                                }
                            }
                        }}
                    >
                        <defs>
                            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                    </LineChart>
                </div>
            </CardContent>
        </Card>
    );
};

export default ActivityGraph;
