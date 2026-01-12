import type { AppSchema } from '@nozbe/watermelondb';
import type { SchemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

export function createAdapter(schema: AppSchema, migrations: SchemaMigrations) {
  return new SQLiteAdapter({
    schema,
    migrations,
    jsi: true,
    onSetUpError: (error) => {
      console.log(error);
    },
  });
}
