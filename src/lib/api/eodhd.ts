import { supabase } from '@/integrations/supabase/client';

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close?: number;
  // Aliased fields for frontend compatibility
  price?: number;
  previousClose?: number;
}

export interface StockDataResponse {
  success: boolean;
  data?: StockDataPoint[];
  error?: string;
  source?: 'realtime' | 'eod' | 'firecrawl' | 'database';
  ticker?: string;
  currency?: 'ZMW';
}

export const eodhdApi = {
  // Get stock data with real-time fallback to EOD, then Firecrawl
  async getStockData(ticker: string, period: TimePeriod = '1D', useRealtime = true): Promise<StockDataResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('eodhd-stock-data', {
        body: { ticker, period, useRealtime },
      });

      if (error) {
        console.error('Edge function error:', error);
        return { success: false, error: error.message, currency: 'ZMW' };
      }

      if (!data.success) {
        return { success: false, error: data.error, currency: 'ZMW' };
      }

      // Transform EODHD response to our format with field aliases
      const transformedData: StockDataPoint[] = Array.isArray(data.data) 
        ? data.data.map((point: any) => ({
            date: point.date,
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close,
            volume: point.volume,
            adjusted_close: point.adjusted_close,
            // Add aliased fields for frontend compatibility
            price: point.close,
            previousClose: point.previousClose || point.adjusted_close || point.close,
          }))
        : [];

      return { 
        success: true, 
        data: transformedData,
        source: data.source,
        ticker: data.ticker,
        currency: 'ZMW'
      };
    } catch (error) {
      console.error('Error calling EODHD API:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch stock data',
        currency: 'ZMW'
      };
    }
  },

  // Get real-time quote for live dashboard
  async getRealTimeQuote(ticker: string): Promise<StockDataResponse> {
    return this.getStockData(ticker, '1D', true);
  },

  // Get EOD data only (no real-time)
  async getEODData(ticker: string, period: TimePeriod = '1M'): Promise<StockDataResponse> {
    return this.getStockData(ticker, period, false);
  },

  // Legacy method for compatibility
  async getQuote(ticker: string): Promise<StockDataResponse> {
    return this.getRealTimeQuote(ticker);
  },

  // Get current price from combined fetcher (EODHD + Firecrawl fallback)
  async getCurrentPrice(ticker: string): Promise<{ price: number; previousClose: number; source: string } | null> {
    try {
      const result = await this.getStockData(ticker, '1D', true);
      
      if (result.success && result.data && result.data.length > 0) {
        const latestPoint = result.data[result.data.length - 1];
        return {
          price: latestPoint.close,
          previousClose: latestPoint.previousClose || latestPoint.close,
          source: result.source || 'unknown',
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current price:', error);
      return null;
    }
  },
};
