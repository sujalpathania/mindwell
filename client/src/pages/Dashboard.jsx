import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Edit3, Activity, Wind, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const [mood, setMood] = useState(5);
    const [energy, setEnergy] = useState(5);
    const [note, setNote] = useState('');
    const [logged, setLogged] = useState(false);

    const handleMoodSubmit = async (e) => {
        e.preventDefault();
        const MOTION=motion;
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post('http://localhost:5000/api/mood', { mood, energy, note }, config);
            setLogged(true);
        } catch (error) {
            console.error(error);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <motion.header variants={item} className="mb-8">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
                    Hello, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{user?.name}</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Ready to take care of your mind today?</p>
            </motion.header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Mood Logger */}
                <motion.div variants={item} className="col-span-1 md:col-span-2 glass-panel p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>

                    {!logged ? (
                        <form onSubmit={handleMoodSubmit} className="space-y-8">
                            <h3 className="text-2xl font-semibold mb-6 flex items-center">
                                <Activity className="w-6 h-6 mr-3 text-primary" />
                                Daily Check-in
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mood</label>
                                        <span className="text-sm font-bold text-primary">{mood}/10</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="10" value={mood}
                                        onChange={(e) => setMood(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>Rough</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Energy</label>
                                        <span className="text-sm font-bold text-secondary">{energy}/10</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="10" value={energy}
                                        onChange={(e) => setEnergy(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>Drained</span>
                                        <span>Charged</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Note (Optional)</label>
                                <input
                                    type="text" value={note} placeholder="How are you feeling in one word?"
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(99, 102, 241, 0.3)" }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                type="submit"
                                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all w-full md:w-auto"
                            >
                                Log Check-in
                            </motion.button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center py-12"
                        >
                            <div className="text-green-500 mb-4 bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600 mb-2">Check-in Complete!</h3>
                            <p className="text-slate-600 dark:text-slate-400">You're building a great habit.</p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item} className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 px-1">Quick Actions</h3>

                    <Link to="/journal">
                        <motion.div
                            whileHover={{
                                y: -8,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="glass-card p-6 flex items-center space-x-4 cursor-pointer mb-5 group"
                        >
                            <motion.div
                                whileHover={{ rotate: 15 }}
                                className="bg-blue-100 dark:bg-blue-900/40 p-3.5 rounded-xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors"
                            >
                                <Edit3 className="w-6 h-6" />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-lg">Journal</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Write about your day</p>
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/analytics">
                        <motion.div
                            whileHover={{
                                y: -8,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="glass-card p-6 flex items-center space-x-4 cursor-pointer mb-5 group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-purple-100 dark:bg-purple-900/40 p-3.5 rounded-xl text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors"
                            >
                                <Activity className="w-6 h-6" />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-lg">Insights</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">View your trends</p>
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/breathe">
                        <motion.div
                            whileHover={{
                                y: -8,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="glass-card p-6 flex items-center space-x-4 cursor-pointer group"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="bg-teal-100 dark:bg-teal-900/40 p-3.5 rounded-xl text-teal-600 dark:text-teal-400 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors"
                            >
                                <Wind className="w-6 h-6" />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-lg">Breathe</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Relaxation exercise</p>
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
