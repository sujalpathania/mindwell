import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Sparkles, LayoutDashboard, BookOpen, BarChart2, Calendar, Wind, Flame, Trophy } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { label: 'Dashboard', path: '/',            icon: LayoutDashboard },
    { label: 'Journal',   path: '/journal',     icon: BookOpen },
    { label: 'Calendar',  path: '/calendar',    icon: Calendar },
    { label: 'Analytics', path: '/analytics',   icon: BarChart2 },
    { label: 'Breathe',   path: '/breathe',     icon: Wind },
    { label: 'Premium',   path: '/premium',     icon: Trophy },
];

const Navbar = () => {
    const { logout, user } = useAuth();
    const { theme, updateThemeMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleTheme = () => {
        updateThemeMode(theme.mode === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 20 }}
            className="glass-panel mb-8 sticky top-4 z-50 mx-4"
        >
            <div className="container mx-auto px-5 py-3.5 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-primary group-hover:shadow-glow-secondary transition-all duration-300">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-extrabold gradient-text tracking-tight">MindWell</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ label, path, icon: Icon }) => (
                        <Link
                            key={label}
                            to={path}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                isActive(path)
                                    ? 'nav-link-active'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Right controls */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Theme toggle */}
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/10 text-slate-600 dark:text-slate-300 hover:text-primary transition-all"
                    >
                        <AnimatePresence mode="wait">
                            {theme.mode === 'dark' ? (
                                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                    <Sun className="w-4 h-4" />
                                </motion.div>
                            ) : (
                                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                    <Moon className="w-4 h-4" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Streak pill */}
                    {(user?.streak > 0) && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 shadow-sm"
                        >
                            <Flame className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-bold text-white">{user.streak}d</span>
                        </motion.div>
                    )}

                    {/* Premium badge */}
                    {user?.isPremium && (
                        <Link to="/premium">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm"
                            >
                                <Trophy className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs font-bold text-white">Premium</span>
                            </motion.div>
                        </Link>
                    )}

                    {/* Avatar + name */}
                    <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-700">
                        <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-float">
                            {initials}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
                        <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={handleLogout}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Mobile hamburger */}
                <motion.button
                    className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    whileTap={{ scale: 0.9 }}
                >
                    <div className="space-y-1.5">
                        <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-x-0' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </div>
                </motion.button>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="md:hidden overflow-hidden border-t border-slate-100 dark:border-slate-800"
                    >
                        <div className="px-5 py-4 space-y-1">
                            {navLinks.map(({ label, path, icon: Icon }) => (
                                <Link
                                    key={label}
                                    to={path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        isActive(path)
                                            ? 'nav-link-active'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}
                            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                                            {initials}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {theme.mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        </button>
                                        <button onClick={handleLogout} className="p-2 rounded-xl text-red-500 bg-red-50 dark:bg-red-900/20">
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {/* Mobile streak + premium */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {(user?.streak > 0) && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-pink-500">
                                            <Flame className="w-3.5 h-3.5 text-white" />
                                            <span className="text-xs font-bold text-white">{user.streak} day streak</span>
                                        </div>
                                    )}
                                    {user?.isPremium && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500">
                                            <Trophy className="w-3.5 h-3.5 text-white" />
                                            <span className="text-xs font-bold text-white">✨ Premium</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
