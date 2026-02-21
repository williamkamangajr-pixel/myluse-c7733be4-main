import { supabase } from '@/integrations/supabase/client';

export interface LuSEStockPrice {
  ticker: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

export interface LuSEMarketSummary {
  indexValue: number;
  indexChange: number;
  indexChangePercent: number;
  totalVolume: number;
  totalValueTraded: number;
  advancingStocks: number;
  decliningStocks: number;
  unchangedStocks: number;
  marketStatus: string;
}

export interface LuSEResponse {
  success: boolean;
  stocks?: LuSEStockPrice[];
  marketSummary?: LuSEMarketSummary;
  lastUpdated?: string;
  error?: string;
}

export const luseApi = {
  /**
   * Fetch real-time stock prices from LuSE using Firecrawl (primary) with combined fetcher fallback
   * All prices are returned in ZMW (Zambian Kwacha)
   */
  async fetchPrices(): Promise<LuSEResponse> {
    try {
      // Primary: Use the luse-price-scraper which has proven reliable
      const { data, error } = await supabase.functions.invoke('luse-price-scraper');

      if (error) {
        console.error('LuSE scraper error:', error);
        return { success: false, error: error.message };
      }

      // Ensure all stocks have ZMW currency explicitly set
      if (data && data.stocks) {
        data.stocks = data.stocks.map((stock: any) => ({
          ...stock,
          currency: 'ZMW',
        }));
      }

      return data as LuSEResponse;
    } catch (error) {
      console.error('Error fetching LuSE prices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prices',
      };
    }
  },

  /**
   * Update stock prices in the database with real LuSE data
   */
  async syncPrices(): Promise<{ success: boolean; updated: number; error?: string }> {
    try {
      const priceData = await this.fetchPrices();
      
      if (!priceData.success || !priceData.stocks) {
        return { success: false, updated: 0, error: priceData.error };
      }

      let updated = 0;

      // Update each stock in the database
      for (const stock of priceData.stocks) {
        const { error } = await supabase
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

        if (!error) {
          updated++;
        } else {
          console.error(`Failed to update ${stock.ticker}:`, error);
        }
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

      return { success: true, updated };
    } catch (error) {
      console.error('Error syncing LuSE prices:', error);
      return {
        success: false,
        updated: 0,
        error: error instanceof Error ? error.message : 'Failed to sync prices',
      };
    }
  },
};
