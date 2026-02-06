import AsyncStorage from '@react-native-async-storage/async-storage';



export const saveString = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log('Error saving data', error);
  }
};

export const getString = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.log('Error getting data', error);
    return null;
  }
};

export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('Error removing data', error);
  }
};
