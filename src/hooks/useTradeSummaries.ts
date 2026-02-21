import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TradeSummary } from '@/lib/types';

export function useTradeSummaries(ticker?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trade-summaries', ticker],
    queryFn: async (): Promise<TradeSummary[]> => {
      if (!ticker) return [];

      const { data: summaries, error } = await supabase
        .from('stock_trade_summaries')
        .select('*')
        .eq('stock_ticker', ticker)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching trade summaries:', error);
        return [];
      }

      return summaries.map((s) => ({
        id: s.id,
        stockTicker: s.stock_ticker,
        date: s.date,
        openingPrice: s.opening_price,
        closingPrice: s.closing_price,
        highPrice: s.high_price,
        lowPrice: s.low_price,
        volumeTraded: s.volume_traded,
        valueTraded: s.value_traded,
        tradesCount: s.trades_count,
      }));
    },
    enabled: !!ticker,
    staleTime: 1000 * 60 * 5,
  });

  return {
    summaries: data ?? [],
    isLoading,
    error: error?.message,
    refetch,
  };
}
