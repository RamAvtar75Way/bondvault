import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
    themeMode: ThemeMode;
    colorScheme: ColorScheme;
    colors: typeof LIGHT_COLORS;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme() || 'light';
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [isLoading, setIsLoading] = useState(true);

    // Determine active color scheme based on mode
    const colorScheme: ColorScheme =
        themeMode === 'system' ? systemColorScheme : themeMode;

    // Get colors based on active scheme
    const colors = colorScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
                    setThemeModeState(saved as ThemeMode);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTheme();
    }, []);

    // Save theme preference
    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    if (isLoading) {
        return null; // Or a loading screen
    }

    return (
        <ThemeContext.Provider value={{ themeMode, colorScheme, colors, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
