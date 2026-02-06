
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, Share, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Layout } from '../../components/ui/Layout';
import { useNavigate } from 'react-router-native';
import { ArrowLeft, Bell, Calendar, Lock, Cloud, ChevronRight, Upload, Phone, RefreshCw } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { db } from '../../db/client';
import { contacts, interactions, reminders } from '../../db/schema';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { setBiometricEnabled as saveBiometricPref, isBiometricEnabled, resetStoredPin, getStoredPin } from '../../utils/security';
import {
    isAutoSyncEnabled,
    setAutoSyncEnabled,
    requestCallLogPermission,
    syncCallLogs,
    getLastSyncTimestamp
} from '../../services/callLogService';

export default function SettingsScreen() {
    const navigate = useNavigate();
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

    return (
        <Layout style={styles.layout}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView style={styles.scrollView}>

                {/* Security Section */}
                <Text style={styles.sectionTitle}>Security</Text>
                <View style={styles.sectionContainer}>
                    <SettingsItem
                        icon={<Lock size={20} color={COLORS.primary} />}
                        label="Biometric & Vault"
                        value={biometricEnabled}
                        onValueChange={handleBiometricToggle}
                        isToggle
                        borderBottom
                    />
                    <TouchableOpacity
                        style={styles.settingsItem}
                        onPress={handleChangePasscode}
                    >
                        <View style={styles.itemLeft}>
                            <View style={styles.iconContainer}>
                                <Lock size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.itemLabel}>Change Passcode</Text>
                        </View>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                </View>

                {/* Call Log Sync Section (Disabled - requires development build) */}
                {false && Platform.OS === 'android' && (
                    <>
                        <Text style={styles.sectionTitle}>Call Log Sync</Text>
                        <View style={styles.sectionContainer}>
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
                                style={styles.syncButton}
                                disabled={syncing}
                            >
                                <View style={styles.syncContent}>
                                    <View style={styles.iconContainer}>
                                        {syncing ? (
                                            <ActivityIndicator size="small" color={COLORS.primary} />
                                        ) : (
                                            <RefreshCw size={18} color={COLORS.primary} />
                                        )}
                                    </View>
                                    <View>
                                        <Text style={styles.syncTitle}>{syncing ? 'Syncing...' : 'Sync Now'}</Text>
                                        {lastSync && (
                                            <Text style={styles.syncSubtitle}>Last sync: {lastSync}</Text>
                                        )}
                                    </View>
                                </View>
                                <ChevronRight size={20} color="#CBD5E1" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* General Section */}
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.sectionContainer}>
                    <SettingsItem
                        icon={<Calendar size={20} color={COLORS.primary} />}
                        label="Calendar Sync"
                        value={calendarSync}
                        onValueChange={setCalendarSync}
                        isToggle
                        borderBottom
                    />
                    <SettingsItem
                        icon={<Bell size={20} color={COLORS.primary} />}
                        label="Notifications"
                        value={notifications}
                        onValueChange={setNotifications}
                        isToggle
                    />
                </View>

                {/* Data Section */}
                <Text style={styles.sectionTitle}>Data & Backup</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        onPress={handleBackup}
                        style={styles.backupButton}
                    >
                        <View style={styles.backupContent}>
                            <View style={styles.iconContainer}>
                                <Upload size={18} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={styles.backupTitle}>Export Backup</Text>
                                <Text style={styles.backupSubtitle}>Save your data externally</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.versionContainer}>
                    <Text style={styles.versionText}>BondVault v1.0.0</Text>
                </TouchableOpacity>

            </ScrollView>
        </Layout>
    );
}

const SettingsItem = ({ icon, label, value, onValueChange, isToggle, borderBottom }: any) => (
    <View style={[styles.settingsItem, borderBottom && styles.borderBottom]}>
        <View style={styles.itemLeft}>
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Text style={styles.itemLabel}>{label}</Text>
        </View>
        {isToggle && (
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
            />
        )}
    </View>
);

const styles = StyleSheet.create({
    layout: {
        backgroundColor: '#F8FAFC', // slate-50
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    scrollView: {
        flex: 1,
        padding: 24,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: 'bold',
        color: '#64748B', // slate-500
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 8,
    },
    sectionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
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
        color: '#0F172A',
        fontWeight: '500',
        fontSize: FONT_SIZE.base,
    },
    backupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    backupContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backupTitle: {
        color: '#0F172A',
        fontWeight: '500',
        fontSize: FONT_SIZE.base,
    },
    backupSubtitle: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.xs,
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    versionText: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.sm,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    syncContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncTitle: {
        color: '#0F172A',
        fontWeight: '500',
        fontSize: FONT_SIZE.base,
    },
    syncSubtitle: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
});
