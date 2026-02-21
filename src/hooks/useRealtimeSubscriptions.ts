import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to subscribe to real-time stock price updates
 */
export function useRealtimeStocks() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to stocks table changes
    const stocksChannel = supabase
      .channel('realtime-stocks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stocks',
        },
        () => {
          // Invalidate stocks queries to refetch
          queryClient.invalidateQueries({ queryKey: ['stocks'] });
        }
      )
      .subscribe();

    // Subscribe to market summary changes
    const marketChannel = supabase
      .channel('realtime-market')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_summary',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['market-summary'] });
        }
      )
      .subscribe();

    // Subscribe to price history for charts
    const priceChannel = supabase
      .channel('realtime-prices')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'price_history',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['price-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stocksChannel);
      supabase.removeChannel(marketChannel);
      supabase.removeChannel(priceChannel);
    };
  }, [queryClient]);
}

/**
 * Hook to subscribe to real-time notifications
 */
export function useRealtimeNotifications(sessionId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`notifications-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', sessionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);
}

/**
 * Hook to subscribe to real-time wallet updates
 */
export function useRealtimeWallet(walletId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!walletId) return;

    const channel = supabase
      .channel(`wallet-${walletId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `id=eq.${walletId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `wallet_id=eq.${walletId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletId, queryClient]);
}

/**
 * Hook to subscribe to real-time marketplace updates
 */
export function useRealtimeMarketplace(sessionId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to all marketplace listings (for browse view)
    const listingsChannel = supabase
      .channel('realtime-marketplace-listings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_listings',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
          queryClient.invalidateQueries({ queryKey: ['my-marketplace-listings'] });
        }
      )
      .subscribe();

    // Subscribe to marketplace offers
    const offersChannel = supabase
      .channel('realtime-marketplace-offers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_offers',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['marketplace-offers-received'] });
          queryClient.invalidateQueries({ queryKey: ['my-marketplace-offers'] });
        }
      )
      .subscribe();

    // Subscribe to marketplace transactions
    const transactionsChannel = supabase
      .channel('realtime-marketplace-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_transactions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['marketplace-transactions'] });
          // Also refresh portfolio and wallet as transactions affect them
          queryClient.invalidateQueries({ queryKey: ['portfolio'] });
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [queryClient, sessionId]);
}
