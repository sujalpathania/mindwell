import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

const defaultTheme = {
    mode: 'light',
    light: {
        background: '#f8fafc',
        backgroundSecondary: '#ffffff',
        primary: '#6366f1',
        secondary: '#ec4899'
    },
    dark: {
        background: '#0f172a',
        backgroundSecondary: '#1e293b',
        primary: '#818cf8',
        secondary: '#f472b6'
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('mindwell-theme');
        return saved ? JSON.parse(saved) : defaultTheme;
    });

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;
        const colors = theme.mode === 'dark' ? theme.dark : theme.light;

        // Set CSS variables
        root.style.setProperty('--bg-primary', colors.background);
        root.style.setProperty('--bg-secondary', colors.backgroundSecondary);
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);

        // Toggle dark class
        if (theme.mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save to localStorage
        localStorage.setItem('mindwell-theme', JSON.stringify(theme));
        localStorage.setItem('theme', theme.mode);
    }, [theme]);

    const updateThemeMode = (mode) => {
        setTheme(prev => ({ ...prev, mode }));
    };

    const updateLightColors = (colors) => {
        setTheme(prev => ({
            ...prev,
            light: { ...prev.light, ...colors }
        }));
    };

    const updateDarkColors = (colors) => {
        setTheme(prev => ({
            ...prev,
            dark: { ...prev.dark, ...colors }
        }));
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
    };

    const value = {
        theme,
        updateThemeMode,
        updateLightColors,
        updateDarkColors,
        resetTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
