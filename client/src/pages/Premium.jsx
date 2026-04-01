import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Flame, BarChart2, Download, BookOpen, Palette, Brain, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } }
};

const premiumFeatures = [
    {
        icon: BarChart2,
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        label: 'Advanced Analytics',
        desc: 'Unlock deep mood trend insights, weekly pattern analysis, and predictive wellness forecasts.'
    },
    {
        icon: Download,
        color: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'Export Your Data',
        desc: 'Download your full mood history and journal entries as CSV or PDF anytime.'
    },
    {
        icon: BookOpen,
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        label: 'Unlimited Journaling',
        desc: 'Write as much as you want — no entry limits, with richer formatting options.'
    },
    {
        icon: Palette,
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-100 dark:bg-pink-900/30',
        label: 'Exclusive Themes',
        desc: 'Access premium colour palettes and custom background themes made for focus.'
    },
    {
        icon: Brain,
        color: 'from-indigo-500 to-blue-600',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        label: 'AI Smart Suggestions+',
        desc: 'More personalised, context-aware mental wellness tips powered by extended AI.'
    },
];

const FeatureCard = ({ icon: Icon, color, bg, label, desc, unlocked }) => (
    <motion.div
        variants={item}
        className={`glass-card p-5 flex gap-4 items-start relative overflow-hidden ${!unlocked ? 'opacity-60' : ''}`}
    >
        <div className={`${bg} p-3 rounded-2xl flex-shrink-0`}>
            <Icon className={`w-5 h-5 bg-gradient-to-r ${color} bg-clip-text text-transparent`}
                  style={{ color: unlocked ? undefined : '#94a3b8' }} />
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
                {unlocked
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <Lock className="w-4 h-4 text-slate-400" />
                }
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
        </div>
    </motion.div>
);

const Premium = () => {
    const { user } = useAuth();
    const streak    = user?.streak    || 0;
    const isPremium = user?.isPremium || false;
    const progress  = Math.min((streak / 30) * 100, 100);
    const daysLeft  = Math.max(30 - streak, 0);

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-8 pb-12">
            {/* Back link */}
            <motion.div variants={item}>
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </motion.div>

            {/* Hero */}
            <motion.div
                variants={item}
                className="relative glass-panel p-8 text-center overflow-hidden"
            >
                {/* Decorative glows */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-fuchsia-400/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    {isPremium ? (
                        <>
                            <motion.div
                                animate={{ rotate: [0, 8, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl"
                            >
                                <Trophy className="w-12 h-12 text-white" />
                            </motion.div>
                            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 mb-2">
                                ✨ Premium Member
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto">
                                You completed a 30-day check-in streak. All premium features are permanently unlocked. You're amazing! 🎉
                            </p>
                            <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg">
                                <Flame className="w-5 h-5 text-white" />
                                <span className="font-bold text-white">{streak} day streak</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center shadow-xl">
                                <Trophy className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">
                                Unlock Premium
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto">
                                Complete a <span className="font-bold text-primary">30-day daily check-in streak</span> to permanently unlock all premium features — no subscription required.
                            </p>

                            {/* Progress section */}
                            <div className="mt-8 max-w-sm mx-auto">
                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="flex items-center gap-1.5">
                                        <Flame className="w-4 h-4 text-orange-500" />
                                        <span className="text-slate-700 dark:text-slate-200">{streak} days done</span>
                                    </span>
                                    <span className="text-slate-500">{daysLeft} days left</span>
                                </div>

                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full relative"
                                    >
                                        {streak > 0 && (
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white">
                                                {Math.round(progress)}%
                                            </span>
                                        )}
                                    </motion.div>
                                </div>

                                <div className="mt-3 flex justify-between text-xs text-slate-400 font-medium">
                                    <span>Day 1</span>
                                    <span>Day 15</span>
                                    <span>Day 30 🏆</span>
                                </div>
                            </div>

                            <Link to="/">
                                <motion.button
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    className="mt-6 btn-gradient px-8"
                                >
                                    Start Today's Check-in
                                </motion.button>
                            </Link>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Features grid */}
            <motion.div variants={item}>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                    Premium Features
                </h2>
                <div className="space-y-3">
                    {premiumFeatures.map((f) => (
                        <FeatureCard key={f.label} {...f} unlocked={isPremium} />
                    ))}
                </div>
            </motion.div>

            {/* How it works */}
            {!isPremium && (
                <motion.div variants={item} className="glass-panel p-6">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">How it works</h2>
                    <ol className="space-y-3">
                        {[
                            ['1', 'Log your daily mood check-in every day from the Dashboard.', 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30'],
                            ['2', 'Your streak increases by 1 each consecutive day you check in.', 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'],
                            ['3', 'Miss a day? No worries — your streak resets but you can always start again.', 'text-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-900/30'],
                            ['30', 'Hit 30 days in a row → Premium is permanently yours. No credit card. Ever.', 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'],
                        ].map(([n, text, cls]) => (
                            <li key={n} className="flex items-start gap-3">
                                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${cls}`}>{n}</span>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">{text}</p>
                            </li>
                        ))}
                    </ol>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Premium;
