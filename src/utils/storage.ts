import * as SecureStore from 'expo-secure-store';

export const saveToken = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.log('Error saving token', error);
  }
};

export const getToken = async (key: string) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.log('Error getting token', error);
    return null;
  }
};

export const removeToken = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log('Error removing token', error);
  }
};
