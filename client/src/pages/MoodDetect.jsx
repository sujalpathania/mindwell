import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, RefreshCw, ArrowLeft, Lock, Sparkles,
    Smile, Frown, Meh, AlertCircle, CheckCircle2,
    Zap, Heart, Wind, Brain, Star, Trophy
} from 'lucide-react';

// ─── Emotion config ──────────────────────────────────────────────────────────
const EMOTION_CONFIG = {
    happy:    { emoji: '😄', color: 'from-yellow-400 to-amber-500',  bg: 'bg-yellow-50 dark:bg-yellow-900/20',  label: 'Happy',          textColor: 'text-yellow-600 dark:text-yellow-400' },
    sad:      { emoji: '😢', color: 'from-blue-400 to-indigo-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',     label: 'Sad',            textColor: 'text-blue-600 dark:text-blue-400' },
    angry:    { emoji: '😠', color: 'from-red-400 to-rose-500',      bg: 'bg-red-50 dark:bg-red-900/20',       label: 'Angry',          textColor: 'text-red-600 dark:text-red-400' },
    fear:     { emoji: '😰', color: 'from-purple-400 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Anxious',        textColor: 'text-purple-600 dark:text-purple-400' },
    surprise: { emoji: '😲', color: 'from-pink-400 to-fuchsia-500',  bg: 'bg-pink-50 dark:bg-pink-900/20',    label: 'Surprised',      textColor: 'text-pink-600 dark:text-pink-400' },
    disgust:  { emoji: '😒', color: 'from-green-400 to-teal-500',    bg: 'bg-green-50 dark:bg-green-900/20',   label: 'Uncomfortable',  textColor: 'text-green-600 dark:text-green-400' },
    neutral:  { emoji: '😐', color: 'from-slate-400 to-slate-500',   bg: 'bg-slate-50 dark:bg-slate-800/40',  label: 'Calm / Neutral', textColor: 'text-slate-600 dark:text-slate-400' },
};

const SUGGESTION_ICONS = [Heart, Wind, Brain];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item = {
    hidden: { opacity: 0, y: 24 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } }
};

