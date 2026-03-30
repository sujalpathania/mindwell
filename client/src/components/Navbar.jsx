import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { logout, user } = useAuth();
    const { theme, updateThemeMode } = useTheme();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleTheme = () => {
        updateThemeMode(theme.mode === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            className="glass-panel mb-8 sticky top-4 z-50 mx-4"
        >
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    MindWell
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {['Dashboard', 'Journal', 'Analytics', 'Breathe'].map((item) => (
                        <Link
                            key={item}
                            to={item === 'Dashboard' ? '/' : `/${item.toLowerCase()}`}
                            className="relative text-sm font-medium text-slate-900 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </Link>
                    ))}

                    <div className="flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-slate-200"
                        >
                            {theme.mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="space-y-1.5">
                        <span className={`block w-6 h-0.5 bg-current transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-current transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-current transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </div>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden overflow-hidden border-t border-slate-200 dark:border-slate-700"
                    >
                        <div className="px-6 py-4 space-y-4 flex flex-col">
                            {['Dashboard', 'Journal', 'Analytics', 'Breathe'].map((item) => (
                                <Link
                                    key={item}
                                    to={item === 'Dashboard' ? '/' : `/${item.toLowerCase()}`}
                                    className="text-sm font-medium text-slate-900 dark:text-slate-200 hover:text-primary transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.name}</span>
                                <div className="flex space-x-4">
                                    <button onClick={toggleTheme} className="text-slate-900 dark:text-slate-200">
                                        {theme.mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                    </button>
                                    <button onClick={handleLogout} className="text-red-500">
                                        <LogOut className="w-5 h-5" />
                                    </button>
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
