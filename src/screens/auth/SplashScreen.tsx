
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';
import { Lock } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

export default function SplashScreen() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkStatus = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            navigate('/onboarding');
        };
        checkStatus();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Lock size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>BONDVAULT</Text>
            <Text style={styles.subtitle}>Securing your connections</Text>
            <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Using the dark slate from original design directly or add to theme
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 96,
        height: 96,
        backgroundColor: COLORS.tealLight,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.3)',
    },
    title: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: COLORS.primaryForeground,
        letterSpacing: 2,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        color: COLORS.mutedText,
        fontSize: FONT_SIZE.sm,
        marginBottom: SPACING.xxl,
    },
});
