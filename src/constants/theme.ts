
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Light Theme Colors
export const LIGHT_COLORS = {
    primary: '#0F766E',
    primaryForeground: '#FFFFFF',
    primaryLight: '#14B8A6',
    primaryDark: '#0D5F58',

    secondary: '#F1F5F9',
    secondaryForeground: '#1E293B',

    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',

    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    mutedText: '#64748B',
    border: '#E2E8F0',

    input: '#F1F5F9',
    inputBorder: '#CBD5E1',
    inputFocus: '#0F766E',
    ring: '#0F766E',

    accent: '#FB7185',
    accentLight: '#FECDD3',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',

    tealLight: 'rgba(15, 118, 110, 0.1)',
    tealMedium: 'rgba(15, 118, 110, 0.2)',
    whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
    whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
    blackAlpha5: 'rgba(0, 0, 0, 0.05)',
    blackAlpha10: 'rgba(0, 0, 0, 0.1)',

    gradientDark: ['#0F172A', '#1E293B', '#334155'],
    gradientPrimary: ['#0F766E', '#14B8A6'],
    gradientCard: ['#FFFFFF', '#F8FAFC'],
};

// Dark Theme Colors
export const DARK_COLORS = {
    primary: '#14B8A6',
    primaryForeground: '#FFFFFF',
    primaryLight: '#2DD4BF',
    primaryDark: '#0F766E',

    secondary: '#1E293B',
    secondaryForeground: '#F1F5F9',

    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',

    background: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    mutedText: '#94A3B8',
    border: '#334155',

    input: '#1E293B',
    inputBorder: '#475569',
    inputFocus: '#14B8A6',
    ring: '#14B8A6',

    accent: '#FB7185',
    accentLight: '#FDA4AF',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',

    tealLight: 'rgba(20, 184, 166, 0.15)',
    tealMedium: 'rgba(20, 184, 166, 0.25)',
    whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
    whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
    blackAlpha5: 'rgba(0, 0, 0, 0.2)',
    blackAlpha10: 'rgba(0, 0, 0, 0.3)',

    gradientDark: ['#0F172A', '#1E293B', '#334155'],
    gradientPrimary: ['#0F766E', '#14B8A6'],
    gradientCard: ['#1E293B', '#334155'],
};

// Default to light colors (will be overridden by theme context)
export const COLORS = LIGHT_COLORS;

export const SHADOWS = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
};

export const ANIMATIONS = {
    fast: 150,
    normal: 250,
    slow: 350,

    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',

    spring: {
        damping: 15,
        stiffness: 150,
    },
    springBouncy: {
        damping: 10,
        stiffness: 100,
    },
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
    xxl: 32,
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
    huge: 36,
};

export const FONT_WEIGHT = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export const SCREEN = {
    width,
    height,
};

// Helper to get card styles with current colors
export const getCardStyles = (colors: typeof LIGHT_COLORS) => ({
    default: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.md,
    },
    elevated: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.lg,
    },
    flat: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
});

// Default card styles
export const CARD_STYLES = getCardStyles(LIGHT_COLORS);
