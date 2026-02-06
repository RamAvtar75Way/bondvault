# React Native Expo Base Template

## 🚀 Features

*   **State Management**: Scalable architecture using **Redux Toolkit**.
*   **Networking**: Modern **RTK Query** setup with:
    *   Auto-injected Auth Headers.
    *   Caching and automatic re-fetching.
*   **Navigation**: 
    *   React Navigation v7 (Stack & Tabs).
    *   **Type-Safe Navigation**: Fully typed screens and route parameters using TypeScript.
*   **Internationalization (i18n)**:
    *   Powered by `i18next` and `expo-localization`.
    *   Full support for **English, Spanish, Arabic**.
    *   **RTL Support**: Automatic layout handling.
*   **Theming**:
    *   Dynamic **Light/Dark mode** support.
    *   Persisted user preference via Redux.
*   **Secure & Local Storage**: Unified access using `AsyncStorage` and `Expo SecureStore`

## 🛠 Tech Stack

*   **Framework**: React Native (Expo SDK 54+)
*   **Language**: TypeScript
*   **State Management**: Redux Toolkit (RTK)
*   **Networking**: RTK Query
*   **Navigation**: React Navigation v7
*   **Forms**: Formik + Yup
*   **Storage**: Expo SecureStore + AsyncStorage

## 📂 Project Structure

The project structure is designed to be intuitive and scalable.

```
src/
├── components/          # Reusable UI components (Buttons, Inputs)
├── constants/           # Global constants (StorageKeys, Colors)
├── hooks/               # Custom React Hooks (useTheme, etc.)
├── i18n/                # Localization resources
├── navigation/          # React Navigation setup (Stacks, Tabs, Types)
├── screens/             # UI Screens (Pages)
├── services/            # Infrastructure services
│   └── baseApi.ts       # RTK Query API definition
├── store/               # Redux Store configuration
│   └── slices/          # Feature slices (Auth, Settings)
├── theme/               # Design System & Theme Config
└── utils/               # Utility functions
```

## ⚡ Getting Started

### 1. Requirements

*   Node.js (LTS)
*   iOS Simulator or Android Emulator

### 2. Setup

Clone the repo and install dependencies:

```bash
npm install
```

### 3. Environment Config

Create a `.env` file in the root directory (don't forget to add it to `.gitignore`):

```env
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### 4. Run the App

```bash
npx expo start
```

### 5. Run on Native (Android/iOS)

Since this project contains native code, you can run it directly on simulators/emulators without Expo Go.

**Prerequisites:**
*   **Android**: Android Studio & Android SDK installed.
*   **iOS**: Xcode & CocoaPods installed (Mac only).

**Commands:**

```bash
# Run on Android Emulator
npm run android

# Run on iOS Simulator
npm run ios
```

## 📖 Development Guide

### How to Add a New Page

1.  Create the screen component in `src/screens/MyNewScreen.tsx`.
2.  Define the props type using `NativeStackScreenProps` or `BottomTabScreenProps`:
    ```tsx
    import { NativeStackScreenProps } from '@react-navigation/native-stack';
    import { RootStackParamList } from '../navigation/types';

    type Props = NativeStackScreenProps<RootStackParamList, 'MyNewScreen'>;

    export const MyNewScreen = ({ navigation }: Props) => { ... }
    ```
3.  Add the route name to `src/navigation/types.ts`:
    ```typescript
    export type RootStackParamList = {
      // ...
      MyNewScreen: undefined;
    };
    ```
4.  Add it to data navigator in `src/navigation/MainNavigator.tsx` (or AuthNavigator).

### How to Add/Edit Translations

1.  Open `src/i18n/locales/en.json`.
2.  Add your new key-value pair:
    ```json
    {
      "helloWorld": "Hello World"
    }
    ```
3.  Add the same key to `es.json` and `ar.json` with translations.
4.  Use it in code:
    ```tsx
    const { t } = useTranslation();
    <Text>{t('helloWorld')}</Text>
    ```

### State Management (Redux)

1.  Create a new slice in `src/store/slices/mySlice.ts`.
2.  Add the reducer to `src/store/index.ts`.
3.  Use typed hooks in components:
    ```tsx
    const dispatch = useAppDispatch();
    const data = useAppSelector(state => state.mySlice.data);
    ```

### Networking

The `baseApi.ts` is already set up with RTK Query.

```typescript
// src/services/baseApi.ts

// 1. Add endpoint
getUsers: builder.query<User[], void>({
  query: () => 'users',
}),

// 2. Export hook
export const { useGetUsersQuery } = baseApi;

// 3. Use in component
const { data, isLoading } = useGetUsersQuery();
```