import { env } from '@/env';

import { typedFetch } from '@/lib/fetch';
import { PushChangeParam } from '@/schemas/push-changes/param.schema';

import { pushChangeResponse } from '@/schemas/push-changes/response.schema';

export const pushChangesApi = async (changes: PushChangeParam) => {
  return await typedFetch({
    url: `${env.API_URL}/task/sync/push`,
    method: 'POST',
    body: changes,
    schema: pushChangeResponse,
  });
};
