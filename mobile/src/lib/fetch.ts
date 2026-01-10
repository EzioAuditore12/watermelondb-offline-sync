import { FetchRequestInit } from 'expo/fetch';

import { fetch } from 'react-native-nitro-fetch';
import * as s from 'standard-parse';

export type FetchProps = FetchRequestInit;

export type HttpMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface TypedFetchProps<S extends s.StandardSchemaV1> extends Omit<
  FetchRequestInit,
  'method' | 'body'
> {
  url: string;
  schema: S;
  method: HttpMethods;
  params?: object;
  body?: object;
}

export { fetch };

export const typedFetch = async <S extends s.StandardSchemaV1>({
  url,
  schema,
  headers,
  params,
  method,
  body,
  ...props
}: TypedFetchProps<S>): Promise<s.StandardSchemaV1.InferOutput<S>> => {
  const typedFetchHeader = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (params !== undefined) {
    const paramsValues = new URLSearchParams(params as Record<string, string>).toString();

    url = url + (url.includes('?') ? '&' : '?') + paramsValues;
  }

  const response = await fetch(url, {
    headers: typedFetchHeader,
    method: method,
    body: body ? JSON.stringify(body) : undefined,
    ...props,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    try {
      const errorJson = JSON.parse(errorBody);
      throw new Error(errorJson.message || JSON.stringify(errorJson));
    } catch {
      throw new Error(errorBody || response.statusText);
    }
  }

  const json = await response.json();

  const result = s.safeParse(schema, json);

  if (result.issues) throw new Error(JSON.stringify(result.issues));

  return result.value;
};
