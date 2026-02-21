import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';

export interface Order {
  id: string;
  sessionId: string;
  brokerId: string;
  stockTicker: string;
  stockName: string;
  tradeType: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
  subtotal: number;
  secFee: number;
  luseFee: number;
  brokerFee: number;
  pttFee: number;
  totalFees: number;
  totalAmount: number;
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  notes?: string;
}

interface CreateOrderParams {
  brokerId: string;
  stockTicker: string;
  stockName: string;
  tradeType: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
  subtotal: number;
  secFee: number;
  luseFee: number;
  brokerFee: number;
  pttFee: number;
  totalFees: number;
  totalAmount: number;
  notes?: string;
}

export function useOrders() {
  const { sessionId } = useSession();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', sessionId],
    queryFn: async (): Promise<Order[]> => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data.map((order) => ({
        id: order.id,
        sessionId: order.session_id,
        brokerId: order.broker_id,
        stockTicker: order.stock_ticker,
        stockName: order.stock_name,
        tradeType: order.trade_type as 'buy' | 'sell',
        shares: Number(order.shares),
        pricePerShare: Number(order.price_per_share),
        subtotal: Number(order.subtotal),
        secFee: Number(order.sec_fee),
        luseFee: Number(order.luse_fee),
        brokerFee: Number(order.broker_fee),
        pttFee: Number(order.ptt_fee),
        totalFees: Number(order.total_fees),
        totalAmount: Number(order.total_amount),
        status: order.status as 'pending' | 'executed' | 'cancelled',
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        executedAt: order.executed_at ?? undefined,
        notes: order.notes ?? undefined,
      }));
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (params: CreateOrderParams) => {
      if (!sessionId) throw new Error('No session');

      const { data, error } = await supabase
        .from('orders')
        .insert({
          session_id: sessionId,
          broker_id: params.brokerId,
          stock_ticker: params.stockTicker,
          stock_name: params.stockName,
          trade_type: params.tradeType,
          shares: params.shares,
          price_per_share: params.pricePerShare,
          subtotal: params.subtotal,
          sec_fee: params.secFee,
          luse_fee: params.luseFee,
          broker_fee: params.brokerFee,
          ptt_fee: params.pttFee,
          total_fees: params.totalFees,
          total_amount: params.totalAmount,
          status: 'pending',
          notes: params.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', sessionId] });
    },
  });

  return {
    orders: orders ?? [],
    isLoading,
    error: error?.message,
    refetch,
    createOrder: createOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
  };
}

// Hook for brokers to view all orders
export function useBrokerOrders(brokerId?: string) {
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['broker-orders', brokerId],
    queryFn: async (): Promise<Order[]> => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (brokerId) {
        query = query.eq('broker_id', brokerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching broker orders:', error);
        return [];
      }

      return data.map((order) => ({
        id: order.id,
        sessionId: order.session_id,
        brokerId: order.broker_id,
        stockTicker: order.stock_ticker,
        stockName: order.stock_name,
        tradeType: order.trade_type as 'buy' | 'sell',
        shares: Number(order.shares),
        pricePerShare: Number(order.price_per_share),
        subtotal: Number(order.subtotal),
        secFee: Number(order.sec_fee),
        luseFee: Number(order.luse_fee),
        brokerFee: Number(order.broker_fee),
        pttFee: Number(order.ptt_fee),
        totalFees: Number(order.total_fees),
        totalAmount: Number(order.total_amount),
        status: order.status as 'pending' | 'executed' | 'cancelled',
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        executedAt: order.executed_at ?? undefined,
        notes: order.notes ?? undefined,
      }));
    },
    staleTime: 1000 * 30, // Refresh every 30 seconds for brokers
  });

  return {
    orders: orders ?? [],
    isLoading,
    error: error?.message,
    refetch,
  };
}
