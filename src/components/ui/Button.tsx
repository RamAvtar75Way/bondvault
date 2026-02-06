import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
    children: ReactNode;
    onPress?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: ReactNode;
}

export function Button({
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
}: ButtonProps) {
    const { colors } = useTheme();

    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: colors.primary,
                };
            case 'secondary':
                return {
                    backgroundColor: colors.secondary,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: colors.border,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                };
            case 'destructive':
                return {
                    backgroundColor: colors.destructive,
                };
        }
    };

    const getTextVariantStyles = (): TextStyle => {
        switch (variant) {
            case 'primary':
                return { color: colors.primaryForeground };
            case 'secondary':
                return { color: colors.secondaryForeground };
            case 'outline':
            case 'ghost':
                return { color: colors.primary };
            case 'destructive':
                return { color: colors.destructiveForeground };
        }
    };

    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'sm':
                return { paddingVertical: 8, paddingHorizontal: 12 };
            case 'md':
                return { paddingVertical: 12, paddingHorizontal: 16 };
            case 'lg':
                return { paddingVertical: 16, paddingHorizontal: 24 };
        }
    };

    const getTextSizeStyles = (): TextStyle => {
        switch (size) {
            case 'sm':
                return { fontSize: FONT_SIZE.sm };
            case 'md':
                return { fontSize: FONT_SIZE.base };
            case 'lg':
                return { fontSize: FONT_SIZE.lg };
        }
    };

    const buttonStyles: ViewStyle[] = [
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        ...(fullWidth ? [styles.fullWidth] : []),
        ...(disabled ? [{ opacity: 0.5 }] : []),
    ];

    const textStyles: TextStyle[] = [
        styles.text,
        getTextVariantStyles(),
        getTextSizeStyles(),
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextVariantStyles().color} />
            ) : (
                <>
                    {icon}
                    <Text style={textStyles}>{children}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.md,
        gap: SPACING.sm,
    },
    fullWidth: {
        width: '100%',
    },
    text: {
        fontWeight: FONT_WEIGHT.semibold,
        textAlign: 'center',
    },
});
