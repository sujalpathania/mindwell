import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';

/* ── Rule-based suggestion bank ─────────────────────── */
const SUGGESTIONS = {
  low: [
    { text: 'Try a breathing exercise', emoji: '🧘', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-300/40 dark:border-blue-700/40', icon: '🫁' },
    { text: 'Write your thoughts in a journal', emoji: '✍️', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-300/40 dark:border-violet-700/40', icon: '📖' },
    { text: 'Take a short break and relax', emoji: '🌿', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-300/40 dark:border-emerald-700/40', icon: '🌿' },
    { text: 'Listen to calming music', emoji: '🎧', color: 'from-sky-500/20 to-cyan-500/20', border: 'border-sky-300/40 dark:border-sky-700/40', icon: '🎵' },
    { text: 'Talk to someone you trust', emoji: '💬', color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-300/40 dark:border-pink-700/40', icon: '🤝' },
  ],
  medium: [
    { text: 'Go for a walk outside', emoji: '🚶', color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-300/40 dark:border-amber-700/40', icon: '👟' },
    { text: 'Do light exercise or stretching', emoji: '💪', color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-300/40 dark:border-orange-700/40', icon: '🏃' },
    { text: 'Listen to your favorite songs', emoji: '🎶', color: 'from-fuchsia-500/20 to-pink-500/20', border: 'border-fuchsia-300/40 dark:border-fuchsia-700/40', icon: '🎸' },
    { text: 'Spend time with friends or family', emoji: '👨‍👩‍👧', color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-300/40 dark:border-green-700/40', icon: '❤️' },
    { text: 'Focus on a small productive task', emoji: '✅', color: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-300/40 dark:border-teal-700/40', icon: '⚡' },
  ],
  high: [
    { text: 'Keep it up — you\'re doing great!', emoji: '😊', color: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-300/40 dark:border-yellow-700/40', icon: '⭐' },
    { text: 'Work on your goals today', emoji: '🚀', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-300/40 dark:border-indigo-700/40', icon: '🎯' },
    { text: 'Help someone or spread positivity', emoji: '🌟', color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-300/40 dark:border-rose-700/40', icon: '🤗' },
    { text: 'Try something new or creative', emoji: '🎨', color: 'from-violet-500/20 to-fuchsia-500/20', border: 'border-violet-300/40 dark:border-violet-700/40', icon: '✨' },
    { text: 'Plan your next achievement', emoji: '🎯', color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-300/40 dark:border-emerald-700/40', icon: '📋' },
  ],
};

/* ── Map 1–10 mood score → tier ─────────────────────── */
const getMoodTier = (score) => {
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
};

const TIER_META = {
  low:    { label: 'Low Mood', color: 'text-blue-600 dark:text-blue-400',   bg: 'from-blue-500 to-indigo-500',   ring: 'ring-blue-200 dark:ring-blue-800' },
  medium: { label: 'Neutral',  color: 'text-amber-600 dark:text-amber-400', bg: 'from-amber-500 to-orange-500',  ring: 'ring-amber-200 dark:ring-amber-800' },
  high:   { label: 'High Mood',color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-200 dark:ring-emerald-800' },
};

/* ── Pick N random items without repetition ─────────── */
const pickRandom = (arr, n) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

/* ── Animation variants ─────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  exit:   { opacity: 0, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  show:   { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 22 } },
  exit:   { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.15 } },
};

/* ════════════════════════════════════════════════════ */
const SmartSuggestions = ({ mood, refreshKey, onRefresh }) => {
  const tier = getMoodTier(mood);
  const meta = TIER_META[tier];

  /* Re-pick whenever mood tier changes OR a manual refresh is triggered */
  const picks = useMemo(
    () => pickRandom(SUGGESTIONS[tier], 3),
    [tier, refreshKey]   // refreshKey is a plain number — stable dependency
  );

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } } }}
      className="glass-panel p-6 relative overflow-hidden"
    >
      {/* Subtle bg blobs */}
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.bg} flex items-center justify-center shadow-sm ring-2 ${meta.ring}`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
              Smart Suggestions
            </h3>
            <p className={`text-xs font-semibold ${meta.color}`}>
              Based on your {meta.label}
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <motion.button
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.35 }}
          onClick={onRefresh}
          title="Refresh suggestions"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Suggestion cards */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={`${tier}-${JSON.stringify(picks.map(p => p.text))}`}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="space-y-3 relative z-10"
        >
          {picks.map((suggestion, i) => (
            <motion.li
              key={suggestion.text}
              variants={cardVariants}
              className={`flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-r ${suggestion.color} border ${suggestion.border} backdrop-blur-sm`}
            >
              {/* Number badge */}
              <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${meta.bg} text-white text-xs font-bold flex items-center justify-center shadow-sm`}>
                {i + 1}
              </span>

              {/* Icon */}
              <span className="text-xl leading-none">{suggestion.emoji}</span>

              {/* Text */}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                {suggestion.text}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {/* Footer hint */}
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center relative z-10">
        ✨ Suggestions update as your mood changes · Tap <RefreshCw className="inline w-3 h-3 mb-0.5" /> for new picks
      </p>
    </motion.div>
  );
};

export default SmartSuggestions;
