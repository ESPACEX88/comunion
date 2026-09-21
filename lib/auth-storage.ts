import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import { Platform } from 'react-native';
import 'react-native-get-random-values';

/**
 * Expo SecureStore no aguanta más de ~2048 bytes (la sesión de Supabase es más grande).
 * En nativo: clave AES en SecureStore, valor cifrado en AsyncStorage.
 * En web: AsyncStorage plano (SecureStore no existe).
 */
class LargeSecureStore {
  private async encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(32));
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) return encryptionKeyHex;
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1),
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return encrypted;
    return this.decrypt(key, encrypted);
  }

  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
    const encrypted = await this.encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        /* noop */
      }
    }
  }
}

export const authStorage = new LargeSecureStore();
