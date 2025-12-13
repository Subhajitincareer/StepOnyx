import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    colors: typeof Colors.light;
}

// Minimalist Color Palettes
export const Colors = {
    light: {
        background: '#ffffff',
        text: '#111827',
        textSub: '#6b7280',
        card: '#f9fafb',
        accent: '#111827', // Black accent for light mode
        tint: '#f3f4f6',
        success: '#22c55e',
        danger: '#ef4444',
    },
    dark: {
        background: '#000000',
        text: '#ffffff',
        textSub: '#9ca3af',
        card: '#111111', // Very dark gray for cards
        accent: '#ffffff', // White accent for dark mode
        tint: '#1f2937',
        success: '#4ade80',
        danger: '#f87171',
    },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('stepmaster_theme');
                if (savedTheme) {
                    setTheme(savedTheme as Theme);
                } else if (systemScheme) {
                    setTheme(systemScheme);
                }
            } catch (e) {
                console.error('Failed to load theme', e);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('stepmaster_theme', newTheme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const value = {
        theme,
        toggleTheme,
        colors: Colors[theme],
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
