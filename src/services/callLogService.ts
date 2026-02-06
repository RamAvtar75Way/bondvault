// NOTE: Call log sync requires native modules that are not compatible with Expo Go
// To enable this feature, you would need to create a development build with 'npx expo prebuild'
// For now, this service provides placeholder functions to prevent errors

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_SYNC_ENABLED_KEY = 'call_log_auto_sync_enabled';
const LAST_SYNC_KEY = 'call_log_last_sync';

// Placeholder: Always returns false in Expo Go
export const requestCallLogPermission = async (): Promise<boolean> => {
    return false;
};

// Placeholder: Always returns false in Expo Go
export const hasCallLogPermission = async (): Promise<boolean> => {
    return false;
};

// Get auto-sync setting (stored but not functional in Expo Go)
export const isAutoSyncEnabled = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(AUTO_SYNC_ENABLED_KEY);
        return value === 'true';
    } catch (err) {
        return false;
    }
};

// Set auto-sync setting
export const setAutoSyncEnabled = async (enabled: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(AUTO_SYNC_ENABLED_KEY, enabled.toString());
    } catch (err) {
        console.error('Error setting auto-sync preference:', err);
    }
};

// Get last sync timestamp
export const getLastSyncTimestamp = async (): Promise<number> => {
    try {
        const value = await AsyncStorage.getItem(LAST_SYNC_KEY);
        return value ? parseInt(value, 10) : 0;
    } catch (err) {
        return 0;
    }
};

// Placeholder: Throws error explaining limitation
export const syncCallLogs = async (): Promise<{ synced: number; errors: number }> => {
    throw new Error('Call log sync requires a development build with native modules. This feature is not available in Expo Go.');
};
