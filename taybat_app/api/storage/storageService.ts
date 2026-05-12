import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

const storage = isWeb ? webStorage : AsyncStorage;

class StorageService {
  async set(key: string, value: unknown): Promise<void> {
    const storeValue = typeof value === 'string' ? value : JSON.stringify(value);
    await storage.setItem(key, storeValue);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await storage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  }

  async getString(key: string): Promise<string | null> {
    let value = await storage.getItem(key);
    if (value === null) return null;
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    return value;
  }

  async remove(key: string): Promise<void> {
    await storage.removeItem(key);
  }
}

export const storageService = new StorageService();
