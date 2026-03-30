import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListSkeleton } from '../components/Skeleton';

const Journal = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState('');
    const [prompt, setPrompt] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const prompts = [
        "What made you smile today?",
        "Describe a moment where you felt at peace.",
        "What is something you are grateful for?",
        "What is a challenge you overcame recently?",
        "How are you feeling right now?"
    ];

    useEffect(() => {
        if (user?.token) {
            fetchEntries();
        }
        setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }, [user?.token]);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/journal', config);
            setEntries(data);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post('http://localhost:5000/api/journal', { content: newEntry, prompt }, config);
            setEntries([data, ...entries]);
            setNewEntry('');
            setShowForm(false);
            setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
        } catch (error) {
            console.error('Error creating entry:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(`http://localhost:5000/api/journal/${id}`, config);
            setEntries(entries.filter(entry => entry._id !== id));
        } catch (error) {
            console.error(error);
        }
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
        >
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Your Journal</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Capture your thoughts and memories.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.25)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 bg-primary hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Entry</span>
                </motion.button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="mb-10 overflow-hidden"
                    >
                        <div className="glass-panel p-8 border border-primary/10 ring-4 ring-primary/5">
                            <div className="flex items-start space-x-3 mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                                <BookOpen className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Today's Prompt</p>
                                    <p className="text-lg text-slate-700 dark:text-slate-200 italic">"{prompt}"</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <textarea
                                    value={newEntry}
                                    onChange={(e) => setNewEntry(e.target.value)}
                                    placeholder="Start writing..."
                                    className="w-full h-48 p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none text-lg leading-relaxed shadow-inner"
                                    required
                                />
                                <div className="flex justify-end mt-6 space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                                    >
                                        Save <span className="hidden sm:inline">Entry</span>
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
            >
                {loading ? (
                    <ListSkeleton />
                ) : (
                    <AnimatePresence mode="popLayout">
                        {entries.map(entry => (
                            <motion.div
                                key={entry._id}
                                variants={item}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, x: -100 }}
                                layout
                                className="glass-card p-8 group relative overflow-hidden"
                            >
                                {/* Decorative gradient accent */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="flex justify-between items-start mb-4 pl-2">
                                    <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(entry._id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Delete entry"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {entry.prompt && (
                                    <div className="mb-4 pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">
                                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 italic">
                                            {entry.prompt}
                                        </p>
                                    </div>
                                )}

                                <div className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-lg pl-2">
                                    {entry.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {entries.length === 0 && !showForm && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="bg-slate-100 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-xl font-medium text-slate-600 dark:text-slate-300">Your journal is empty</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">Start writing today to track your journey.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-6 text-primary font-medium hover:underline"
                        >
                            Create your first entry
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Journal;
