import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';
import { useStocks } from './useStocks';
import type { WatchlistItem } from '@/types';

function mapWatchlistItem(row: Record<string, unknown>): WatchlistItem {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    stockTicker: row.stock_ticker as string,
    addedAt: row.added_at as string,
  };
}

async function fetchWatchlist(sessionId: string): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('session_id', sessionId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }

  return (data || []).map(row => mapWatchlistItem(row as Record<string, unknown>));
}

export function useWatchlist() {
  const { sessionId, isReady } = useSession();
  const { stocks } = useStocks();
  const queryClient = useQueryClient();

  const watchlistQuery = useQuery({
    queryKey: ['watchlist', sessionId],
    queryFn: () => fetchWatchlist(sessionId!),
    enabled: isReady && !!sessionId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Enrich watchlist items with stock data
  const watchlistWithStocks = (watchlistQuery.data || []).map(item => ({
    ...item,
    stock: stocks.find(s => s.ticker === item.stockTicker),
  }));

  const addToWatchlistMutation = useMutation({
    mutationFn: async (stockTicker: string) => {
      if (!sessionId) throw new Error('Session not ready');

      const { error } = await supabase
        .from('watchlist')
        .insert({
          session_id: sessionId,
          stock_ticker: stockTicker,
        });

      if (error) {
        // Ignore duplicate errors
        if (error.code === '23505') return;
        throw new Error(`Failed to add to watchlist: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', sessionId] });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (stockTicker: string) => {
      if (!sessionId) throw new Error('Session not ready');

      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('session_id', sessionId)
        .eq('stock_ticker', stockTicker);

      if (error) throw new Error(`Failed to remove from watchlist: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', sessionId] });
    },
  });

  const isInWatchlist = (stockTicker: string): boolean => {
    return watchlistWithStocks.some(item => item.stockTicker === stockTicker);
  };

  const toggleWatchlist = (stockTicker: string) => {
    if (isInWatchlist(stockTicker)) {
      removeFromWatchlistMutation.mutate(stockTicker);
    } else {
      addToWatchlistMutation.mutate(stockTicker);
    }
  };

  return {
    watchlist: watchlistWithStocks,
    isLoading: watchlistQuery.isLoading,
    error: watchlistQuery.error?.message || null,
    addToWatchlist: addToWatchlistMutation.mutate,
    removeFromWatchlist: removeFromWatchlistMutation.mutate,
    isInWatchlist,
    toggleWatchlist,
    isToggling: addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending,
  };
}
