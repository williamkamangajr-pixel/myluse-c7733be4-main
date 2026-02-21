import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { luseApi } from '@/lib/api/luse';
import { mockStocks, mockMarketSummary } from '@/lib/mockData';
import type { Stock, MarketSummary } from '@/types';

// Map snake_case DB columns to camelCase
function mapStock(row: Record<string, unknown>): Stock {
  return {
    id: row.id as string,
    ticker: row.ticker as string,
    name: row.name as string,
    sector: row.sector as string | null,
    currentPrice: Number(row.current_price),
    previousClose: row.previous_close ? Number(row.previous_close) : null,
    change: Number(row.change || 0),
    changePercent: Number(row.change_percent || 0),
    volume: Number(row.volume || 0),
    marketCap: row.market_cap ? Number(row.market_cap) : null,
    high52w: row.high_52w ? Number(row.high_52w) : null,
    low52w: row.low_52w ? Number(row.low_52w) : null,
    peRatio: row.pe_ratio ? Number(row.pe_ratio) : null,
    eps: row.eps ? Number(row.eps) : null,
    dividendYield: row.dividend_yield ? Number(row.dividend_yield) : null,
    logoUrl: row.logo_url as string | null,
    description: row.description as string | null,
    website: row.website as string | null,
    foundedYear: row.founded_year as number | null,
    employees: row.employees as number | null,
    headquarters: row.headquarters as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapMarketSummary(row: Record<string, unknown>): MarketSummary {
  return {
    id: row.id as string,
    indexName: row.index_name as string,
    indexValue: Number(row.index_value),
    indexChange: Number(row.index_change || 0),
    indexChangePercent: Number(row.index_change_percent || 0),
    marketStatus: row.market_status as MarketSummary['marketStatus'],
    totalVolume: Number(row.total_volume || 0),
    totalValueTraded: Number(row.total_value_traded || 0),
    advancingStocks: Number(row.advancing_stocks || 0),
    decliningStocks: Number(row.declining_stocks || 0),
    unchangedStocks: Number(row.unchanged_stocks || 0),
    lastUpdated: row.last_updated as string,
  };
}

async function fetchStocks(): Promise<Stock[]> {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .order('ticker');

  if (error) {
    console.error('Error fetching stocks:', error);
    return mockStocks;
  }

  if (!data || data.length === 0) {
    return mockStocks;
  }

  return data.map(row => mapStock(row as Record<string, unknown>));
}

async function fetchMarketSummary(): Promise<MarketSummary> {
  const { data, error } = await supabase
    .from('market_summary')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching market summary:', error);
    return mockMarketSummary;
  }

  if (!data) {
    return mockMarketSummary;
  }

  return mapMarketSummary(data as Record<string, unknown>);
}

// Auto-sync prices from LuSE on first load
async function syncLuSEPrices(): Promise<void> {
  try {
    const result = await luseApi.syncPrices();
    if (result.success) {
      console.log(`Auto-synced ${result.updated} stock prices from LuSE`);
    }
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
}

export function useStocks() {
  const queryClient = useQueryClient();

  // Auto-sync LuSE prices on first mount
  useEffect(() => {
    const hasAutoSynced = sessionStorage.getItem('luse-auto-synced');
    if (!hasAutoSynced) {
      sessionStorage.setItem('luse-auto-synced', 'true');
      syncLuSEPrices().then(() => {
        // Refresh queries after sync
        queryClient.invalidateQueries({ queryKey: ['stocks'] });
        queryClient.invalidateQueries({ queryKey: ['market-summary'] });
      });
    }
  }, [queryClient]);

  const stocksQuery = useQuery({
    queryKey: ['stocks'],
    queryFn: fetchStocks,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const summaryQuery = useQuery({
    queryKey: ['market-summary'],
    queryFn: fetchMarketSummary,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const refreshData = async () => {
    await Promise.all([
      stocksQuery.refetch(),
      summaryQuery.refetch(),
    ]);
  };

  return {
    stocks: stocksQuery.data || mockStocks,
    marketSummary: summaryQuery.data || mockMarketSummary,
    isLoading: stocksQuery.isLoading || summaryQuery.isLoading,
    isFetching: stocksQuery.isFetching || summaryQuery.isFetching,
    error: stocksQuery.error?.message || summaryQuery.error?.message || null,
    refreshData,
    isRefreshing: stocksQuery.isFetching || summaryQuery.isFetching,
  };
}

export function useStock(ticker: string) {
  const { stocks, isLoading, error } = useStocks();
  
  const stock = stocks.find(s => s.ticker === ticker) || null;

  return {
    stock,
    isLoading,
    error,
  };
}
