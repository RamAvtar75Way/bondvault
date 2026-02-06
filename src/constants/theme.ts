
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
    primary: '#0F766E', // Deep Teal
    primaryForeground: '#FFFFFF',

    secondary: '#F1F5F9', // Slate
    secondaryForeground: '#1E293B',

    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',

    background: '#F8FAF8', // Cream
    card: '#FFFFFF',
    text: '#1E293B',
    mutedText: '#64748B',  // Slate-500
    border: '#E2E8F0',     // Slate-200

    input: '#F1F5F9',
    ring: '#0F766E',

    // Accents
    accent: '#FB7185', // Soft Coral
    tealLight: 'rgba(15, 118, 110, 0.1)', // teal/10
    whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
    whiteAlpha20: 'rgba(255, 255, 255, 0.2)',

    // Gradients (Mocked as single colors if LinearGradient not used, or array)
    gradientDark: ['#0F172A', '#1E293B', '#334155'], // Vault background
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const FONT_SIZE = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
};

export const SCREEN = {
    width,
    height,
};
