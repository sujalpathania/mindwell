import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Brain } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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

/* ── Generic styling for AI suggestions ──────────────── */
const SUGGESTION_STYLES = [
  { color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-300/40 dark:border-blue-700/40', emoji: '✨' },
  { color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-300/40 dark:border-violet-700/40', emoji: '🧘' },
  { color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-300/40 dark:border-emerald-700/40', emoji: '🌿' },
];

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

const SmartSuggestions = ({ mood, energy = 5, refreshKey, onRefresh }) => {
  const { user } = useAuth();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  const tier = getMoodTier(mood);
  const meta = TIER_META[tier];

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`http://localhost:5000/api/mood/smart-suggestions?mood=${mood}&energy=${energy}`, config);
      setPicks(data.suggestions || []);
    } catch (err) {
      console.error('Failed to fetch AI suggestions:', err);
      // Fallback is handled by the backend, but we can set an empty state here if needed
    } finally {
      setLoading(false);
    }
  }, [mood, energy, user.token]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions, refreshKey]);

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
            <Brain className="w-4 h-4 text-white" />
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
          disabled={loading}
          whileHover={!loading ? { rotate: 180, scale: 1.1 } : {}}
          whileTap={!loading ? { scale: 0.9 } : {}}
          transition={{ duration: 0.35 }}
          onClick={onRefresh}
          title="Refresh AI suggestions"
          className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/10 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Suggestion cards */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </motion.div>
        ) : (
          <motion.ul
            key={JSON.stringify(picks)}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-3 relative z-10"
          >
            {picks.map((suggestionText, i) => {
              const style = SUGGESTION_STYLES[i % SUGGESTION_STYLES.length];
              return (
                <motion.li
                  key={i}
                  variants={cardVariants}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-r ${style.color} border ${style.border} backdrop-blur-sm`}
                >
                  {/* Number badge */}
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${meta.bg} text-white text-xs font-bold flex items-center justify-center shadow-sm`}>
                    {i + 1}
                  </span>

                  {/* Icon */}
                  <span className="text-xl leading-none">{style.emoji}</span>

                  {/* Text */}
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                    {suggestionText}
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Footer hint */}
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center relative z-10">
        ✨ Suggestions update as your mood changes · Tap <RefreshCw className="inline w-3 h-3 mb-0.5" /> for new picks
      </p>
    </motion.div>
  );
};

export default SmartSuggestions;
