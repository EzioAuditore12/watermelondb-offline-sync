import { useQuery } from '@tanstack/react-query';

// TODO: Need to write logic here

export const ITEMS_QUERY_KEY = ['items'];

export function useGetItems(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch('https://api.example.com/items');
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    },
    retry: 1,
    staleTime: 60_000,
    ...options,
  });
}