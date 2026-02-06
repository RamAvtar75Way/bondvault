
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';
import { Shield, Users, Clock, Bell } from 'lucide-react-native';
import { useState } from 'react';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

const SLIDES = [
    {
        id: 1,
        title: 'Manage Relationships',
        desc: 'Keep track of your personal and professional network in one secure place.',
        icon: <Users size={64} color={COLORS.primary} />
    },
    {
        id: 2,
        title: 'Track Interactions',
        desc: 'Log calls, meetings, and notes to never forget a detail.',
        icon: <Clock size={64} color={COLORS.primary} />
    },
    {
        id: 3,
        title: 'Secure Vault',
        desc: 'Keep private contacts hidden behind biometric security.',
        icon: <Shield size={64} color={COLORS.primary} />
    },
    {
        id: 4,
        title: 'Smart Reminders',
        desc: 'Get notified for birthdays and follow-ups automatically.',
        icon: <Bell size={64} color={COLORS.primary} />
    }
];

export default function OnboardingScreen() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/app/contacts');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {SLIDES[currentSlide].icon}
                </View>
                <Text style={styles.title}>
                    {SLIDES[currentSlide].title}
                </Text>
                <Text style={styles.description}>
                    {SLIDES[currentSlide].desc}
                </Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentSlide ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>
                        {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => navigate('/app/contacts')}
                >
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    iconContainer: {
        width: 160,
        height: 160,
        backgroundColor: COLORS.tealLight,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    description: {
        color: COLORS.mutedText,
        textAlign: 'center',
        fontSize: FONT_SIZE.lg,
        lineHeight: 28,
    },
    footer: {
        padding: SPACING.xl,
        width: '100%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: COLORS.primary,
        width: 32,
    },
    inactiveDot: {
        backgroundColor: '#CBD5E1', // slate-300
        width: 8,
    },
    button: {
        backgroundColor: COLORS.primary,
        width: '100%',
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: COLORS.primaryForeground,
        fontWeight: 'bold',
        fontSize: FONT_SIZE.lg,
    },
    skipButton: {
        marginTop: SPACING.md,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
    },
    skipText: {
        color: COLORS.mutedText,
        fontWeight: 'medium',
    },
});
