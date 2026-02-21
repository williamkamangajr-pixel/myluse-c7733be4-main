import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWallet } from '@/hooks/useWallet';

export interface MarketplaceListing {
  id: string;
  seller_session_id: string;
  seller_broker_id: string;
  stock_ticker: string;
  quantity: number;
  price_type: 'fixed' | 'open_to_bids';
  asking_price: number | null;
  status: string;
  sell_id: string;
  seller_csd_last4: string;
  reserved_shares: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface MarketplaceOffer {
  id: string;
  listing_id: string;
  buyer_session_id: string;
  buyer_broker_id: string;
  offer_price: number;
  quantity: number;
  status: string;
  buyer_sell_id: string;
  buyer_csd_last4: string;
  created_at: string;
  updated_at: string;
}

// Generate Sell ID: First letter of first name + First letter of last name + last digits of CSD
export function generateSellId(fullName: string | null, csdNumber: string | null): string {
  if (!fullName || !csdNumber) return 'XX0000';
  
  const names = fullName.trim().split(' ');
  const firstInitial = names[0]?.[0]?.toUpperCase() || 'X';
  const lastInitial = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : 'X';
  const csdDigits = csdNumber.replace(/\D/g, '').slice(-4) || '0000';
  
  return `${firstInitial}${lastInitial}${csdDigits}`;
}

// Get last 4 digits of CSD for privacy
export function getCsdLast4(csdNumber: string | null): string {
  if (!csdNumber) return '****';
  return csdNumber.slice(-4);
}

// Calculate PPT tax (Property Transfer Tax)
const PPT_RATE = 0.05; // 5% PPT tax

export function calculatePPT(amount: number): number {
  return amount * PPT_RATE;
}

export function useMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const { holdings } = usePortfolio();
  const { balance, p2pPurchase, p2pSale, refetch: refetchWallet } = useWallet();

  // Fetch all active marketplace listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .in('status', ['active', 'pending_approval'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MarketplaceListing[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user's own listings
  const { data: myListings = [], isLoading: myListingsLoading } = useQuery({
    queryKey: ['my-marketplace-listings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('seller_session_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MarketplaceListing[];
    },
    enabled: !!user,
  });

  // Fetch offers on user's listings
  const { data: offersReceived = [] } = useQuery({
    queryKey: ['marketplace-offers-received', user?.id],
    queryFn: async () => {
      if (!user || myListings.length === 0) return [];
      
      const listingIds = myListings.map(l => l.id);
      const { data, error } = await supabase
        .from('marketplace_offers')
        .select('*')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MarketplaceOffer[];
    },
    enabled: !!user && myListings.length > 0,
  });