// ─── Scanning animation overlay ──────────────────────────────────────────────
const ScanLine = () => (
    <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 z-10"
        animate={{ top: ['10%', '90%', '10%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    />
);

// ─── Corner brackets overlay ─────────────────────────────────────────────────
const CornerBrackets = ({ color = 'border-primary' }) => (
    <>
        {/* TL */}
        <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 ${color} rounded-tl-lg z-10`} />
        {/* TR */}
        <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 ${color} rounded-tr-lg z-10`} />
        {/* BL */}
        <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 ${color} rounded-bl-lg z-10`} />
        {/* BR */}
        <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 ${color} rounded-br-lg z-10`} />
    </>
);

// ─── Locked overlay for non-premium users ────────────────────────────────────
const LockedOverlay = () => (
    <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto text-center space-y-6 py-12"
    >
        <motion.div variants={item} className="glass-panel p-10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center shadow-xl">
                <Lock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">
                Feature Locked
            </h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                <strong className="text-primary">AI Mood Detection</strong> is a premium feature.
                Complete a <strong>1-day daily check-in streak</strong> to unlock it permanently — no subscription required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-gradient px-8 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Start Check-in
                    </motion.button>
                </Link>
                <Link to="/premium">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-8 py-2.5 rounded-2xl border-2 border-primary/30 text-primary font-bold hover:bg-primary/5 transition-all flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> View Premium
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MoodDetect = () => {
    const { user } = useAuth();
    const webcamRef = useRef(null);

    const [phase, setPhase]           = useState('idle');    // idle | scanning | result | error
    const [capturedImg, setCapturedImg] = useState(null);
    const [result, setResult]          = useState(null);
    const [errorMsg, setErrorMsg]      = useState('');
    const [camError, setCamError]      = useState(false);

    const isPremium = user?.isPremium || false;

    // ── Capture + send ────────────────────────────────────────────────────
    const handleCapture = useCallback(async () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            setErrorMsg('Could not capture image. Please check your camera.');
            setPhase('error');
            return;
        }

        setCapturedImg(imageSrc);
        setPhase('scanning');
        setErrorMsg('');

        try {
            const { data } = await axios.post(
                'http://localhost:5000/api/mood/detect-face',
                { image: imageSrc },
                { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' } }
            );
            setResult(data);
            setPhase('result');
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setErrorMsg(msg);
            setPhase('error');
        }
    }, [user]);

    const handleRetry = () => {
        setCapturedImg(null);
        setResult(null);
        setErrorMsg('');
        setPhase('idle');
    };

    // ── Non-premium gate ─────────────────────────────────────────────────
    if (!isPremium) return (
        <div className="pb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-medium mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <LockedOverlay />
        </div>
    );

    // ── Emotion config lookup ────────────────────────────────────────────
    const emo = result ? (EMOTION_CONFIG[result.emotion] || EMOTION_CONFIG.neutral) : null;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8 pb-12">

            {/* Back link */}
            <motion.div variants={item}>
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </motion.div>

            {/* Hero header */}
            <motion.div variants={item} className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    <span className="gradient-text">Mood Detection</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Let us read your face and generate personalized wellness suggestions just for you. 🧠✨
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Premium Feature Unlocked</span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── Left: Camera panel ──────────────────────────────── */}
                <motion.div variants={item} className="glass-panel p-6 flex flex-col items-center gap-5">
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 self-start">
                        Camera Feed
                    </h2>

                    {/* Webcam / captured frame */}
                    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] flex items-center justify-center">

                        {camError ? (
                            <div className="flex flex-col items-center gap-3 text-slate-400 p-8">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                                <p className="text-sm text-center">Camera access denied or unavailable.<br />Please allow camera permissions and reload.</p>
                            </div>
                        ) : phase === 'scanning' && capturedImg ? (
                            <>
                                <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/10">
                                    <ScanLine />
                                    <CornerBrackets color="border-primary" />
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full">
                                    <span className="text-xs font-bold text-primary animate-pulse">Analyzing your expression…</span>
                                </div>
                            </>
                        ) : phase === 'result' && capturedImg ? (
                            <>
                                <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
                                
                                {/* Face Bounding Box Overlay */}
                                {result?.face_rect && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute border-2 border-emerald-400 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.5)] z-20"
                                        style={{
                                            left:   `${(result.face_rect.x / (result.img_dims?.w || 640)) * 100}%`,
                                            top:    `${(result.face_rect.y / (result.img_dims?.h || 480)) * 100}%`,
                                            width:  `${(result.face_rect.w / (result.img_dims?.w || 640)) * 100}%`,
                                            height: `${(result.face_rect.h / (result.img_dims?.h || 480)) * 100}%`,
                                        }}
                                    >
                                        <div className="absolute -top-6 left-0 bg-emerald-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-t-md uppercase tracking-tighter">
                                            Face Detected
                                        </div>
                                    </motion.div>
                                )}

                                <CornerBrackets color="border-emerald-400" />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-400">Analysis Complete</span>
                                </div>
                            </>
                        ) : (phase === 'error' || phase === 'idle') ? (
                            <>
                                <Webcam
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    screenshotQuality={0.92}
                                    className="w-full h-full object-cover"
                                    onUserMediaError={() => setCamError(true)}
                                    mirrored
                                    videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                                />
                                {phase === 'error' && capturedImg && (
                                    <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[2px] pointer-events-none" />
                                )}
                                <CornerBrackets color={phase === 'error' ? "border-red-400" : "border-slate-500/60"} />
                            </>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-slate-800">
                                <p className="text-slate-400 text-sm font-medium">Initializing Camera...</p>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    {phase === 'idle' && (
                        <ul className="self-start space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                            {[
                                'Position your face in the frame',
                                'Ensure good lighting — face a window if possible',
                                'Keep a neutral or natural expression',
                                'Click the button below when ready',
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Error message */}
                    <AnimatePresence>
                        {phase === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="w-full flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{errorMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CTA buttons */}
                    <div className="w-full flex flex-col sm:flex-row gap-3">
                        {(phase === 'idle' || phase === 'error') && !camError && (
                            <motion.button
                                id="capture-btn"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleCapture}
                                className="btn-gradient flex-1 flex items-center justify-center gap-2"
                            >
                                <Camera className="w-4 h-4" />
                                {phase === 'error' ? 'Try Again' : 'Scan My Mood'}
                            </motion.button>
                        )}
                        {phase === 'scanning' && (
                            <div className="flex-1 flex items-center justify-center gap-3 py-2.5 rounded-2xl bg-primary/10 text-primary font-bold text-sm">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                                >
                                    <Sparkles className="w-4 h-4" />
                                </motion.div>
                                AI is thinking…
                            </div>
                        )}
                        {phase === 'result' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleRetry}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-2xl border-2 border-primary/30 text-primary font-bold hover:bg-primary/5 transition-all text-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Scan Again
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* ── Right: Results panel ─────────────────────────────── */}
                <motion.div variants={item} className="flex flex-col gap-5">

                    <AnimatePresence mode="wait">
                        {/* ── Idle placeholder ── */}
                        {(phase === 'idle' || phase === 'scanning') && (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass-panel p-8 flex-1 flex flex-col items-center justify-center text-center gap-5 min-h-72"
                            >
                                {phase === 'idle' ? (
                                    <>
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                            <Smile className="w-10 h-10 text-primary/50" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Your results will appear here</p>
                                            <p className="text-sm text-slate-400">Click "Scan My Mood" to get started</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            animate={{ scale: [1, 1.15, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary"
                                        >
                                            <Brain className="w-10 h-10 text-white" />
                                        </motion.div>
                                        <div>
                                            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Analyzing your expression…</p>
                                            <p className="text-sm text-slate-400">DeepFace is at work 🧠</p>
                                        </div>
                                        {/* Animated dots */}
                                        <div className="flex gap-2">
                                            {[0, 0.2, 0.4].map((d, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2.5 h-2.5 rounded-full bg-primary"
                                                    animate={{ y: [0, -8, 0] }}
                                                    transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* ── Error placeholder ── */}
                        {phase === 'error' && (
                            <motion.div
                                key="error-result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass-panel p-8 flex-1 flex flex-col items-center justify-center text-center gap-4 min-h-72"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <Frown className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="font-bold text-slate-700 dark:text-slate-300">Could not detect mood</p>
                                <p className="text-sm text-slate-400 max-w-xs">Make sure your face is clearly visible and the room is well-lit, then try again.</p>
                            </motion.div>
                        )}

                        {/* ── Success result ── */}
                        {phase === 'result' && result && emo && (
                            <motion.div
                                key="result"
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="space-y-5"
                            >
                                {/* Emotion card */}
                                <motion.div
                                    variants={item}
                                    className="glass-panel p-6 relative overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${emo.color} opacity-5 pointer-events-none`} />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${emo.color} flex items-center justify-center shadow-lg text-5xl flex-shrink-0`}
                                        >
                                            {emo.emoji}
                                        </motion.div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Detected Emotion</p>
                                            <h2 className={`text-4xl font-extrabold ${emo.textColor}`}>
                                                {emo.label}
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">via DeepFace analysis</p>
                                        </div>
                                    </div>

                                    {/* Emotion score bars */}
                                    {result.scores && Object.keys(result.scores).length > 0 && (
                                        <div className="mt-5 space-y-2 relative z-10">
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Emotion Breakdown</p>
                                            {Object.entries(result.scores)
                                                .sort((a, b) => b[1] - a[1])
                                                .slice(0, 4)
                                                .map(([key, val]) => (
                                                    <div key={key} className="flex items-center gap-3">
                                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-20 capitalize">{key}</span>
                                                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(val, 100)}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                                                className={`h-full bg-gradient-to-r ${EMOTION_CONFIG[key]?.color || 'from-slate-400 to-slate-500'} rounded-full`}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-10 text-right">{val.toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Wellness suggestions */}
                                {result.suggestions && result.suggestions.length > 0 && (
                                    <motion.div variants={item} className="glass-panel p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
                                                <Sparkles className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Wellness Suggestions</p>
                                        </div>
                                        <div className="space-y-3">
                                            {result.suggestions.map((suggestion, i) => {
                                                const SIcon = SUGGESTION_ICONS[i] || Heart;
                                                return (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -12 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.15 + 0.3 }}
                                                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                                                    >
                                                        <div className={`flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${emo.color} flex items-center justify-center shadow-sm`}>
                                                            <SIcon className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{suggestion}</p>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default MoodDetect;
