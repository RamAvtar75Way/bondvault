import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const PIN_KEY = 'bondvault_secure_pin';
const BIOMETRIC_KEY = 'bondvault_biometric_enabled';

// Secure Store for PIN
export const setStoredPin = async (pin: string) => {
    try {
        await SecureStore.setItemAsync(PIN_KEY, pin);
        return true;
    } catch (e) {
        console.error('Error saving PIN', e);
        return false;
    }
};

export const getStoredPin = async () => {
    try {
        return await SecureStore.getItemAsync(PIN_KEY);
    } catch (e) {
        console.error('Error retrieving PIN', e);
        return null;
    }
};

export const resetStoredPin = async () => {
    try {
        await SecureStore.deleteItemAsync(PIN_KEY);
        return true;
    } catch (e) {
        console.error('Error resetting PIN', e);
        return false;
    }
};

// Async Storage for Preferences (not sensitive data)
export const setBiometricEnabled = async (enabled: boolean) => {
    try {
        await AsyncStorage.setItem(BIOMETRIC_KEY, JSON.stringify(enabled));
    } catch (e) {
        console.error('Error saving biometric preference', e);
    }
};

export const isBiometricEnabled = async () => {
    try {
        const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
        return value !== null ? JSON.parse(value) : true; // Default to true
    } catch (e) {
        return true;
    }
};

export const checkBiometricHardware = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
};
