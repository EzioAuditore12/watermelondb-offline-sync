import { ApiClient } from '@loonylabs/react-native-offline-sync';

import { pullChangesApi } from '@/api/pull-changes.api';
import { pushChangesApi } from '@/api/push-changes.api';

export const apiClient: ApiClient = {
  pull: async (payload) => {
    const { changes, timestamp } = await pullChangesApi({
      lastSyncAt: payload.lastSyncAt,
      tables: payload.tables,
    });

    return {
      changes: changes as {
        [tableName: string]: {
          created: Record<string, any>[];
          updated: Record<string, any>[];
          deleted: string[];
        };
      },
      timestamp,
    };
  },
  push: async (payload) => {
    const { results, success } = await pushChangesApi(payload as any);

    // Convert error: null to error: undefined for type compatibility
    const mappedResults = results.map((result: any) => ({
      ...result,
      error: result.error === null ? undefined : result.error,
    }));

    return { results: mappedResults, success };
  },
};
