import { appSchema, type TableSchema } from '@nozbe/watermelondb';

export function createSchema(tables: TableSchema[]) {
  return appSchema({
    version: 1,
    tables,
  });
}
