import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, MessageSquare, Zap, Smile } from 'lucide-react';

const moodEmojis = {
    happy: '😊',
    neutral: '😐',
    sad: '😔',
    empty: '▫️'
};

const getMoodEmoji = (mood) => {
    if (!mood) return null;
    if (mood >= 8) return moodEmojis.happy;
    if (mood >= 5) return moodEmojis.neutral;
    return moodEmojis.sad;
};

const Calendar = () => {
    const { user } = useAuth();
    const [moodLogs, setMoodLogs] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMoods = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get('http://localhost:5000/api/mood', config);
                setMoodLogs(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching moods:', error);
                setLoading(false);
            }
        };
        if (user?.token) fetchMoods();
    }, [user?.token]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDay(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDay(null);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Previous month trailing days
    for (let i = startDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, logs: [] });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
        const dateStr = new Date(year, month, i).toDateString();
        const logsForDay = moodLogs.filter(log => new Date(log.createdAt).toDateString() === dateStr);
        days.push({ day: i, isCurrentMonth: true, logs: logsForDay });
    }

    // Next month leading days (fill up to 42 cells to maintain 6-row grid)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
        days.push({ day: i, isCurrentMonth: false, logs: [] });
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } }
    };

    const dayVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="space-y-8 pb-10"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-primary" />
                        Mood <span className="gradient-text">Calendar</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Visualize your emotional journey over time.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-800/40 p-2 rounded-2xl border border-white/20 backdrop-blur-sm shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/60 dark:hover:bg-slate-700 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200 min-w-[140px] text-center">
                        {monthName} {year}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/60 dark:hover:bg-slate-700 rounded-xl transition-all">
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 glass-panel p-6 sm:p-8">
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-xs font-extra-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                        <AnimatePresence mode="popLayout">
                            {days.map((d, index) => {
                                const isSelected = selectedDay && selectedDay.day === d.day && d.isCurrentMonth;
                                const hasMood = d.logs.length > 0;
                                const latestMood = hasMood ? d.logs[d.logs.length - 1].mood : null;

                                return (
                                    <motion.button
                                        key={`${month}-${index}`}
                                        variants={dayVariants}
                                        onClick={() => d.isCurrentMonth && setSelectedDay(d)}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`
                                            relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all border
                                            ${!d.isCurrentMonth 
                                                ? 'opacity-30 hover:opacity-100 bg-slate-50/20 dark:bg-slate-900/10 cursor-default' 
                                                : 'cursor-pointer'}
                                            ${isSelected 
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 z-10' 
                                                : hasMood 
                                                    ? 'bg-white dark:bg-slate-800 border-primary/20 dark:border-slate-700 shadow-sm' 
                                                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'}
                                        `}
                                    >
                                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {d.day}
                                        </span>
                                        {hasMood && (
                                            <span className="text-xl mt-1 leading-none">
                                                {getMoodEmoji(latestMood)}
                                            </span>
                                        )}
                                        {/* Dots for multiple logs */}
                                        {d.logs.length > 1 && (
                                            <div className="absolute top-1.5 right-1.5 flex gap-0.5">
                                                <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Day Details View */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedDay ? (
                            <motion.div
                                key={selectedDay.day}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-panel p-8 h-full flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold">
                                        {monthName} {selectedDay.day}, {year}
                                    </div>
                                    <button 
                                        onClick={() => setSelectedDay(null)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        Close
                                    </button>
                                </div>

                                {selectedDay.logs.length > 0 ? (
                                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedDay.logs.map((log, idx) => (
                                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                       <div className="text-3xl">{getMoodEmoji(log.mood)}</div>
                                                       <div>
                                                           <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                               {log.mood >= 8 ? 'Feeling Great' : log.mood >= 5 ? 'Feeling Okay' : 'Feeling Low'}
                                                           </p>
                                                           <p className="text-xs text-slate-500">
                                                               {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                           </p>
                                                       </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-fuchsia-50 dark:bg-fuchsia-900/20 px-3 py-1 rounded-lg border border-fuchsia-100 dark:border-fuchsia-800/30">
                                                        <Zap className="w-3.5 h-3.5 text-fuchsia-500" />
                                                        <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-300">
                                                            {log.energy}/10 Energy
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {log.note ? (
                                                    <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                        <div className="flex gap-2.5">
                                                            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                                "{log.note}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic flex items-center gap-1.5">
                                                        <Info className="w-3.5 h-3.5" /> No note for this entry
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                            <CalendarIcon className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Activity</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-500 max-w-[200px]">
                                            You didn't log your mood on this day.
                                        </p>
                                    </div>
                                )}
                                
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button className="w-full btn-gradient flex items-center justify-center gap-2">
                                        <Smile className="w-4 h-4" /> Add Memory
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center border-dashed"
                            >
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center rotate-6">
                                        <CalendarIcon className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center -rotate-12 shadow-lg">
                                        <Smile className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Select a Date</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Click on any day in the calendar to see your mood logs, energy levels, and personal notes.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Calendar;
