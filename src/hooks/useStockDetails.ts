import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockDetails } from '@/lib/types';

// Generate mock financial data
function generateMockFinancials() {
  const years = ['2020', '2021', '2022', '2023', '2024'];
  return {
    revenue: years.map((year, i) => ({
      year,
      value: Math.round((1 + i * 0.15 + Math.random() * 0.1) * 500000000),
    })),
    earnings: years.map((year, i) => ({
      year,
      value: Math.round((1 + i * 0.12 + Math.random() * 0.2) * 50000000),
    })),
    assets: years.map((year, i) => ({
      year,
      value: Math.round((1 + i * 0.08 + Math.random() * 0.05) * 1000000000),
    })),
  };
}

// Generate mock price history
function generateMockPriceHistory(currentPrice: number) {
  const history: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> = [];
  const today = new Date();
  let price = currentPrice * 0.85;

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.45) * (price * 0.03);
    price = Math.max(price * 0.7, Math.min(price * 1.3, price + change));

    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);

    history.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(price * 100) / 100,
      volume: Math.round(Math.random() * 500000 + 100000),
    });
  }

  return history;
}

// Generate snowflake metrics
function generateMockMetrics() {
  return {
    value: Math.round(Math.random() * 40 + 30),
    growth: Math.round(Math.random() * 40 + 25),
    health: Math.round(Math.random() * 30 + 50),
    dividends: Math.round(Math.random() * 40 + 20),
    performance: Math.round(Math.random() * 40 + 35),
  };
}

export function useStockDetails(stockId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-details', stockId],
    queryFn: async (): Promise<StockDetails | null> => {
      if (!stockId) return null;

      const { data: stock, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('id', stockId)
        .single();

      if (error || !stock) {
        console.error('Error fetching stock details:', error);
        return null;
      }

      const stockDetails: StockDetails = {
        id: stock.id,
        ticker: stock.ticker,
        name: stock.name,
        sector: stock.sector ?? 'Unknown',
        currentPrice: stock.current_price,
        previousClose: stock.previous_close ?? stock.current_price,
        change: stock.change ?? 0,
        changePercent: stock.change_percent ?? 0,
        volume: stock.volume ?? 0,
        marketCap: stock.market_cap ?? 0,
        high52w: stock.high_52w ?? stock.current_price * 1.2,
        low52w: stock.low_52w ?? stock.current_price * 0.8,
        peRatio: stock.pe_ratio,
        eps: stock.eps,
        dividendYield: stock.dividend_yield,
        description: stock.description ?? undefined,
        logoUrl: stock.logo_url ?? undefined,
        website: stock.website ?? undefined,
        headquarters: stock.headquarters ?? undefined,
        employees: stock.employees ?? undefined,
        foundedYear: stock.founded_year ?? undefined,
        priceHistory: generateMockPriceHistory(stock.current_price),
        metrics: generateMockMetrics(),
        financials: generateMockFinancials(),
      };

      return stockDetails;
    },
    enabled: !!stockId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    stockDetails: data ?? null,
    isLoading,
    error: error?.message,
    refetch,
  };
}
