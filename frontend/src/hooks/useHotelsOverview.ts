import { useQuery } from '@tanstack/react-query';
import { getAllHotels, Hotel } from '@/apiClient/hotelsApi';

export const HOTELS_OVERVIEW_QUERY_KEY = ['hotelsOverview'] as const;

export function useHotelsOverview(staleTimeMs: number = 5 * 60 * 1000) {
  const query = useQuery<Hotel[]>({
    queryKey: HOTELS_OVERVIEW_QUERY_KEY,
    queryFn: getAllHotels,
    staleTime: staleTimeMs,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  return query;
}

