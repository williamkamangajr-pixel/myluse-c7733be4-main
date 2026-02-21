import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { luseApi, LuSEResponse, LuSEStockPrice } from '@/lib/api/luse';
import { eodhdApi, StockDataResponse } from '@/lib/api/eodhd';
import { supabase } from '@/integrations/supabase/client';

// Auto-sync interval: 5 minutes
const AUTO_SYNC_INTERVAL_MS = 1000 * 60 * 5;

export function useLuSEPrices() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const hasSyncedRef = useRef(false);

  const { data, isLoading, error, refetch } = useQuery<LuSEResponse>({
    queryKey: ['luse-prices'],
    queryFn: async () => {
      // Fetch from the combined fetcher (tries EODHD first, falls back to Firecrawl)
      const luseData = await luseApi.fetchPrices();
      
      // If fetch succeeds, sync to database silently
      if (luseData.success && luseData.stocks && luseData.stocks.length > 0) {
        await syncToDatabase(luseData);
      }
      
      return luseData;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: AUTO_SYNC_INTERVAL_MS, // Auto-refresh every 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Sync fetched data to database
  const syncToDatabase = async (priceData: LuSEResponse) => {
    if (!priceData.stocks) return;

    try {
      // Update each stock in the database
      for (const stock of priceData.stocks) {
        await supabase
          .from('stocks')
          .update({
            current_price: stock.currentPrice,
            previous_close: stock.previousClose,
            change: stock.change,
            change_percent: stock.changePercent,
            volume: stock.volume,
            updated_at: new Date().toISOString(),
          })
          .eq('ticker', stock.ticker);
      }

      // Update market summary if available
      if (priceData.marketSummary) {
        await supabase
          .from('market_summary')
          .update({
            index_value: priceData.marketSummary.indexValue,
            index_change: priceData.marketSummary.indexChange,
            index_change_percent: priceData.marketSummary.indexChangePercent,
            total_volume: priceData.marketSummary.totalVolume,
            total_value_traded: priceData.marketSummary.totalValueTraded,
            advancing_stocks: priceData.marketSummary.advancingStocks,
            declining_stocks: priceData.marketSummary.decliningStocks,
            unchanged_stocks: priceData.marketSummary.unchangedStocks,
            market_status: priceData.marketSummary.marketStatus,
            last_updated: new Date().toISOString(),
          })
          .eq('index_name', 'LASI');
      }

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['market-summary'] });
    } catch (error) {
      console.error('Error syncing to database:', error);
    }
  };

  // Fetch EODHD data for a specific stock (for charts)
  const fetchEODHDData = useCallback(async (ticker: string, period: '1D' | '1W' | '1M' | '3M' | '1Y' = '1M') => {
    try {
      const result = await eodhdApi.getStockData(ticker, period, true);
      return result;
    } catch (error) {
      console.error('Error fetching EODHD data:', error);
      return { success: false, data: [], currency: 'ZMW' as const };
    }
  }, []);

  // Auto-sync on mount
  useEffect(() => {
    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true;
      // Trigger initial fetch
      refetch();
    }
  }, [refetch]);

  // Transform stock data to ensure ZMW currency
  const transformedPrices: LuSEStockPrice[] = (data?.stocks || []).map(stock => ({
    ...stock,
    currency: 'ZMW',
    high: stock.currentPrice, // Use current price as placeholder if no high/low
    low: stock.currentPrice,
    open: stock.previousClose,
  }));

  return {
    prices: transformedPrices,
    marketSummary: data?.marketSummary,
    lastUpdated: data?.lastUpdated,
    isLoading: isLoading || isSyncing,
    isSyncing,
    error: error?.message || data?.error,
    fetchPrices: refetch,
    fetchEODHDData,
  };
}

// Hook specifically for chart data from EODHD
export function useStockChartData(ticker: string, period: '1D' | '1W' | '1M' | '3M' | '1Y' = '1M') {
  const { data, isLoading, error, refetch } = useQuery<StockDataResponse>({
    queryKey: ['stock-chart', ticker, period],
    queryFn: async () => {
      const result = await eodhdApi.getStockData(ticker, period, true);
      
      // If EODHD fails, try to get last known price from database
      if (!result.success || !result.data || result.data.length === 0) {
        console.log(`[Chart] EODHD failed for ${ticker}, checking database...`);
        
        const { data: stockData } = await supabase
          .from('stocks')
          .select('current_price, previous_close, updated_at')
          .eq('ticker', ticker)
          .single();
        
        if (stockData && stockData.current_price > 0) {
          // Generate synthetic chart data from database price
          const now = new Date();
          const syntheticData = [{
            date: now.toISOString().split('T')[0],
            open: stockData.previous_close || stockData.current_price,
            high: stockData.current_price,
            low: stockData.current_price,
            close: stockData.current_price,
            volume: 0,
            price: stockData.current_price,
            previousClose: stockData.previous_close || stockData.current_price,
          }];
          
          return {
            success: true,
            data: syntheticData,
            source: 'database' as const,
            ticker,
            currency: 'ZMW' as const,
          };
        }
      }
      
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!ticker,
    retry: 2,
  });

  // Transform chart data to ensure proper field mapping
  const chartData = (data?.data || []).map(point => ({
    ...point,
    // Ensure price field exists (alias for close)
    price: point.close,
    // Ensure currency context
    currency: 'ZMW',
  }));

  return {
    chartData,
    source: data?.source,
    currency: 'ZMW',
    isLoading,
    error: error?.message || data?.error,
    refetch,
  };
}
