
import { Dexie, type Table } from 'dexie';
import { SavedBlueprint, UserProfile } from '../types';

export class ArchitectDatabase extends Dexie {
  blueprints!: Table<SavedBlueprint>;
  profile!: Table<UserProfile & { id: string }>;
  secureKeys!: Table<{ provider: string, key: string }>;

  constructor() {
    super('AutoArchitectDB');
    // Configure database versioning and stores on the instance
    this.version(1).stores({
      blueprints: 'id, name, platform, timestamp',
      profile: 'id',
      secureKeys: 'provider'
    });
  }
}

export const db = new ArchitectDatabase();

// Security Wrapper: Simulating local encryption for keys
export const storage = {
  async saveKey(provider: string, key: string) {
    const obfuscated = btoa(key).split('').reverse().join(''); // Simple client-side obfuscation
    return await db.secureKeys.put({ provider, key: obfuscated });
  },

  async getKey(provider: string): Promise<string | null> {
    const entry = await db.secureKeys.get(provider);
    if (!entry) return null;
    return atob(entry.key.split('').reverse().join(''));
  },

  async getProfile(): Promise<UserProfile | null> {
    const p = await db.profile.get('current');
    return p || null;
  },

  async saveProfile(p: UserProfile) {
    return await db.profile.put({ ...p, id: 'current' });
  }
};
