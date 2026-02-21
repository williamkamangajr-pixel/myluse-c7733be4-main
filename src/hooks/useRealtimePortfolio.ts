import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimePortfolio(portfolioId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!portfolioId) return;

    // Subscribe to portfolio holdings changes
    const channel = supabase
      .channel(`portfolio-${portfolioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_holdings',
          filter: `portfolio_id=eq.${portfolioId}`,
        },
        () => {
          // Invalidate portfolio queries to refetch
          queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_bond_holdings',
          filter: `portfolio_id=eq.${portfolioId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bond-portfolio'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [portfolioId, queryClient]);
}
