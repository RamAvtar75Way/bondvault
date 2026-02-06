
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, Share, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Layout } from '../../components/ui/Layout';
import { useNavigate } from 'react-router-native';
import { ArrowLeft, Bell, Calendar, Lock, Cloud, ChevronRight, Upload, Phone, RefreshCw, Sun, Moon, Smartphone } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { db } from '../../db/client';
import { contacts, interactions, reminders } from '../../db/schema';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { setBiometricEnabled as saveBiometricPref, isBiometricEnabled, resetStoredPin, getStoredPin } from '../../utils/security';
import { useTheme } from '../../contexts/ThemeContext';
import {
    isAutoSyncEnabled,
    setAutoSyncEnabled,
    requestCallLogPermission,
    syncCallLogs,
    getLastSyncTimestamp
} from '../../services/callLogService';

export default function SettingsScreen() {
    const navigate = useNavigate();
    const { themeMode, setThemeMode, colors } = useTheme();
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const [calendarSync, setCalendarSync] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [callLogSync, setCallLogSync] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string>('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const bioEnabled = await isBiometricEnabled();
        setBiometricEnabled(bioEnabled);

        if (Platform.OS === 'android') {
            const callSyncEnabled = await isAutoSyncEnabled();
            setCallLogSync(callSyncEnabled);

            const timestamp = await getLastSyncTimestamp();
            if (timestamp) {
                setLastSync(new Date(timestamp).toLocaleString());
            }
        }
    };

    const handleBiometricToggle = async (value: boolean) => {
        setBiometricEnabled(value);
        await saveBiometricPref(value);
    };

    const handleChangePasscode = async () => {
        const currentPin = await getStoredPin();

        if (!currentPin) {
            // No PIN set yet, allow direct setup
            await resetStoredPin();
            navigate('/vault-auth');
            return;
        }

        // Prompt for current passcode
        Alert.prompt(
            'Verify Current Passcode',
            'Enter your current passcode to continue',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Verify',
                    onPress: async (enteredPin?: string) => {
                        if (enteredPin === currentPin) {
                            // Current PIN is correct, allow reset
                            Alert.alert(
                                'Change Passcode',
                                'You will now set a new passcode.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Continue',
                                        onPress: async () => {
                                            await resetStoredPin();
                                            navigate('/vault-auth');
                                        }
                                    }
                                ]
                            );
                        } else {
                            Alert.alert('Error', 'Incorrect passcode. Please try again.');
                        }
                    }
                }
            ],
            'secure-text'
        );
    };

    const handleBackup = async () => {
        try {
            const allContacts = await db.select().from(contacts);
            const allInteractions = await db.select().from(interactions);
            const allReminders = await db.select().from(reminders);

            const backupData = {
                contacts: allContacts,
                interactions: allInteractions,
                reminders: allReminders,
                timestamp: new Date().toISOString()
            };

            const fileUri = FileSystem.documentDirectory + 'bondvault_backup.json';
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData));

            await Sharing.shareAsync(fileUri);
        } catch (e) {
            Alert.alert('Error', 'Backup failed');
            console.error(e);
        }
    };

    // Create dynamic styles based on theme
    const dynamicStyles = StyleSheet.create({
        layout: {
            backgroundColor: colors.background,
        },
        header: {
            backgroundColor: colors.card,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        title: {
            fontSize: FONT_SIZE.xxl,
            fontWeight: '700',
            color: colors.text,
        },
        scrollView: {
            flex: 1,
        },
        sectionTitle: {
            fontSize: FONT_SIZE.sm,
            fontWeight: '600',
            color: colors.mutedText,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginTop: 24,
            marginBottom: 8,
            paddingHorizontal: 16,
        },
        sectionContainer: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
        },
        settingsItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            backgroundColor: colors.card,
        },
        itemLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconContainer: {
            width: 32,
            height: 32,
            borderRadius: RADIUS.md,
            backgroundColor: colors.tealLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        itemLabel: {
            color: colors.text,
            fontWeight: '500',
            fontSize: FONT_SIZE.base,
        },
        backupButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            backgroundColor: colors.card,
        },
        backupContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        backupTitle: {
            color: colors.text,
            fontWeight: '500',
            fontSize: FONT_SIZE.base,
        },
        backupSubtitle: {
            color: colors.mutedText,
            fontSize: FONT_SIZE.xs,
        },
        versionContainer: {
            alignItems: 'center',
            marginTop: 16,
        },
        versionText: {
            color: colors.mutedText,
            fontSize: FONT_SIZE.sm,
        },
        syncButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            backgroundColor: colors.card,
        },
        syncContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        syncTitle: {
            color: colors.text,
            fontWeight: '500',
            fontSize: FONT_SIZE.base,
        },
        syncSubtitle: {
            color: colors.mutedText,
            fontSize: FONT_SIZE.xs,
            marginTop: 2,
        },
        themeSelector: {
            flexDirection: 'row',
            gap: 12,
            padding: 16,
        },
        themeOption: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: RADIUS.md,
            backgroundColor: colors.input,
            borderWidth: 2,
            borderColor: 'transparent',
            gap: 8,
        },
        themeOptionActive: {
            backgroundColor: colors.tealLight,
            borderColor: colors.primary,
        },
        themeOptionText: {
            fontSize: FONT_SIZE.sm,
            fontWeight: '500',
            color: colors.mutedText,
        },
        themeOptionTextActive: {
            color: colors.primary,
            fontWeight: '600',
        },
    });

    return (
        <Layout style={dynamicStyles.layout}>
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.title}>Settings</Text>
            </View>

            <ScrollView style={dynamicStyles.scrollView}>

                {/* Security Section */}
                <Text style={dynamicStyles.sectionTitle}>Security</Text>
                <View style={dynamicStyles.sectionContainer}>
                    <SettingsItem
                        icon={<Lock size={20} color={colors.primary} />}
                        label="Biometric & Vault"
                        value={biometricEnabled}
                        onValueChange={handleBiometricToggle}
                        isToggle
                        borderBottom
                        colors={colors}
                    />
                    <TouchableOpacity
                        style={dynamicStyles.settingsItem}
                        onPress={handleChangePasscode}
                    >
                        <View style={dynamicStyles.itemLeft}>
                            <View style={dynamicStyles.iconContainer}>
                                <Lock size={20} color={colors.primary} />
                            </View>
                            <Text style={dynamicStyles.itemLabel}>Change Passcode</Text>
                        </View>
                        <ChevronRight size={20} color={colors.mutedText} />
                    </TouchableOpacity>
                </View>

                {/* Appearance Section */}
                <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
                <View style={dynamicStyles.sectionContainer}>
                    <View style={dynamicStyles.themeSelector}>
                        <TouchableOpacity
                            style={[dynamicStyles.themeOption, themeMode === 'light' && dynamicStyles.themeOptionActive]}
                            onPress={() => setThemeMode('light')}
                        >
                            <Sun size={24} color={themeMode === 'light' ? colors.primary : colors.mutedText} />
                            <Text style={[dynamicStyles.themeOptionText, themeMode === 'light' && dynamicStyles.themeOptionTextActive]}>
                                Light
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[dynamicStyles.themeOption, themeMode === 'dark' && dynamicStyles.themeOptionActive]}
                            onPress={() => setThemeMode('dark')}
                        >
                            <Moon size={24} color={themeMode === 'dark' ? colors.primary : colors.mutedText} />
                            <Text style={[dynamicStyles.themeOptionText, themeMode === 'dark' && dynamicStyles.themeOptionTextActive]}>
                                Dark
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[dynamicStyles.themeOption, themeMode === 'system' && dynamicStyles.themeOptionActive]}
                            onPress={() => setThemeMode('system')}
                        >
                            <Smartphone size={24} color={themeMode === 'system' ? colors.primary : colors.mutedText} />
                            <Text style={[dynamicStyles.themeOptionText, themeMode === 'system' && dynamicStyles.themeOptionTextActive]}>
                                System
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Call Log Sync Section (Disabled - requires development build) */}
                {false && Platform.OS === 'android' && (
                    <>
                        <Text style={dynamicStyles.sectionTitle}>Call Log Sync</Text>
                        <View style={dynamicStyles.sectionContainer}>
                            <SettingsItem
                                icon={<Phone size={20} color={COLORS.primary} />}
                                label="Auto-sync Call Logs"
                                value={callLogSync}
                                onValueChange={async (value: boolean) => {
                                    if (value) {
                                        const granted = await requestCallLogPermission();
                                        if (granted) {
                                            setCallLogSync(true);
                                            await setAutoSyncEnabled(true);
                                            Alert.alert('Success', 'Call log sync enabled. Tap "Sync Now" to import recent calls.');
                                        } else {
                                            Alert.alert('Permission Denied', 'Call log access is required for auto-sync.');
                                        }
                                    } else {
                                        setCallLogSync(false);
                                        await setAutoSyncEnabled(false);
                                    }
                                }}
                                isToggle
                                borderBottom
                                colors={colors}
                            />
                            <TouchableOpacity
                                onPress={async () => {
                                    if (!callLogSync) {
                                        Alert.alert('Not Enabled', 'Please enable auto-sync first.');
                                        return;
                                    }
                                    setSyncing(true);
                                    try {
                                        const result = await syncCallLogs();
                                        const timestamp = await getLastSyncTimestamp();
                                        setLastSync(new Date(timestamp).toLocaleString());
                                        Alert.alert(
                                            'Sync Complete',
                                            `Synced ${result.synced} call(s).${result.errors > 0 ? ` ${result.errors} error(s).` : ''}`
                                        );
                                    } catch (err: any) {
                                        Alert.alert('Sync Failed', err.message || 'Could not sync call logs.');
                                    } finally {
                                        setSyncing(false);
                                    }
                                }}
                                style={dynamicStyles.syncButton}
                                disabled={syncing}
                            >
                                <View style={dynamicStyles.syncContent}>
                                    <View style={dynamicStyles.iconContainer}>
                                        {syncing ? (
                                            <ActivityIndicator size="small" color={COLORS.primary} />
                                        ) : (
                                            <RefreshCw size={18} color={COLORS.primary} />
                                        )}
                                    </View>
                                    <View>
                                        <Text style={dynamicStyles.syncTitle}>{syncing ? 'Syncing...' : 'Sync Now'}</Text>
                                        {lastSync && (
                                            <Text style={dynamicStyles.syncSubtitle}>Last sync: {lastSync}</Text>
                                        )}
                                    </View>
                                </View>
                                <ChevronRight size={20} color={colors.mutedText} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* General Section */}
                <Text style={dynamicStyles.sectionTitle}>General</Text>
                <View style={dynamicStyles.sectionContainer}>
                    <SettingsItem
                        icon={<Calendar size={20} color={COLORS.primary} />}
                        label="Calendar Sync"
                        value={calendarSync}
                        onValueChange={setCalendarSync}
                        isToggle
                        borderBottom
                        colors={colors}
                    />
                    <SettingsItem
                        icon={<Bell size={20} color={COLORS.primary} />}
                        label="Notifications"
                        value={notifications}
                        onValueChange={setNotifications}
                        isToggle
                        colors={colors}
                    />
                </View>

                {/* Data Section */}
                <Text style={dynamicStyles.sectionTitle}>Data & Backup</Text>
                <View style={dynamicStyles.sectionContainer}>
                    <TouchableOpacity
                        onPress={handleBackup}
                        style={dynamicStyles.backupButton}
                    >
                        <View style={dynamicStyles.backupContent}>
                            <View style={dynamicStyles.iconContainer}>
                                <Upload size={18} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={dynamicStyles.backupTitle}>Export Backup</Text>
                                <Text style={dynamicStyles.backupSubtitle}>Save your data externally</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color={colors.mutedText} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={dynamicStyles.versionContainer}>
                    <Text style={dynamicStyles.versionText}>BondVault v1.0.0</Text>
                </TouchableOpacity>

            </ScrollView>
        </Layout>
    );
}

