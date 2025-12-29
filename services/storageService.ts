

import { Dexie, type Table } from 'dexie';
import { SavedBlueprint, UserProfile } from '../types';

/**
 * Standard Dexie database initialization.
 * Using named import for Dexie ensures that class methods like 'version' 
 * are correctly inherited and recognized by the TypeScript compiler.
 */
export class ArchitectDatabase extends Dexie {
  blueprints!: Table<SavedBlueprint>;
  profile!: Table<UserProfile & { id: string }>;

  constructor() {
    // Initialize the database with its name
    super('AutoArchitectDB');
    
    // Configure database versioning and stores on the instance.
    // The version() method is inherited from the Dexie base class.
    // Fix: Explicitly cast 'this' to the base Dexie class to resolve the inheritance visibility issue in some TypeScript environments.
    (this as Dexie).version(1).stores({
      blueprints: 'id, name, platform, timestamp',
      profile: 'id'
    });
  }
}

export const db = new ArchitectDatabase();

// Removed local key storage to comply with exclusively using process.env.API_KEY
export const storage = {
  async getProfile(): Promise<UserProfile | null> {
    const p = await db.profile.get('current');
    return p || null;
  },

  async saveProfile(p: UserProfile) {
    return await db.profile.put({ ...p, id: 'current' });
  }
};