  // Fetch user's submitted offers
  const { data: myOffers = [] } = useQuery({
    queryKey: ['my-marketplace-offers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('marketplace_offers')
        .select('*')
        .eq('buyer_session_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MarketplaceOffer[];
    },
    enabled: !!user,
  });

  // Get available shares for a stock (owned - already listed)
  const getAvailableShares = useCallback((stockTicker: string): number => {
    if (!holdings) return 0;
    
    // Holdings from usePortfolio are already filtered by status='completed'
    const owned = holdings
      .filter(h => h.stockTicker === stockTicker)
      .reduce((sum, h) => sum + h.sharesOwned, 0);
    
    const listed = myListings
      .filter(l => l.stock_ticker === stockTicker && ['active', 'pending_approval'].includes(l.status))
      .reduce((sum, l) => sum + l.quantity, 0);
    
    return Math.max(0, owned - listed);
  }, [holdings, myListings]);

  // Create a new listing
  const createListing = useMutation({
    mutationFn: async (params: {
      stockTicker: string;
      quantity: number;
      priceType: 'fixed' | 'open_to_bids';
      askingPrice?: number;
      notes?: string;
    }) => {
      if (!user || !profile) throw new Error('Not authenticated');
      
      // Validate available shares
      const available = getAvailableShares(params.stockTicker);
      if (params.quantity > available) {
        throw new Error(`Cannot list ${params.quantity} shares. Only ${available} available.`);
      }

      const sellId = generateSellId(profile.fullName, profile.csdNumber || null);
      const csdLast4 = getCsdLast4(profile.csdNumber || null);

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          seller_session_id: user.id,
          seller_broker_id: profile.selectedBrokerId || '',
          stock_ticker: params.stockTicker,
          quantity: params.quantity,
          price_type: params.priceType,
          asking_price: params.askingPrice || null,
          sell_id: sellId,
          seller_csd_last4: csdLast4,
          notes: params.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for seller's broker
      await supabase.from('notifications').insert({
        session_id: profile.selectedBrokerId || '',
        title: 'Client Listing Created',
        message: `Your client (${sellId}) is selling ${params.quantity} shares of ${params.stockTicker} at ${params.priceType === 'fixed' ? `K${params.askingPrice}` : 'open to bids'}.`,
        type: 'info',
        action_url: '/marketplace',
      });

      // Log audit
      await supabase.from('marketplace_audit_log').insert({
        entity_type: 'listing',
        entity_id: data.id,
        action_type: 'created',
        performed_by: user.id,
        performed_by_type: 'user',
        broker_id: profile.selectedBrokerId,
        new_value: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-listings'] });
      toast({
        title: 'Listing Created',
        description: 'Your shares are now listed on the marketplace.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create listing',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit an offer on a listing
  const submitOffer = useMutation({
    mutationFn: async (params: {
      listingId: string;
      offerPrice: number;
      quantity: number;
    }) => {
      if (!user || !profile) throw new Error('Not authenticated');

      const sellId = generateSellId(profile.fullName, profile.csdNumber || null);
      const csdLast4 = getCsdLast4(profile.csdNumber || null);

      const { data, error } = await supabase
        .from('marketplace_offers')
        .insert({
          listing_id: params.listingId,
          buyer_session_id: user.id,
          buyer_broker_id: profile.selectedBrokerId || '',
          offer_price: params.offerPrice,
          quantity: params.quantity,
          buyer_sell_id: sellId,
          buyer_csd_last4: csdLast4,
        })
        .select()
        .single();

      if (error) throw error;

      // Get the listing details
      const { data: listing } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', params.listingId)
        .single();

      if (listing) {
        // Notify buyer's broker
        await supabase.from('notifications').insert({
          session_id: profile.selectedBrokerId || '',
          title: 'Client Offer Submitted',
          message: `Your client (${sellId}) has offered K${params.offerPrice} for ${params.quantity} shares of ${listing.stock_ticker} from seller ${listing.sell_id}.`,
          type: 'info',
          action_url: '/marketplace',
        });

        // Notify seller's broker
        await supabase.from('notifications').insert({
          session_id: listing.seller_broker_id,
          title: 'New Offer Received',
          message: `Buyer ${sellId} (client of ${profile.selectedBrokerId}) has offered K${params.offerPrice} for ${params.quantity} shares of ${listing.stock_ticker} from your client ${listing.sell_id}.`,
          type: 'info',
          action_url: '/marketplace',
        });
      }

      // Log audit
      await supabase.from('marketplace_audit_log').insert({
        entity_type: 'offer',
        entity_id: data.id,
        action_type: 'created',
        performed_by: user.id,
        performed_by_type: 'user',
        broker_id: profile.selectedBrokerId,
        new_value: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-offers-received'] });
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-offers'] });
      toast({
        title: 'Offer Submitted',
        description: 'Your offer has been sent to the seller for review.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit offer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Buy at fixed price with balance check
  const buyAtFixedPrice = useMutation({
    mutationFn: async (params: { listingId: string; quantity: number }) => {
      if (!user || !profile) throw new Error('Not authenticated');

      const { data: listing, error: listingError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', params.listingId)
        .single();

      if (listingError || !listing) throw new Error('Listing not found');
      if (listing.price_type !== 'fixed') throw new Error('This listing is open to bids');
      if (!listing.asking_price) throw new Error('No asking price set');
      if (params.quantity > listing.quantity) throw new Error('Requested quantity exceeds available');

      const subtotal = params.quantity * listing.asking_price;
      const pptTax = calculatePPT(subtotal);
      const totalAmount = subtotal + pptTax;
      const sellerReceives = subtotal - pptTax;

      // CHECK BUYER'S BALANCE - Critical constraint
      if (balance < totalAmount) {
        throw new Error(`Insufficient balance. You need K${totalAmount.toFixed(2)} but have K${balance.toFixed(2)}`);
      }

      const sellId = generateSellId(profile.fullName, profile.csdNumber || null);
      const csdLast4 = getCsdLast4(profile.csdNumber || null);

      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from('marketplace_transactions')
        .insert({
          listing_id: params.listingId,
          seller_session_id: listing.seller_session_id,
          buyer_session_id: user.id,
          seller_broker_id: listing.seller_broker_id,
          buyer_broker_id: profile.selectedBrokerId || '',
          stock_ticker: listing.stock_ticker,
          quantity: params.quantity,
          price_per_share: listing.asking_price,
          subtotal,
          ppt_tax: pptTax,
          total_amount: totalAmount,
          seller_receives: sellerReceives,
        })
        .select()
        .single();

      if (txError) throw txError;

      // DEBIT BUYER'S WALLET - Insert ledger entry
      p2pPurchase({
        amount: totalAmount,
        listingId: params.listingId,
        stockTicker: listing.stock_ticker,
        quantity: params.quantity,
      });

      // CREDIT SELLER'S WALLET - Get seller's wallet and credit
      const { data: sellerWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('session_id', listing.seller_session_id)
        .single();

      if (sellerWallet) {
        await supabase.from('wallet_transactions').insert({
          wallet_id: sellerWallet.id,
          type: 'p2p_sale',
          amount: sellerReceives,
          status: 'completed',
          reference: params.listingId,
          description: `Sold ${params.quantity} ${listing.stock_ticker} shares (net of 5% PPT)`,
        });

        // Update seller wallet balance
        const { data: sellerTxs } = await supabase
          .from('wallet_transactions')
          .select('type, amount')
          .eq('wallet_id', sellerWallet.id)
          .eq('status', 'completed');

        const sellerBalance = (sellerTxs || []).reduce((sum, tx) => {
          if (tx.type === 'deposit' || tx.type === 'p2p_sale' || tx.type === 'trade_sell') {
            return sum + Number(tx.amount);
          }
          return sum - Number(tx.amount);
        }, 0);

        await supabase
          .from('wallets')
          .update({ balance: sellerBalance })
          .eq('id', sellerWallet.id);
      }

      // Update listing status
      if (params.quantity === listing.quantity) {
        await supabase
          .from('marketplace_listings')
          .update({ status: 'sold' })
          .eq('id', params.listingId);
      } else {
        await supabase
          .from('marketplace_listings')
          .update({ 
            quantity: listing.quantity - params.quantity,
            reserved_shares: listing.reserved_shares + params.quantity 
          })
          .eq('id', params.listingId);
      }

      // Notify buyer's broker
      await supabase.from('notifications').insert({
        session_id: profile.selectedBrokerId || '',
        title: 'Client Purchase Completed',
        message: `Your client (${sellId}) purchased ${params.quantity} shares of ${listing.stock_ticker} at K${listing.asking_price}/share. Total: K${totalAmount.toFixed(2)}`,
        type: 'success',
        action_url: '/marketplace',
      });

      // Notify seller's broker
      await supabase.from('notifications').insert({
        session_id: listing.seller_broker_id,
        title: 'Sale Completed',
        message: `Your client ${listing.sell_id} sold ${params.quantity} shares of ${listing.stock_ticker} to buyer ${sellId}. Net received: K${sellerReceives.toFixed(2)}`,
        type: 'success',
        action_url: '/marketplace',
      });

      // Log audit
      await supabase.from('marketplace_audit_log').insert({
        entity_type: 'transaction',
        entity_id: transaction.id,
        action_type: 'completed',
        performed_by: user.id,
        performed_by_type: 'user',
        broker_id: profile.selectedBrokerId,
        new_value: { ...transaction, status: 'completed' },
      });

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      refetchWallet();
      toast({
        title: '🎉 Purchase Complete!',
        description: 'Shares have been transferred and your wallet has been debited.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Purchase Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel listing
  const cancelListing = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'cancelled' })
        .eq('id', listingId)
        .eq('seller_session_id', user.id);

      if (error) throw error;

      // Log audit
      await supabase.from('marketplace_audit_log').insert({
        entity_type: 'listing',
        entity_id: listingId,
        action_type: 'cancelled',
        performed_by: user.id,
        performed_by_type: 'user',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-listings'] });
      toast({
        title: 'Listing Cancelled',
        description: 'Your listing has been removed from the marketplace.',
      });
    },
  });

  return {
    listings,
    myListings,
    offersReceived,
    myOffers,
    isLoading: listingsLoading || myListingsLoading,
    getAvailableShares,
    createListing,
    submitOffer,
    buyAtFixedPrice,
    cancelListing,
  };
}
