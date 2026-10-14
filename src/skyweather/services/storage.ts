import AsyncStorage from '@react-native-async-storage/async-storage';
export async function read<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`skyweather:${key}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
export async function write(key: string, value: unknown) {
  await AsyncStorage.setItem(`skyweather:${key}`, JSON.stringify(value));
}
