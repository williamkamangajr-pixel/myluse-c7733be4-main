import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LASIHistory, MarketSummary } from '@/lib/types';

// Generate mock LASI history
function generateMockLASIHistory(): LASIHistory[] {
  const history: LASIHistory[] = [];
  const today = new Date();
  let value = 7200;

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * 50;
    value = Math.max(6500, Math.min(8000, value + change));
    const changePercent = (change / value) * 100;

    history.push({
      id: `lasi-${i}`,
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.round(Math.random() * 5000000 + 1000000),
      valueTraded: Math.round(Math.random() * 50000000 + 10000000),
    });
  }

  return history;
}

const mockLASIHistory = generateMockLASIHistory();

export function useLASI() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lasi-history'],
    queryFn: async () => {
      const { data: history, error: historyError } = await supabase
        .from('lasi_history')
        .select('*')
        .order('date', { ascending: true })
        .limit(90);

      if (historyError) {
        console.error('Error fetching LASI history:', historyError);
        return { history: mockLASIHistory, current: null };
      }

      const { data: summary } = await supabase
        .from('market_summary')
        .select('*')
        .single();

      const mappedHistory: LASIHistory[] = (history && history.length > 0 ? history : mockLASIHistory).map((h: any) => ({
        id: h.id,
        date: h.date,
        value: h.value,
        change: h.change,
        changePercent: h.change_percent,
        volume: h.volume,
        valueTraded: h.value_traded,
      }));

      const current: MarketSummary | null = summary
        ? {
            indexName: summary.index_name,
            indexValue: summary.index_value,
            indexChange: summary.index_change ?? 0,
            indexChangePercent: summary.index_change_percent ?? 0,
            totalVolume: summary.total_volume ?? 0,
            totalValueTraded: summary.total_value_traded ?? 0,
            advancingStocks: summary.advancing_stocks ?? 0,
            decliningStocks: summary.declining_stocks ?? 0,
            unchangedStocks: summary.unchanged_stocks ?? 0,
            marketStatus: (summary.market_status as any) ?? 'closed',
            lastUpdated: summary.last_updated,
          }
        : null;

      return { history: mappedHistory, current };
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    history: data?.history ?? mockLASIHistory,
    current: data?.current,
    isLoading,
    error: error?.message,
    refetch,
  };
}
