import { TextStyle } from 'react-native';

const palette = {
  // Slate
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  
  // Accents
  blue500: '#3B82F6',
  sky400: '#38BDF8',
  red500: '#EF4444',
  red400: '#F87171',
  emerald500: '#10B981',
  emerald400: '#34D399',
  amber500: '#F59E0B',
  amber400: '#FBBF24',
  
  white: '#FFFFFF',
  black: '#000000',
};

export const lightColors = {
    primary: palette.slate900,
    primaryHover: palette.slate700,
    primaryPressed: palette.slate800,
    
    background: palette.slate50,
    surface: palette.white,
    inputBackground: palette.white,
    
    textPrimary: palette.slate900,
    textSecondary: palette.slate500,
    textTertiary: palette.slate400,
    
    border: palette.slate200,
    
    error: palette.red500,
    success: palette.emerald500,
    warning: palette.amber500,
    info: palette.blue500,
};

export const darkColors = {
    primary: palette.sky400, // Pop color for dark mode
    primaryHover: '#7DD3FC',
    primaryPressed: '#0284C7',
    
    background: palette.slate900,
    surface: palette.slate800,
    inputBackground: palette.slate700,
    
    textPrimary: palette.slate50,
    textSecondary: palette.slate300,
    textTertiary: palette.slate400,
    
    border: palette.slate700,
    
    error: palette.red400,
    success: palette.emerald400,
    warning: palette.amber400,
    info: palette.blue500, // Keep blue
};

export const commonTheme = {
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    header: {
      fontFamily: 'Inter_700Bold',
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: -0.5,
    } as TextStyle,
    subheader: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: -0.25,
    } as TextStyle,
    body: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
    } as TextStyle,
    caption: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      lineHeight: 16,
    } as TextStyle,
    button: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 15,
      lineHeight: 20,
    } as TextStyle
  },
  shadows: {
    low: {
      shadowColor: palette.slate500,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: palette.slate500,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    high: {
      shadowColor: palette.slate900,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10,
    },
  },
  borderRadius: {
    s: 6,
    m: 12,
    l: 16,
    xl: 24,
    round: 999,
  },
};

// Default export for backward compatibility if needed, but preferably use hooks
export const theme = {
    ...commonTheme,
    colors: lightColors,
};

export type Theme = typeof theme;
