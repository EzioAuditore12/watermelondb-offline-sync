import type { ApiClient } from './types';

import { pullChangesApi } from '@/api/pull-changes.api';
import { pushChangesApi } from '@/api/push-changes.api';

export const apiClient: ApiClient = {
  pull: async (payload) => {
    console.log('Payload for pull is:');

    const { changes, timestamp } = await pullChangesApi({
      lastSyncAt: payload.lastSyncAt,
      tables: payload.tables,
    });

    console.log(changes.tasks);

    return { changes, timestamp };
  },
  push: async (payload) => {
    console.log(payload.changes);

    const { results, success } = await pushChangesApi(payload as any);

    return { results, success };
  },
};
