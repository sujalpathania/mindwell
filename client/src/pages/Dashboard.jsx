import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Edit3, BarChart2, Wind, Calendar, CheckCircle2, Zap, Heart, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SmartSuggestions from '../components/SmartSuggestions';

const moodEmojis = ['😞','😔','😐','🙂','😊','😄','🤩','😇','🥳','🌟'];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item = {
    hidden: { opacity: 0, y: 24 },
    show:   { opacity: 1, y: 0,  transition: { type: 'spring', stiffness: 200, damping: 22 } }
};

const QuickCard = ({ to, icon: Icon, iconBg, iconColor, label, sub, pulse }) => (
    <Link to={to}>
        <motion.div
            whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400, damping: 12 } }}
            whileTap={{ scale: 0.97 }}
            className="glass-card p-5 flex items-center gap-4 cursor-pointer group"
        >
            <motion.div
                animate={pulse ? { scale: [1, 1.12, 1] } : {}}
                transition={pulse ? { duration: 3.5, repeat: Infinity } : {}}
                className={`${iconBg} p-3.5 rounded-2xl ${iconColor} group-hover:brightness-110 transition-all shadow-sm`}
            >
                <Icon className="w-5 h-5" />
            </motion.div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </motion.div>
    </Link>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [mood, setMood]       = useState(5);
    const [energy, setEnergy]   = useState(5);
    const [note, setNote]       = useState('');
    const [logged, setLogged]   = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleMoodSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post('http://localhost:5000/api/mood', { mood, energy, note }, config);
            setLogged(true);
        } catch (err) {
            console.error(err);
        }
    };

    const moodLabel  = mood  <= 2 ? 'Rough' : mood <= 4 ? 'Low' : mood <= 6 ? 'Okay' : mood <= 8 ? 'Good' : 'Excellent';
    const energyLabel = energy <= 2 ? 'Drained' : energy <= 4 ? 'Low' : energy <= 6 ? 'Moderate' : energy <= 8 ? 'Energized' : 'Charged';

    const greetingHour = new Date().getHours();
    const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-8">
            {/* Header */}
            <motion.div variants={item} className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1 tracking-wide uppercase">
                        {greeting} ☀️
                    </p>
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                        Hello,{' '}
                        <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-base">
                        How are you feeling today? Let's check in. 💜
                    </p>
                </div>
                {/* Floating stat pills */}
                <div className="hidden sm:flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800/40">
                        <Heart className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Daily check-in</span>
                    </div>
                    <div className="flex items-center gap-2 bg-fuchsia-50 dark:bg-fuchsia-900/30 px-4 py-2 rounded-full border border-fuchsia-100 dark:border-fuchsia-800/40">
                        <Zap className="w-4 h-4 text-fuchsia-500" />
                        <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-300">Track your energy</span>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mood Logger */}
                <motion.div variants={item} className="col-span-1 md:col-span-2">
                    <div className="glass-panel p-8 relative overflow-hidden h-full">
                        {/* Subtle bg accent */}
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

                        <AnimatePresence mode="wait">
                            {!logged ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onSubmit={handleMoodSubmit}
                                    className="space-y-7 relative z-10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary">
                                            <Smile className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daily Check-in</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Track how you're doing right now</p>
                                        </div>
                                    </div>

                                    {/* Mood Emoji Picker */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mood</label>
                                            <span className="text-sm font-extrabold text-primary bg-primary/10 px-3 py-0.5 rounded-full">
                                                {moodEmojis[mood - 1]} {moodLabel}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mb-3">
                                            {moodEmojis.map((emoji, i) => (
                                                <button
                                                    type="button"
                                                    key={i}
                                                    onClick={() => setMood(i + 1)}
                                                    className={`mood-emoji ${mood === i + 1 ? 'active' : ''}`}
                                                    title={`Mood ${i + 1}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="range" min="1" max="10" value={mood}
                                            onChange={(e) => setMood(parseInt(e.target.value))}
                                            className="w-full"
                                            style={{ background: `linear-gradient(to right, #6366f1 ${(mood - 1) * 11.1}%, #e2e8f0 ${(mood - 1) * 11.1}%)` }}
                                        />
                                    </div>

                                    {/* Energy Slider */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Energy</label>
                                            <span className="text-sm font-extrabold text-secondary bg-secondary/10 px-3 py-0.5 rounded-full">
                                                ⚡ {energyLabel} — {energy}/10
                                            </span>
                                        </div>
                                        <input
                                            type="range" min="1" max="10" value={energy}
                                            onChange={(e) => setEnergy(parseInt(e.target.value))}
                                            className="w-full"
                                            style={{ background: `linear-gradient(to right, #d946ef ${(energy - 1) * 11.1}%, #e2e8f0 ${(energy - 1) * 11.1}%)` }}
                                        />
                                        <div className="flex justify-between text-xs text-slate-400 mt-1.5 font-medium">
                                            <span>Drained</span>
                                            <span>Fully charged</span>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Quick note <span className="font-normal text-slate-400">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={note}
                                            placeholder="What's on your mind? e.g. 'Feeling rested'"
                                            onChange={(e) => setNote(e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="submit"
                                        className="btn-gradient w-full sm:w-auto px-10 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Log Check-in
                                    </motion.button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0.85, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-14 relative z-10"
                                >
                                    <div className="relative mb-5">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                                            <CheckCircle2 className="w-10 h-10 text-white" />
                                        </div>
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full bg-emerald-400/30"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">
                                        Check-in Complete! 🎉
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                                        You're building an amazing habit. Keep it up — consistency is key to mental wellness.
                                    </p>
                                    <button
                                        onClick={() => setLogged(false)}
                                        className="mt-6 text-sm text-primary font-semibold hover:underline"
                                    >
                                        Log another →
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item} className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                        Quick Actions
                    </h3>

                    <QuickCard
                        to="/journal"
                        icon={Edit3}
                        iconBg="bg-blue-100 dark:bg-blue-900/40"
                        iconColor="text-blue-600 dark:text-blue-400"
                        label="Journal"
                        sub="Write about your day"
                    />
                    <QuickCard
                        to="/calendar"
                        icon={Calendar}
                        iconBg="bg-amber-100 dark:bg-amber-900/40"
                        iconColor="text-amber-600 dark:text-amber-400"
                        label="Calendar"
                        sub="Mood history"
                    />
                    <QuickCard
                        to="/analytics"
                        icon={BarChart2}
                        iconBg="bg-violet-100 dark:bg-violet-900/40"
                        iconColor="text-violet-600 dark:text-violet-400"
                        label="Insights"
                        sub="View your mood trends"
                    />
                    <QuickCard
                        to="/breathe"
                        icon={Wind}
                        iconBg="bg-teal-100 dark:bg-teal-900/40"
                        iconColor="text-teal-600 dark:text-teal-400"
                        label="Breathe"
                        sub="4-7-8 relaxation exercise"
                        pulse
                    />

                    {/* Motivational quote card */}
                    <motion.div
                        variants={item}
                        className="mt-2 glass-card p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10"
                    >
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Daily Wisdom</p>
                        <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
                            "Almost everything will work again if you unplug it for a few minutes — including you."
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-medium">— Anne Lamott</p>
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Smart Suggestions ── */}
            <motion.div variants={item}>
                <SmartSuggestions
                    mood={mood}
                    refreshKey={refreshKey}
                    onRefresh={() => setRefreshKey(k => k + 1)}
                />
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
