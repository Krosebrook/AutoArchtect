

import { Dexie, type Table } from 'dexie';
import { SavedBlueprint, UserProfile } from '../types';

/**
 * SecureKey interface for storing obfuscated API keys
 */
export interface SecureKey {
  provider: string;
  obfuscatedKey: string;
  createdAt: number;
}

/**
 * Standard Dexie database initialization.
 * Using named import for Dexie ensures that class methods like 'version' 
 * are correctly inherited and recognized by the TypeScript compiler.
 */
export class ArchitectDatabase extends Dexie {
  blueprints!: Table<SavedBlueprint>;
  profile!: Table<UserProfile & { id: string }>;
  secureKeys!: Table<SecureKey, string>;

  constructor() {
    // Initialize the database with its name
    super('AutoArchitectDB');
    
    // Version 1: Initial schema
    (this as Dexie).version(1).stores({
      blueprints: 'id, name, platform, timestamp',
      profile: 'id'
    });

    // Version 2: Add secureKeys table for local API key storage
    (this as Dexie).version(2).stores({
      blueprints: 'id, name, platform, timestamp',
      profile: 'id',
      secureKeys: 'provider, createdAt'
    });
  }
}

export const db = new ArchitectDatabase();

/**
 * Key Obfuscation Utilities
 * 
 * SECURITY MODEL: This is reversible obfuscation, NOT encryption.
 * The seed is intentionally visible in source code. This approach:
 * - Prevents casual inspection via browser DevTools
 * - Prevents accidental exposure in screenshots/logs
 * - Is NOT secure against determined attackers with source access
 * 
 * This matches the documented "obfuscation shim" architecture pattern.
 * For true security, keys should never be stored client-side. However,
 * this PWA requires client-side storage for offline functionality.
 * 
 * Users are advised: If security is critical, use environment variables
 * in controlled deployment environments instead of local storage.
 */
const OBFUSCATION_SEED = 'AutoArchitect-SecureVault-2026';

function obfuscateKey(plainKey: string): string {
  const seed = OBFUSCATION_SEED;
  let result = '';
  for (let i = 0; i < plainKey.length; i++) {
    const charCode = plainKey.charCodeAt(i) ^ seed.charCodeAt(i % seed.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode for storage safety
}

function deobfuscateKey(obfuscatedKey: string): string {
  const seed = OBFUSCATION_SEED;
  try {
    const decoded = atob(obfuscatedKey);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ seed.charCodeAt(i % seed.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    throw new Error('Key deobfuscation failed. Corrupted data.');
  }
}

/**
 * Storage API with Secure Key Management
 */
export const storage = {
  async getProfile(): Promise<UserProfile | null> {
    const p = await db.profile.get('current');
    return p || null;
  },

  async saveProfile(p: UserProfile) {
    return await db.profile.put({ ...p, id: 'current' });
  },

  /**
   * Save an API key for a provider with obfuscation
   */
  async saveSecureKey(provider: string, plainKey: string): Promise<void> {
    // Validate provider name (alphanumeric, hyphens, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(provider)) {
      throw new Error('Invalid provider name. Use alphanumeric characters only.');
    }

    if (!plainKey || plainKey.trim().length === 0) {
      throw new Error('API key cannot be empty.');
    }

    const obfuscatedKey = obfuscateKey(plainKey.trim());
    await db.secureKeys.put({
      provider: provider.toLowerCase(),
      obfuscatedKey,
      createdAt: Date.now()
    });
  },

  /**
   * Retrieve and deobfuscate an API key for a provider
   */
  async getSecureKey(provider: string): Promise<string | null> {
    const record = await db.secureKeys.get(provider.toLowerCase());
    if (!record) return null;
    return deobfuscateKey(record.obfuscatedKey);
  },

  /**
   * Delete a stored API key
   */
  async deleteSecureKey(provider: string): Promise<boolean> {
    const count = await db.secureKeys.where('provider').equals(provider.toLowerCase()).delete();
    return count > 0;
  },

  /**
   * List all providers that have stored keys (not the keys themselves)
   */
  async listSecureKeys(): Promise<string[]> {
    const keys = await db.secureKeys.toArray();
    return keys.map(k => k.provider);
  }
};
