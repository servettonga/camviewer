import { openDB, DBSchema } from 'idb';
import { AppConfig } from '@/types/camera';

interface CamViewDB extends DBSchema {
  config: {
    key: string;
    value: AppConfig;
  };
}

const DB_NAME = 'camview-db';
const DB_VERSION = 1;
const STORE_NAME = 'config';
const CONFIG_KEY = 'app-config';

async function getDB() {
  return openDB<CamViewDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveConfig(config: AppConfig): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, config, CONFIG_KEY);
}

export async function loadConfig(): Promise<AppConfig | null> {
  try {
    const db = await getDB();
    const config = await db.get(STORE_NAME, CONFIG_KEY);
    return config ?? null;
  } catch {
    return null;
  }
}

// Migrate from localStorage if exists
export async function migrateFromLocalStorage(): Promise<AppConfig | null> {
  const LEGACY_KEY = 'camview-config';
  const stored = localStorage.getItem(LEGACY_KEY);

  if (stored) {
    try {
      const config = JSON.parse(stored) as AppConfig;
      // Save to IndexedDB
      await saveConfig(config);
      // Remove from localStorage
      localStorage.removeItem(LEGACY_KEY);
      console.log('Migrated config from localStorage to IndexedDB');
      return config;
    } catch {
      return null;
    }
  }
  return null;
}
