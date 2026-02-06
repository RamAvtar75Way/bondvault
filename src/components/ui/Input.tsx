import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { ReactNode, useState } from 'react';
import { COLORS, RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: ReactNode;
    containerStyle?: ViewStyle;
}

export function Input({ label, error, icon, containerStyle, style, ...props }: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                error && styles.inputContainerError,
            ]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[styles.input, icon ? styles.inputWithIcon : undefined, style]}
                    placeholderTextColor={COLORS.mutedText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.input,
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: COLORS.inputBorder,
    },
    inputContainerFocused: {
        borderColor: COLORS.inputFocus,
        backgroundColor: COLORS.card,
    },
    inputContainerError: {
        borderColor: COLORS.destructive,
    },
    iconContainer: {
        paddingLeft: SPACING.md,
    },
    input: {
        flex: 1,
        padding: SPACING.md,
        fontSize: FONT_SIZE.base,
        color: COLORS.text,
        fontWeight: FONT_WEIGHT.medium,
    },
    inputWithIcon: {
        paddingLeft: SPACING.sm,
    },
    error: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.destructive,
        marginTop: SPACING.xs,
        marginLeft: SPACING.xs,
    },
});
