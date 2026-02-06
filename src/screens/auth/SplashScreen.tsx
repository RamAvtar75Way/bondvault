
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';
import { Lock } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function SplashScreen() {
    const { colors } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const checkStatus = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            navigate('/onboarding');
        };
        checkStatus();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.tealLight, borderColor: colors.primary }]}>
                <Lock size={48} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>BONDVAULT</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>Securing your connections</Text>
            <ActivityIndicator size="small" color={colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 1,
    },
    title: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        marginBottom: SPACING.xxl,
    },
});
