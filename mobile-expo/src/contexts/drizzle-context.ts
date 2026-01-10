import { createContext } from 'react';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export const DrizzleContext = createContext<ExpoSQLiteDatabase | null>(null);
