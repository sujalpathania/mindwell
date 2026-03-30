import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartSkeleton } from '../components/Skeleton';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Analytics = () => {
    const { user } = useAuth();
    const [moodData, setMoodData] = useState([]);
    const [loading, setLoading] = useState(true);
    const MOTION=motion;

    useEffect(() => {
        const fetchMoods = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get('http://localhost:5000/api/mood', config);
                setMoodData(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setLoading(false);
            }
        };
        if (user?.token) {
            fetchMoods();
        }
    }, [user?.token]);

    // Process data for charts
    const displayData = Array.isArray(moodData) ? moodData : [];

    const lineChartData = {
        labels: displayData.map(log => new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Mood',
                data: displayData.map(log => log.mood),
                borderColor: 'rgb(99, 102, 241)', // Primary Indigo
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.4,
            },
            {
                label: 'Energy',
                data: displayData.map(log => log.energy),
                borderColor: 'rgb(236, 72, 153)', // Pink
                backgroundColor: 'rgba(236, 72, 153, 0.5)',
                tension: 0.4,
            },
        ],
    };

    const moodCounts = displayData.reduce((acc, log) => {
        if (log.mood >= 8) acc.great++;
        else if (log.mood >= 5) acc.okay++;
        else acc.bad++;
        return acc;
    }, { great: 0, okay: 0, bad: 0 });

    const pieChartData = {
        labels: ['Great (8-10)', 'Okay (5-7)', 'Low (1-4)'],
        datasets: [
            {
                data: [moodCounts.great, moodCounts.okay, moodCounts.bad],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(234, 179, 8, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                >
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </div>
                    <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    variants={container}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-8"
                >
                    <motion.h2 variants={item} className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Mood Analytics
                    </motion.h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <motion.div variants={item} className="glass-panel p-6">
                            <h3 className="text-lg font-semibold mb-4 text-center text-slate-700 dark:text-slate-200">Mood & Energy Trends</h3>
                            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-2">
                                {displayData.length > 0 ? (
                                    <Line
                                        data={lineChartData}
                                        options={{
                                            responsive: true,
                                            scales: {
                                                y: { min: 0, max: 10, grid: { color: 'rgba(0,0,0,0.05)' } },
                                                x: { grid: { display: false } }
                                            },
                                            plugins: { legend: { position: 'bottom' } }
                                        }}
                                    />
                                ) : (
                                    <p className="text-center text-slate-600 dark:text-slate-400 py-10">No data yet</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="glass-panel p-6 flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-4 text-center text-slate-700 dark:text-slate-200">Emotional Distribution</h3>
                            <div className="w-64">
                                {displayData.length > 0 ? (
                                    <Pie data={pieChartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                                ) : (
                                    <p className="text-center text-slate-600 dark:text-slate-400 py-10">No data yet</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={item} className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Export Data</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Download a copy of your personal data.</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(moodData));
                                const downloadAnchorNode = document.createElement('a');
                                downloadAnchorNode.setAttribute("href", dataStr);
                                downloadAnchorNode.setAttribute("download", "mindwell_data.json");
                                document.body.appendChild(downloadAnchorNode);
                                downloadAnchorNode.click();
                                downloadAnchorNode.remove();
                            }}
                            className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-2.5 rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-500/20 font-medium"
                        >
                            Export JSON
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Analytics;
