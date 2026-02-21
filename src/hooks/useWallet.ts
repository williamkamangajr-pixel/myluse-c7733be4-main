import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Wallet, WalletTransaction } from '@/types';

// Success sound for transactions
const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880; // A5 note - "bing" sound
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.warn('Could not play sound:', e);
  }
};

// Haptic feedback
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([50, 30, 50]);
  }
};

// Map snake_case DB columns to camelCase
function mapWallet(row: Record<string, unknown>): Wallet {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    balance: Number(row.balance),
    currency: row.currency as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapTransaction(row: Record<string, unknown>): WalletTransaction {
  return {
    id: row.id as string,
    walletId: row.wallet_id as string,
    type: row.type as WalletTransaction['type'],
    amount: Number(row.amount),
    status: row.status as WalletTransaction['status'],
    paymentMethod: row.payment_method as string | null,
    reference: row.reference as string | null,
    description: row.description as string | null,
    createdAt: row.created_at as string,
  };
}

// Calculate balance from ledger (source of truth)
async function calculateBalanceFromLedger(walletId: string): Promise<number> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('type, amount, status')
    .eq('wallet_id', walletId)
    .eq('status', 'completed');

  if (error || !data) return 0;

  return data.reduce((sum, tx) => {
    const amount = Number(tx.amount);
    // Deposits and sales add money, withdrawals and purchases subtract
    if (tx.type === 'deposit' || tx.type === 'p2p_sale' || tx.type === 'trade_sell') {
      return sum + amount;
    } else {
      return sum - amount;
    }
  }, 0);
}

async function fetchOrCreateWallet(userId: string): Promise<Wallet> {
  // Try to fetch existing wallet
  const { data: existingWallet, error: fetchError } = await supabase
    .from('wallets')
    .select('*')
    .eq('session_id', userId)
    .single();

  if (existingWallet) {
    const wallet = mapWallet(existingWallet as Record<string, unknown>);
    // Recalculate balance from ledger (source of truth)
    const ledgerBalance = await calculateBalanceFromLedger(wallet.id);
    
    // Update wallet balance if different
    if (Math.abs(wallet.balance - ledgerBalance) > 0.01) {
      await supabase
        .from('wallets')
        .update({ balance: ledgerBalance })
        .eq('id', wallet.id);
      wallet.balance = ledgerBalance;
    }
    
    return wallet;
  }

  // Create new wallet with 0 balance for new users
  const { data: newWallet, error: createError } = await supabase
    .from('wallets')
    .insert({
      session_id: userId,
      balance: 0, // New users start with 0
      currency: 'ZMW',
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create wallet: ${createError.message}`);
  }

  return mapWallet(newWallet as Record<string, unknown>);
}

async function fetchTransactions(walletId: string): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return (data || []).map(row => mapTransaction(row as Record<string, unknown>));
}

export function useWallet() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ['wallet', userId],
    queryFn: () => fetchOrCreateWallet(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });

  const transactionsQuery = useQuery({
    queryKey: ['wallet-transactions', walletQuery.data?.id],
    queryFn: () => fetchTransactions(walletQuery.data!.id),
    enabled: !!walletQuery.data?.id,
    staleTime: 1000 * 30,
  });

  const depositMutation = useMutation({
    mutationFn: async ({ amount, paymentMethod }: { amount: number; paymentMethod: string }) => {
      if (!walletQuery.data) throw new Error('Wallet not found');
      if (amount <= 0) throw new Error('Amount must be positive');

      // Create transaction record (positive amount for deposit)
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: walletQuery.data.id,
          type: 'deposit',
          amount, // Positive amount
          status: 'completed',
          payment_method: paymentMethod,
          description: `Deposit via ${paymentMethod}`,
        });

      if (txError) throw new Error(`Transaction failed: ${txError.message}`);

      // Update wallet balance to match ledger
      const newBalance = await calculateBalanceFromLedger(walletQuery.data.id);
      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletQuery.data.id);

      // Play success feedback
      playSuccessSound();
      triggerHaptic();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, paymentMethod }: { amount: number; paymentMethod: string }) => {
      if (!walletQuery.data) throw new Error('Wallet not found');
      if (amount <= 0) throw new Error('Amount must be positive');
      
      // Check balance constraint: current_balance - withdrawal >= 0
      const currentBalance = await calculateBalanceFromLedger(walletQuery.data.id);
      if (currentBalance < amount) {
        throw new Error(`Insufficient balance. Available: K${currentBalance.toFixed(2)}`);
      }

      // Create transaction record (stored as positive, type indicates direction)
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: walletQuery.data.id,
          type: 'withdraw',
          amount, // Positive amount, type determines direction
          status: 'completed',
          payment_method: paymentMethod,
          description: `Withdrawal to ${paymentMethod}`,
        });

      if (txError) throw new Error(`Transaction failed: ${txError.message}`);

      // Update wallet balance to match ledger
      const newBalance = await calculateBalanceFromLedger(walletQuery.data.id);
      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletQuery.data.id);

      playSuccessSound();
      triggerHaptic();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  });

  // P2P Purchase - debit buyer's wallet
  const p2pPurchaseMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      listingId, 
      stockTicker, 
      quantity 
    }: { 
      amount: number; 
      listingId: string; 
      stockTicker: string;
      quantity: number;
    }) => {
      if (!walletQuery.data) throw new Error('Wallet not found');
      
      const currentBalance = await calculateBalanceFromLedger(walletQuery.data.id);
      if (currentBalance < amount) {
        throw new Error(`Insufficient balance. You need K${amount.toFixed(2)} but have K${currentBalance.toFixed(2)}`);
      }

      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: walletQuery.data.id,
          type: 'p2p_purchase',
          amount,
          status: 'completed',
          reference: listingId,
          description: `Purchased ${quantity} ${stockTicker} shares`,
        });

      if (txError) throw new Error(`Purchase failed: ${txError.message}`);

      // Update wallet balance
      const newBalance = await calculateBalanceFromLedger(walletQuery.data.id);
      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletQuery.data.id);

      playSuccessSound();
      triggerHaptic();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  });

  // P2P Sale - credit seller's wallet (minus PPT)
  const p2pSaleMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      listingId, 
      stockTicker, 
      quantity 
    }: { 
      amount: number; 
      listingId: string; 
      stockTicker: string;
      quantity: number;
    }) => {
      if (!walletQuery.data) throw new Error('Wallet not found');

      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: walletQuery.data.id,
          type: 'p2p_sale',
          amount, // This should be net of PPT
          status: 'completed',
          reference: listingId,
          description: `Sold ${quantity} ${stockTicker} shares (net of 5% PPT)`,
        });

      if (txError) throw new Error(`Sale credit failed: ${txError.message}`);

      // Update wallet balance
      const newBalance = await calculateBalanceFromLedger(walletQuery.data.id);
      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletQuery.data.id);

      playSuccessSound();
      triggerHaptic();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  });

  return {
    wallet: walletQuery.data || null,
    balance: walletQuery.data?.balance ?? 0,
    transactions: transactionsQuery.data || [],
    isLoading: walletQuery.isLoading,
    error: walletQuery.error?.message || null,
    deposit: depositMutation.mutate,
    withdraw: withdrawMutation.mutate,
    p2pPurchase: p2pPurchaseMutation.mutate,
    p2pSale: p2pSaleMutation.mutate,
    isDepositing: depositMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    depositError: depositMutation.error?.message || null,
    withdrawError: withdrawMutation.error?.message || null,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  };
}
