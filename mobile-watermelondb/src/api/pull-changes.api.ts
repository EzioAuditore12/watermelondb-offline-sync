import { typedFetch } from '@/lib/fetch';

import { env } from '@/env';

import type { PullChangesParam } from '@/schemas/pull-changes/param.schema';
import { pullChangesResponseSchema } from '@/schemas/pull-changes/response.schema';

export const pullChangesApi = async ({ lastSyncAt, tables }: PullChangesParam) => {
  console.log(lastSyncAt);

  if (lastSyncAt === null || lastSyncAt === undefined) lastSyncAt = 0;

  return await typedFetch({
    url: `${env.API_URL}/task/sync/pull`,
    body: { lastSyncAt, tables },
    method: 'GET',
    schema: pullChangesResponseSchema,
  });
};
