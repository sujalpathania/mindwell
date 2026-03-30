import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Palette, Sun, Moon, RotateCcw, Check } from 'lucide-react';

const Settings = () => {
    const { theme, updateThemeMode, updateLightColors, updateDarkColors, resetTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('light');

    const presetColors = {
        light: [
            { name: 'Default', bg: '#f8fafc', bgSecondary: '#ffffff' },
            { name: 'Warm', bg: '#fef3c7', bgSecondary: '#fffbeb' },
            { name: 'Cool', bg: '#dbeafe', bgSecondary: '#eff6ff' },
            { name: 'Nature', bg: '#d1fae5', bgSecondary: '#ecfdf5' },
            { name: 'Sunset', bg: '#fed7aa', bgSecondary: '#ffedd5' },
        ],
        dark: [
            { name: 'Default', bg: '#0f172a', bgSecondary: '#1e293b' },
            { name: 'Deep Blue', bg: '#0c1e3d', bgSecondary: '#1a2f4f' },
            { name: 'Purple Night', bg: '#1e1b4b', bgSecondary: '#312e81' },
            { name: 'Forest', bg: '#14532d', bgSecondary: '#166534' },
            { name: 'Charcoal', bg: '#18181b', bgSecondary: '#27272a' },
        ]
    };

    const handlePresetClick = (preset) => {
        if (activeTab === 'light') {
            updateLightColors({
                background: preset.bg,
                backgroundSecondary: preset.bgSecondary
            });
        } else {
            updateDarkColors({
                background: preset.bg,
                backgroundSecondary: preset.bgSecondary
            });
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="max-w-4xl mx-auto"
        >
            <motion.header variants={item} className="mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-3">
                    <Palette className="w-10 h-10 text-primary" />
                    Theme Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Customize your MindWell experience</p>
            </motion.header>

            {/* Theme Mode Toggle */}
            <motion.div variants={item} className="glass-panel p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    {theme.mode === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    Theme Mode
                </h2>
                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        onClick={() => updateThemeMode('light')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme.mode === 'light'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                    >
                        <Sun className="w-6 h-6 mx-auto mb-2" />
                        <span className="font-medium">Light Mode</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        onClick={() => updateThemeMode('dark')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme.mode === 'dark'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                    >
                        <Moon className="w-6 h-6 mx-auto mb-2" />
                        <span className="font-medium">Dark Mode</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Color Customization */}
            <motion.div variants={item} className="glass-panel p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Background Colors</h2>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('light')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'light'
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <Sun className="w-4 h-4 inline mr-2" />
                        Light Theme
                    </button>
                    <button
                        onClick={() => setActiveTab('dark')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'dark'
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <Moon className="w-4 h-4 inline mr-2" />
                        Dark Theme
                    </button>
                </div>

                {/* Color Pickers */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Primary Background</label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="color"
                                value={activeTab === 'light' ? theme.light.background : theme.dark.background}
                                onChange={(e) => {
                                    if (activeTab === 'light') {
                                        updateLightColors({ background: e.target.value });
                                    } else {
                                        updateDarkColors({ background: e.target.value });
                                    }
                                }}
                                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={activeTab === 'light' ? theme.light.background : theme.dark.background}
                                    onChange={(e) => {
                                        if (activeTab === 'light') {
                                            updateLightColors({ background: e.target.value });
                                        } else {
                                            updateDarkColors({ background: e.target.value });
                                        }
                                    }}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Secondary Background</label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="color"
                                value={activeTab === 'light' ? theme.light.backgroundSecondary : theme.dark.backgroundSecondary}
                                onChange={(e) => {
                                    if (activeTab === 'light') {
                                        updateLightColors({ backgroundSecondary: e.target.value });
                                    } else {
                                        updateDarkColors({ backgroundSecondary: e.target.value });
                                    }
                                }}
                                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={activeTab === 'light' ? theme.light.backgroundSecondary : theme.dark.backgroundSecondary}
                                    onChange={(e) => {
                                        if (activeTab === 'light') {
                                            updateLightColors({ backgroundSecondary: e.target.value });
                                        } else {
                                            updateDarkColors({ backgroundSecondary: e.target.value });
                                        }
                                    }}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preset Colors */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Quick Presets</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {presetColors[activeTab].map((preset) => (
                            <motion.button
                                key={preset.name}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePresetClick(preset)}
                                className="relative p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-primary transition-all"
                            >
                                <div className="flex gap-1 mb-2">
                                    <div className="w-full h-8 rounded" style={{ backgroundColor: preset.bg }}></div>
                                    <div className="w-full h-8 rounded" style={{ backgroundColor: preset.bgSecondary }}></div>
                                </div>
                                <span className="text-xs font-medium">{preset.name}</span>
                                {(activeTab === 'light'
                                    ? theme.light.background === preset.bg
                                    : theme.dark.background === preset.bg) && (
                                        <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Preview */}
            <motion.div variants={item} className="glass-panel p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    <div
                        className="p-6 transition-colors"
                        style={{
                            backgroundColor: theme.mode === 'light' ? theme.light.background : theme.dark.background
                        }}
                    >
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor: theme.mode === 'light' ? theme.light.backgroundSecondary : theme.dark.backgroundSecondary
                            }}
                        >
                            <h3 className="font-semibold mb-2">Sample Card</h3>
                            <p className="text-sm opacity-70">This is how your theme will look across the app.</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Reset Button */}
            <motion.div variants={item} className="flex justify-end">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={resetTheme}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Default
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default Settings;
