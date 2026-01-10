import { type PropsWithChildren, useMemo } from 'react';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

import { DATABASE_NAME, migrations } from '@/db';

import { DrizzleContext } from '@/contexts/drizzle-context';

const Logger = console;

function DrizzleProvider({ children }: PropsWithChildren) {
  const sqliteDb = useSQLiteContext();

  const db = useMemo(() => {
    Logger.info('Creating Drizzle instance');
    return drizzle(sqliteDb);
  }, [sqliteDb]);

  return <DrizzleContext.Provider value={db}>{children}</DrizzleContext.Provider>;
}

async function migrateAsync(db: SQLiteDatabase) {
  const drizzleDb = drizzle(db);
  await migrate(drizzleDb, migrations);
}

const options = { enableChangeListener: true };

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onError={Logger.error}
      onInit={migrateAsync}
      options={options}>
      <DrizzleProvider>{children}</DrizzleProvider>
    </SQLiteProvider>
  );
}
