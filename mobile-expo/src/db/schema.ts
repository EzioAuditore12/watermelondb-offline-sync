import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status').notNull(), // 'active' | 'archived'
  updatedAt: integer('updated_at').notNull(),
});

export type ItemEntity = typeof items.$inferSelect;
export type NewItemEntity = typeof items.$inferInsert