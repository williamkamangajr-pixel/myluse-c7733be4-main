import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';
import { usePortfolio } from './usePortfolio';
import { useStocks } from './useStocks';
import { PortfolioDividend, DividendSummary, DividendHistory } from '@/lib/types';

export function useDividends() {
  const { sessionId } = useSession();
  const { holdings, summary } = usePortfolio();
  const { stocks } = useStocks();

  // Fetch dividend history from database
  const { data: dividendHistory, isLoading: historyLoading, refetch } = useQuery({
    queryKey: ['dividend-history'],
    queryFn: async (): Promise<DividendHistory[]> => {
      const { data, error } = await supabase
        .from('dividend_history')
        .select('*')
        .order('ex_dividend_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching dividend history:', error);
        return [];
      }

      return data.map((d) => ({
        id: d.id,
        stockTicker: d.stock_ticker,
        dividendPerShare: d.dividend_per_share,
        exDividendDate: d.ex_dividend_date,
        recordDate: d.record_date,
        paymentDate: d.payment_date,
        dividendType: d.dividend_type,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });

  // Calculate portfolio dividends based on holdings
  const portfolioDividends: PortfolioDividend[] = (holdings || [])
    .map((holding) => {
      const stock = stocks.find((s) => s.ticker === holding.stockTicker);
      const dividendYield = stock?.dividendYield ?? 0;
      const currentValue = holding.currentValue ?? holding.sharesOwned * (stock?.currentPrice ?? holding.purchasePrice);
      const annualDividendTotal = currentValue * (dividendYield / 100);

      return {
        stockTicker: holding.stockTicker,
        stockName: stock?.name ?? holding.stockTicker,
        sharesOwned: holding.sharesOwned,
        dividendYield,
        annualDividendTotal,
      };
    })
    .filter((d) => d.dividendYield > 0);

  // Calculate summary
  const totalAnnualIncome = portfolioDividends.reduce((sum, d) => sum + d.annualDividendTotal, 0);
  const portfolioValue = summary?.totalValue ?? 0;
  const portfolioYield = portfolioValue > 0 ? (totalAnnualIncome / portfolioValue) * 100 : 0;
  const averageYield =
    portfolioDividends.length > 0
      ? portfolioDividends.reduce((sum, d) => sum + d.dividendYield, 0) / portfolioDividends.length
      : 0;

  const dividendSummary: DividendSummary = {
    totalAnnualIncome,
    portfolioYield,
    averageYield,
  };

  return {
    portfolioDividends,
    dividendSummary,
    dividendHistory: dividendHistory ?? [],
    isLoading: historyLoading,
    refetch,
  };
}
