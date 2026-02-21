import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PriceHistory } from '@/lib/types';

export function usePriceHistory(stockId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['price-history', stockId],
    queryFn: async (): Promise<PriceHistory[]> => {
      let query = supabase
        .from('price_history')
        .select('*')
        .order('date', { ascending: true });

      if (stockId) {
        query = query.eq('stock_id', stockId);
      }

      const { data: history, error } = await query.limit(365);

      if (error) {
        console.error('Error fetching price history:', error);
        return [];
      }

      return history.map((h) => ({
        id: h.id,
        stockId: h.stock_id,
        date: h.date,
        openPrice: h.open_price ?? h.close_price,
        highPrice: h.high_price ?? h.close_price,
        lowPrice: h.low_price ?? h.close_price,
        closePrice: h.close_price,
        volume: h.volume ?? 0,
        valueTrade: h.value_traded ?? undefined,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    priceHistory: data ?? [],
    isLoading,
    error: error?.message,
    refetch,
  };
}
