import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, BookOpen, Feather, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListSkeleton } from '../components/Skeleton';

const Journal = () => {
    const { user } = useAuth();
    const [entries, setEntries]   = useState([]);
    const [newEntry, setNewEntry] = useState('');
    const [prompt, setPrompt]     = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading]   = useState(true);

    const prompts = [
        "What made you smile today?",
        "Describe a moment where you felt at peace.",
        "What is something you are grateful for?",
        "What is a challenge you overcame recently?",
        "How are you feeling right now, and why?",
        "What would you tell your past self from a week ago?",
        "What small thing brought you joy today?",
    ];

    useEffect(() => {
        if (user?.token) fetchEntries();
        setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }, [user?.token]);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5000/api/journal', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setEntries(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                'http://localhost:5000/api/journal',
                { content: newEntry, prompt },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } }
            );
            setEntries([data, ...entries]);
            setNewEntry('');
            setShowForm(false);
            setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this entry? This cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/journal/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setEntries(entries.filter(e => e._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const wordCount = newEntry.trim().split(/\s+/).filter(Boolean).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto pb-10"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-float">
                            <Feather className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold gradient-text tracking-tight">Your Journal</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm ml-10">
                        {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · Capture your thoughts &amp; memories
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-float transition-all ${
                        showForm
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'btn-gradient'
                    }`}
                >
                    {showForm ? <><X className="w-4 h-4" />Cancel</> : <><Plus className="w-4 h-4" />New Entry</>}
                </motion.button>
            </div>

            {/* New Entry Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="glass-panel p-7 border border-primary/15 ring-2 ring-primary/8">
                            {/* Prompt banner */}
                            <div className="flex items-start gap-3 mb-5 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Today's Prompt</p>
                                    <p className="text-base text-slate-700 dark:text-slate-200 italic font-medium">"{prompt}"</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <textarea
                                    value={newEntry}
                                    onChange={(e) => setNewEntry(e.target.value)}
                                    placeholder="Start writing freely… this space is just for you ✨"
                                    className="w-full h-44 p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all resize-none text-base leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                    required
                                />
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-slate-400 font-medium">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="px-5 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold"
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            type="submit"
                                            className="btn-gradient px-7 text-sm"
                                        >
                                            Save Entry ✓
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Entries list */}
            {loading ? (
                <ListSkeleton />
            ) : (
                <AnimatePresence mode="popLayout">
                    {entries.length === 0 && !showForm ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-5 shadow-float">
                                <BookOpen className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-xl font-bold text-slate-600 dark:text-slate-300">Your journal is empty</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1.5">Begin your story — one entry at a time.</p>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowForm(true)}
                                className="mt-6 btn-gradient inline-flex items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" /> Write your first entry
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="space-y-5">
                            {entries.map((entry, idx) => (
                                <motion.div
                                    key={entry._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -80, transition: { duration: 0.25 } }}
                                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200, damping: 24 }}
                                    layout
                                    className="glass-card p-7 group relative overflow-hidden"
                                >
                                    {/* Gradient left accent bar */}
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-l-xl" />

                                    {/* Entry header */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(entry._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>

                                    {/* Prompt used */}
                                    {entry.prompt && (
                                        <div className="mb-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border-l-2 border-indigo-400">
                                            <p className="text-xs text-indigo-500 dark:text-indigo-400 italic font-medium">{entry.prompt}</p>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm">
                                        {entry.content}
                                    </p>

                                    {/* Word count badge */}
                                    <div className="mt-4 flex justify-end">
                                        <span className="text-xs text-slate-400 font-medium">
                                            {entry.content.trim().split(/\s+/).filter(Boolean).length} words
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            )}
        </motion.div>
    );
};

export default Journal;
