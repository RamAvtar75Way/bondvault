
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { useNavigate } from 'react-router-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Lock, Delete, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStoredPin, setStoredPin, isBiometricEnabled, checkBiometricHardware } from '../../utils/security';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

export default function VaultAuthScreen() {
    const navigate = useNavigate();
    const [pin, setPin] = useState(['', '', '', '']);
    const [activeIndex, setActiveIndex] = useState(0);
    const [mode, setMode] = useState<'AUTH' | 'SETUP_CREATE' | 'SETUP_CONFIRM'>('AUTH');
    const [tempPin, setTempPin] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSecurityStatus();
    }, []);

    const checkSecurityStatus = async () => {
        const storedPin = await getStoredPin();
        if (!storedPin) {
            setMode('SETUP_CREATE');
            setLoading(false);
        } else {
            setMode('AUTH');
            setLoading(false);
            // Only prompt biometric if enabled and we have a PIN
            const bioEnabled = await isBiometricEnabled();
            if (bioEnabled) {
                authenticateBiometric();
            }
        }
    };

    useEffect(() => {
        if (activeIndex === 4) {
            handlePinComplete();
        }
    }, [activeIndex, pin]);

    const handlePinComplete = async () => {
        const enteredPin = pin.join('');

        if (mode === 'AUTH') {
            const storedPin = await getStoredPin();
            if (enteredPin === storedPin) {
                navigate('/app/vault');
            } else {
                Alert.alert('Incorrect PIN', 'Please try again.', [{ text: 'OK', onPress: clearPin }]);
            }
        } else if (mode === 'SETUP_CREATE') {
            setTempPin(enteredPin);
            setMode('SETUP_CONFIRM');
            clearPin();
        } else if (mode === 'SETUP_CONFIRM') {
            if (enteredPin === tempPin) {
                const success = await setStoredPin(enteredPin);
                if (success) {
                    Alert.alert('Success', 'Vault secured successfully!', [
                        { text: 'Enter Vault', onPress: () => navigate('/app/vault') }
                    ]);
                } else {
                    Alert.alert('Error', 'Failed to save PIN.');
                    clearPin();
                    setMode('SETUP_CREATE');
                }
            } else {
                Alert.alert('Mismatch', 'PINs did not match. Try again.', [
                    {
                        text: 'OK', onPress: () => {
                            clearPin();
                            setMode('SETUP_CREATE');
                        }
                    }
                ]);
            }
        }
    };

    const authenticateBiometric = async () => {
        const hasHardware = await checkBiometricHardware();
        if (hasHardware) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Secure Vault',
                fallbackLabel: 'Use Passcode',
            });
            if (result.success) {
                navigate('/app/vault');
            }
        }
    };

    const handlePress = (num: string) => {
        if (activeIndex < 4) {
            const newPin = [...pin];
            newPin[activeIndex] = num;
            setPin(newPin);
            setActiveIndex(activeIndex + 1);
        }
    };

    const handleDelete = () => {
        if (activeIndex > 0) {
            const newPin = [...pin];
            newPin[activeIndex - 1] = '';
            setPin(newPin);
            setActiveIndex(activeIndex - 1);
        }
    };

    const clearPin = () => {
        setPin(['', '', '', '']);
        setActiveIndex(0);
    };

    if (loading) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={COLORS.gradientDark as [string, string, ...string[]]}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.content}>
                {/* Header Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigate(-1)}
                >
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>

                {/* Logo Area */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Lock size={48} color="#FFF" />
                    </View>
                    <Text style={styles.title}>BOND VAULT</Text>
                    <Text style={styles.subtitle}>
                        {mode === 'AUTH' && 'Enter your secured passcode'}
                        {mode === 'SETUP_CREATE' && 'Create a new passcode'}
                        {mode === 'SETUP_CONFIRM' && 'Confirm your passcode'}
                    </Text>
                </View>

                {/* PIN Dots */}
                <View style={styles.pinContainer}>
                    {[0, 1, 2, 3].map((index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index < activeIndex ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    ))}
                </View>

                {/* Numpad */}
                <View style={styles.numpad}>
                    <View style={styles.row}>
                        {[1, 2, 3].map(num => <NumButton key={num} num={num.toString()} onPress={handlePress} />)}
                    </View>
                    <View style={styles.row}>
                        {[4, 5, 6].map(num => <NumButton key={num} num={num.toString()} onPress={handlePress} />)}
                    </View>
                    <View style={styles.row}>
                        {[7, 8, 9].map(num => <NumButton key={num} num={num.toString()} onPress={handlePress} />)}
                    </View>
                    <View style={[styles.row, { alignItems: 'center' }]}>
                        {mode === 'AUTH' ? (
                            <TouchableOpacity onPress={authenticateBiometric} style={styles.actionButton}>
                                <Text style={styles.actionText}>Face ID</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.actionButton} />
                        )}
                        <NumButton num="0" onPress={handlePress} />
                        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                            <Delete size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {mode === 'AUTH' && (
                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={styles.forgotText}>Forgot Passcode?</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const NumButton = ({ num, onPress }: { num: string, onPress: (n: string) => void }) => (
    <TouchableOpacity
        onPress={() => onPress(num)}
        style={styles.numButton}
    >
        <Text style={styles.numText}>{num}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        width: 96,
        height: 96,
        backgroundColor: COLORS.whiteAlpha10,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.whiteAlpha20,
    },
    title: {
        color: '#FFF',
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    subtitle: {
        color: '#94A3B8', // slate-400
        fontSize: FONT_SIZE.sm,
        marginTop: SPACING.xs,
    },
    pinContainer: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 48,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    inactiveDot: {
        backgroundColor: 'transparent',
    },
    numpad: {
        width: '100%',
        maxWidth: 320,
        gap: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
    },
    numButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: COLORS.whiteAlpha10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    numText: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: '300',
    },
    actionButton: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        color: COLORS.primary,
        fontWeight: '500',
        fontSize: FONT_SIZE.xs,
        textAlign: 'center',
    },
    forgotButton: {
        marginTop: 32,
    },
    forgotText: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.sm,
    },
});
