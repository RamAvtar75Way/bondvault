import { View, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'flat';
    style?: ViewStyle;
}

export function Card({ children, variant = 'default', style }: CardProps) {
    const { colors } = useTheme();

    const getVariantStyles = (): ViewStyle => {
        const baseStyle = {
            backgroundColor: colors.card,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
        };

        switch (variant) {
            case 'default':
                return { ...baseStyle, ...SHADOWS.md };
            case 'elevated':
                return { ...baseStyle, padding: SPACING.lg, ...SHADOWS.lg };
            case 'flat':
                return {
                    ...baseStyle,
                    borderWidth: 1,
                    borderColor: colors.border,
                };
        }
    };

    return <View style={[getVariantStyles(), style]}>{children}</View>;
}
