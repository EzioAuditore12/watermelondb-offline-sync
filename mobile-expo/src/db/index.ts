import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import migrations from './migrations/migrations';

const expo = SQLite.openDatabaseSync('db.db');

export { migrations };

export const db = drizzle(expo);
