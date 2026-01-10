import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import migrations from './migrations/migrations';

export const DATABASE_NAME = 'db.db';

const expo = SQLite.openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export { migrations };

export const db = drizzle(expo);
