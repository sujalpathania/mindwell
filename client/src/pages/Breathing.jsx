import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const Breathing = () => {
    const phases = [
        { text: 'Inhale', duration: 4, scale: 1.25, color: 'from-teal-400 to-primary' },
        { text: 'Hold', duration: 7, scale: 1.25, color: 'from-primary to-indigo-600' },
        { text: 'Exhale', duration: 8, scale: 1, color: 'from-indigo-600 to-teal-400' }
    ];

    const [isActive, setIsActive] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(phases[0].duration);

    const currentPhase = phases[phaseIndex];

    useEffect(() => {
        let timer;
        if (isActive) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        const nextIndex = (phaseIndex + 1) % phases.length;
                        setPhaseIndex(nextIndex);
                        return phases[nextIndex].duration;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [isActive, phaseIndex]);

    const handleStart = () => {
        setIsActive(true);
        setPhaseIndex(0);
        setTimeLeft(phases[0].duration);
    };

    const handleStop = () => {
        setIsActive(false);
        setPhaseIndex(0);
        setTimeLeft(phases[0].duration);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex flex-col items-center justify-center min-h-[75vh]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-12"
                >
                    <motion.h2
                        animate={{
                            textShadow: ["0 0 10px rgba(45, 212, 191, 0.2)", "0 0 30px rgba(45, 212, 191, 0.4)", "0 0 10px rgba(45, 212, 191, 0.2)"]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-primary"
                    >
                        Breathe & Relax
                    </motion.h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        {isActive ? 'Follow the rhythm to center your mind.' : 'Ready to start your session?'}
                    </p>
                </motion.div>

                <div className="relative flex items-center justify-center mb-16">
                    {/* Ripple Effects - Only active during Inhale/Exhale */}
                    <AnimatePresence>
                        {isActive && currentPhase.text !== 'Hold' && (
                            <motion.div
                                key="ripple-1"
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                                className="absolute w-56 h-56 rounded-full border border-teal-400/30"
                            />
                        )}
                    </AnimatePresence>

                    {/* Progress Ring */}
                    <div className="absolute w-64 h-64 rounded-full border-4 border-slate-200 dark:border-slate-800 opacity-20" />

                    {/* Breathing Circle */}
                    <motion.div
                        animate={{
                            scale: isActive ? currentPhase.scale : 1,
                            transition: {
                                duration: isActive ? currentPhase.duration : 0.5,
                                ease: "easeInOut"
                            }
                        }}
                        className={`w-44 h-44 bg-gradient-to-br ${isActive ? currentPhase.color : 'from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800'} rounded-full shadow-2xl flex flex-col items-center justify-center text-white z-10 transition-colors duration-500`}
                    >
                        {isActive ? (
                            <>
                                <motion.span
                                    key={currentPhase.text}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-3xl font-bold tracking-widest drop-shadow-lg"
                                >
                                    {currentPhase.text}
                                </motion.span>
                                <motion.span
                                    key={`time-${timeLeft}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                    className="text-5xl font-light mt-2 font-mono"
                                >
                                    {timeLeft}
                                </motion.span>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center opacity-80">
                                <span className="text-2xl font-medium tracking-wide">Ready</span>
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className="flex space-x-6 mb-8 justify-center items-center">
                    {!isActive ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStart}
                            className="bg-primary text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Start Exercise
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStop}
                            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Stop Exercise
                        </motion.button>
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel px-10 py-6 flex space-x-12 text-center"
                >
                    <motion.div
                        animate={{ opacity: isActive && currentPhase.text === 'Inhale' ? 1 : 0.4, scale: isActive && currentPhase.text === 'Inhale' ? 1.1 : 1 }}
                    >
                        <span className="block text-2xl font-bold text-primary">4s</span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400">Inhale</span>
                    </motion.div>
                    <div className="w-px bg-slate-200 dark:bg-slate-700" />
                    <motion.div
                        animate={{ opacity: isActive && currentPhase.text === 'Hold' ? 1 : 0.4, scale: isActive && currentPhase.text === 'Hold' ? 1.1 : 1 }}
                    >
                        <span className="block text-2xl font-bold text-secondary">7s</span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400">Hold</span>
                    </motion.div>
                    <div className="w-px bg-slate-200 dark:bg-slate-700" />
                    <motion.div
                        animate={{ opacity: isActive && currentPhase.text === 'Exhale' ? 1 : 0.4, scale: isActive && currentPhase.text === 'Exhale' ? 1.1 : 1 }}
                    >
                        <span className="block text-2xl font-bold text-teal-500">8s</span>
                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400">Exhale</span>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Breathing;