const SettingsItem = ({ icon, label, value, onValueChange, isToggle, borderBottom, colors }: any) => (
    <View style={[styles.settingsItem, borderBottom && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <View style={styles.itemLeft}>
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
        </View>
        {isToggle && (
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: COLORS.primary }}
            />
        )}
    </View>
);

const styles = StyleSheet.create({
    layout: {},
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
        padding: 24,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 8,
    },
    sectionContainer: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: 32,
        borderWidth: 1,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.tealLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemLabel: {
        fontWeight: '500',
        fontSize: FONT_SIZE.base,
    },
    backupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    backupContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backupTitle: {
        fontWeight: '500',
        fontSize: FONT_SIZE.base,
    },
    backupSubtitle: {
        fontSize: FONT_SIZE.xs,
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    versionText: {
        fontSize: FONT_SIZE.sm,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    syncContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncTitle: {
        fontWeight: '500',
        fontSize: FONT_SIZE.base,
    },
    syncSubtitle: {
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
    themeSelector: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
    },
    themeOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.input,
        borderWidth: 2,
        borderColor: 'transparent',
        gap: 8,
    },
    themeOptionActive: {
        backgroundColor: COLORS.tealLight,
        borderColor: COLORS.primary,
    },
    themeOptionText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
    },
    themeOptionTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
