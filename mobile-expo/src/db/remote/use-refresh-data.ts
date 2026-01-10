import { useQueryClient } from '@tanstack/react-query';

export function useRefreshData() {
  const queryClient = useQueryClient();

  const isItemsRefreshing =
    queryClient.isFetching({
      queryKey: ['items'],
      stale: false,
    }) > 0;

  const refreshItems = () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  return { isItemsRefreshing, refreshItems };
}
