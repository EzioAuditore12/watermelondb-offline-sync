import { text, integer } from 'drizzle-orm/sqlite-core';

export const syncMetadataColumns = {
  serverId: text(),
  serverUpdatedAt: integer(),
  syncStatus: text({
    enum: ['PENDING', 'SYNCED', 'FAILED'],
  }),
  lastSyncError: text(),
};
