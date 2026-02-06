
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeRouter, Routes, Route, Navigate } from 'react-router-native';
import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

// Screens
import SplashScreen from './src/screens/auth/SplashScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import VaultAuthScreen from './src/screens/auth/VaultAuthScreen';

// Main App Layout & Screens
import MainTabLayout from './src/components/ui/MainTabLayout';
import ContactsListScreen from './src/screens/contacts/ContactsListScreen';
import InteractionsScreen from './src/screens/interactions/InteractionsScreen';
import RemindersScreen from './src/screens/reminders/RemindersScreen';
import VaultScreen from './src/screens/vault/VaultScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';

// Detail Screens
import AddContactScreen from './src/screens/contacts/AddContactScreen';
import ImportContactsScreen from './src/screens/contacts/ImportContactsScreen';
import ContactProfileScreen from './src/screens/contacts/ContactProfileScreen';
import LogInteractionScreen from './src/screens/interactions/LogInteractionScreen';
import AddReminderScreen from './src/screens/reminders/AddReminderScreen';
import { initializeDb } from './src/db/client';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          Font.loadAsync({ Inter_400Regular, Inter_700Bold }),
          initializeDb()
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NativeRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public / Auth Flow */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/vault-auth" element={<VaultAuthScreen />} />

          {/* Main App (Tab Navigation) */}
          <Route path="/app" element={<MainTabLayout />}>
            <Route path="contacts" element={<ContactsListScreen />} />
            <Route path="interactions" element={<InteractionsScreen />} />
            <Route path="reminders" element={<RemindersScreen />} />
            <Route path="vault" element={<VaultScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>

          {/* Detail Screens (Stack-like, outside tabs or on top) */}
          <Route path="/add-contact" element={<AddContactScreen />} />
          <Route path="/edit-contact/:id" element={<AddContactScreen />} />
          <Route path="/import-contacts" element={<ImportContactsScreen />} />
          <Route path="/contact/:id" element={<ContactProfileScreen />} />
          <Route path="/log-interaction/:contactId" element={<LogInteractionScreen />} />
          <Route path="/add-reminder" element={<AddReminderScreen />} />
          <Route path="/add-reminder/:contactId" element={<AddReminderScreen />} />

        </Routes>
      </NativeRouter>
    </SafeAreaProvider>
  );
}
