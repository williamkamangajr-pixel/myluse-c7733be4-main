import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';
import { useBonds } from './useBonds';
import { BondHolding, BondSummary } from '@/lib/types';

export function useBondPortfolio() {
  const { sessionId } = useSession();
  const { bonds } = useBonds();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bond-portfolio', sessionId],
    queryFn: async (): Promise<BondHolding[]> => {
      // First get the user's portfolio
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('session_id', sessionId)
        .limit(1);

      if (!portfolios || portfolios.length === 0) {
        return [];
      }

      const portfolioId = portfolios[0].id;

      // Get bond holdings
      const { data: holdings, error } = await supabase
        .from('portfolio_bond_holdings')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bond holdings:', error);
        return [];
      }

      return holdings.map((h) => {
        const bond = bonds.find((b) => b.ticker === h.bond_ticker);
        const currentPrice = bond?.currentPrice ?? h.purchase_price;
        const currentValue = h.units * currentPrice;
        const totalCost = h.units * h.purchase_price;
        const totalReturn = currentValue - totalCost;
        const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

        return {
          id: h.id,
          portfolioId: h.portfolio_id,
          bondTicker: h.bond_ticker,
          bondName: bond?.name,
          units: h.units,
          purchasePrice: h.purchase_price,
          purchaseDate: h.purchase_date,
          status: 'executed' as const,
          couponRate: bond?.couponRate ?? undefined,
          maturityDate: bond?.maturityDate ?? undefined,
          currentPrice,
          currentValue,
          totalReturn,
          totalReturnPercent,
        };
      });
    },
    enabled: !!sessionId,
  });

  const bondHoldings = data ?? [];

  // Calculate summary
  const bondSummary: BondSummary = bondHoldings.reduce(
    (acc, h) => {
      if (h.status === 'executed') {
        acc.totalValue += h.currentValue ?? 0;
        acc.totalCost += h.units * h.purchasePrice;
      }
      return acc;
    },
    { totalValue: 0, totalCost: 0, totalReturn: 0, totalReturnPercent: 0 }
  );
  bondSummary.totalReturn = bondSummary.totalValue - bondSummary.totalCost;
  bondSummary.totalReturnPercent =
    bondSummary.totalCost > 0 ? (bondSummary.totalReturn / bondSummary.totalCost) * 100 : 0;

  // Add bond holding mutation
  const addBondHolding = useMutation({
    mutationFn: async (params: {
      bondTicker: string;
      units: number;
      purchasePrice: number;
    }) => {
      // Get or create portfolio
      let { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('session_id', sessionId)
        .limit(1);

      let portfolioId: string;
      if (!portfolios || portfolios.length === 0) {
        const { data: newPortfolio, error } = await supabase
          .from('portfolios')
          .insert({ session_id: sessionId, name: 'My Portfolio' })
          .select()
          .single();
        if (error) throw error;
        portfolioId = newPortfolio.id;
      } else {
        portfolioId = portfolios[0].id;
      }

      // Add the holding
      const { error } = await supabase.from('portfolio_bond_holdings').insert({
        portfolio_id: portfolioId,
        bond_ticker: params.bondTicker,
        units: params.units,
        purchase_price: params.purchasePrice,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bond-portfolio'] });
    },
  });

  return {
    bondHoldings,
    bondSummary,
    isLoading,
    error: error?.message,
    refetch,
    addBondHolding: addBondHolding.mutateAsync,
  };
}
