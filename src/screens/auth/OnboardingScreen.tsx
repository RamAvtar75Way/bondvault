
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';
import { Shield, Users, Clock, Bell } from 'lucide-react-native';
import { useState } from 'react';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function OnboardingScreen() {
    const { colors } = useTheme();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const SLIDES = [
        {
            id: 1,
            title: 'Manage Relationships',
            desc: 'Keep track of your personal and professional network in one secure place.',
            icon: <Users size={64} color={colors.primary} />
        },
        {
            id: 2,
            title: 'Track Interactions',
            desc: 'Log calls, meetings, and notes to never forget a detail.',
            icon: <Clock size={64} color={colors.primary} />
        },
        {
            id: 3,
            title: 'Secure Vault',
            desc: 'Keep private contacts hidden behind biometric security.',
            icon: <Shield size={64} color={colors.primary} />
        },
        {
            id: 4,
            title: 'Smart Reminders',
            desc: 'Get notified for birthdays and follow-ups automatically.',
            icon: <Bell size={64} color={colors.primary} />
        }
    ];

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/app/contacts');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.tealLight }]}>
                    {SLIDES[currentSlide].icon}
                </View>
                <Text style={[styles.title, { color: colors.text }]}>{SLIDES[currentSlide].title}</Text>
                <Text style={[styles.desc, { color: colors.mutedText }]}>{SLIDES[currentSlide].desc}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.dots}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { backgroundColor: i === currentSlide ? colors.primary : colors.border }
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                    onPress={handleNext}
                >
                    <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                        {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>

                {currentSlide < SLIDES.length - 1 && (
                    <TouchableOpacity onPress={() => navigate('/app/contacts')}>
                        <Text style={[styles.skipText, { color: colors.mutedText }]}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 128,
        height: 128,
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    desc: {
        fontSize: FONT_SIZE.base,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 48,
        alignItems: 'center',
    },
    dots: {
        flexDirection: 'row',
        marginBottom: 32,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    buttonText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    skipText: {
        marginTop: 16,
        fontSize: FONT_SIZE.sm,
    },
});
