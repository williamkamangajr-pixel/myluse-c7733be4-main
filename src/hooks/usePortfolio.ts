import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';
import { useStocks } from './useStocks';
import type { Portfolio, PortfolioHolding, PortfolioSummary } from '@/types';

// Map snake_case DB columns to camelCase
function mapPortfolio(row: Record<string, unknown>): Portfolio {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    name: row.name as string,
    description: row.description as string | null,
    isDefault: row.is_default as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapHolding(row: Record<string, unknown>): PortfolioHolding {
  return {
    id: row.id as string,
    portfolioId: row.portfolio_id as string,
    stockTicker: row.stock_ticker as string,
    sharesOwned: Number(row.shares_owned),
    purchasePrice: Number(row.purchase_price),
    purchaseDate: row.purchase_date as string,
    tradeType: row.trade_type as PortfolioHolding['tradeType'],
    status: row.status as PortfolioHolding['status'],
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

async function fetchOrCreatePortfolio(sessionId: string): Promise<Portfolio> {
  // Try to fetch existing default portfolio
  const { data: existingPortfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_default', true)
    .single();

  if (existingPortfolio) {
    return mapPortfolio(existingPortfolio as Record<string, unknown>);
  }

  // Create new default portfolio
  const { data: newPortfolio, error: createError } = await supabase
    .from('portfolios')
    .insert({
      session_id: sessionId,
      name: 'My Portfolio',
      is_default: true,
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create portfolio: ${createError.message}`);
  }

  return mapPortfolio(newPortfolio as Record<string, unknown>);
}

async function fetchHoldings(portfolioId: string): Promise<PortfolioHolding[]> {
  const { data, error } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching holdings:', error);
    return [];
  }

  return (data || []).map(row => mapHolding(row as Record<string, unknown>));
}

export function usePortfolio() {
  const { sessionId, isReady } = useSession();
  const { stocks } = useStocks();
  const queryClient = useQueryClient();

  const portfolioQuery = useQuery({
    queryKey: ['portfolio', sessionId],
    queryFn: () => fetchOrCreatePortfolio(sessionId!),
    enabled: isReady && !!sessionId,
    staleTime: 1000 * 60, // 1 minute
  });

  const holdingsQuery = useQuery({
    queryKey: ['portfolio-holdings', portfolioQuery.data?.id],
    queryFn: () => fetchHoldings(portfolioQuery.data!.id),
    enabled: !!portfolioQuery.data?.id,
    staleTime: 1000 * 60, // 1 minute
  });

  // Calculate holdings with current values
  const holdingsWithValues = (holdingsQuery.data || []).map(holding => {
    const stock = stocks.find(s => s.ticker === holding.stockTicker);
    const currentPrice = stock?.currentPrice || holding.purchasePrice;
    const currentValue = holding.sharesOwned * currentPrice;
    const costBasis = holding.sharesOwned * holding.purchasePrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return {
      ...holding,
      stock,
      currentValue,
      gainLoss,
      gainLossPercent,
    };
  });

  // Aggregate by ticker for summary
  const aggregatedHoldings = holdingsWithValues.reduce((acc, holding) => {
    const existing = acc.find(h => h.stockTicker === holding.stockTicker);
    if (existing) {
      existing.sharesOwned += holding.sharesOwned;
      existing.currentValue = (existing.currentValue || 0) + (holding.currentValue || 0);
    } else {
      acc.push({ ...holding });
    }
    return acc;
  }, [] as typeof holdingsWithValues);

  // Calculate summary
  const summary: PortfolioSummary = {
    totalValue: aggregatedHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0),
    totalCost: holdingsWithValues.reduce((sum, h) => sum + h.sharesOwned * h.purchasePrice, 0),
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    holdingsCount: aggregatedHoldings.length,
  };

  summary.totalGainLoss = summary.totalValue - summary.totalCost;
  summary.totalGainLossPercent = summary.totalCost > 0 
    ? (summary.totalGainLoss / summary.totalCost) * 100 
    : 0;

  // Calculate daily change based on stock changes
  summary.dailyChange = aggregatedHoldings.reduce((sum, h) => {
    if (h.stock) {
      return sum + (h.sharesOwned * h.stock.change);
    }
    return sum;
  }, 0);

  summary.dailyChangePercent = summary.totalValue > 0
    ? (summary.dailyChange / (summary.totalValue - summary.dailyChange)) * 100
    : 0;

  const addHoldingMutation = useMutation({
    mutationFn: async (holding: {
      stockTicker: string;
      sharesOwned: number;
      purchasePrice: number;
      tradeType: 'buy' | 'sell';
    }) => {
      if (!portfolioQuery.data) throw new Error('Portfolio not found');

      const { error } = await supabase
        .from('portfolio_holdings')
        .insert({
          portfolio_id: portfolioQuery.data.id,
          stock_ticker: holding.stockTicker,
          shares_owned: holding.sharesOwned,
          purchase_price: holding.purchasePrice,
          trade_type: holding.tradeType,
          status: 'completed',
        });

      if (error) throw new Error(`Failed to add holding: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-holdings'] });
    },
  });

  const removeHoldingMutation = useMutation({
    mutationFn: async (holdingId: string) => {
      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', holdingId);

      if (error) throw new Error(`Failed to remove holding: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-holdings'] });
    },
  });

  return {
    portfolio: portfolioQuery.data || null,
    holdings: aggregatedHoldings,
    rawHoldings: holdingsWithValues,
    summary,
    isLoading: portfolioQuery.isLoading || holdingsQuery.isLoading,
    error: portfolioQuery.error?.message || holdingsQuery.error?.message || null,
    addHolding: addHoldingMutation.mutate,
    removeHolding: removeHoldingMutation.mutate,
    isAddingHolding: addHoldingMutation.isPending,
    isRemovingHolding: removeHoldingMutation.isPending,
  };
}
