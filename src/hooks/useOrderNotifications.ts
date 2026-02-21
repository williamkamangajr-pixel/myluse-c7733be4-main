import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from './useSession';

export function useOrderNotifications() {
  const { sessionId } = useSession();
  const queryClient = useQueryClient();

  const createOrderNotification = async ({
    orderType,
    ticker,
    shares,
    price,
    status,
  }: {
    orderType: 'buy' | 'sell';
    ticker: string;
    shares: number;
    price: number;
    status: 'pending' | 'completed' | 'cancelled';
  }) => {
    if (!sessionId) return;

    const totalValue = shares * price;
    const action = orderType === 'buy' ? 'Buy' : 'Sell';
    
    let title = '';
    let message = '';
    let type: 'trade' | 'info' = 'trade';

    switch (status) {
      case 'pending':
        title = `${action} Order Placed`;
        message = `Your order to ${orderType} ${shares} shares of ${ticker} at K${price.toFixed(2)} (K${totalValue.toFixed(2)} total) is being processed.`;
        break;
      case 'completed':
        title = `${action} Order Completed`;
        message = `Your order to ${orderType} ${shares} shares of ${ticker} at K${price.toFixed(2)} has been executed successfully.`;
        break;
      case 'cancelled':
        title = `${action} Order Cancelled`;
        message = `Your order to ${orderType} ${shares} shares of ${ticker} has been cancelled.`;
        type = 'info';
        break;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        session_id: sessionId,
        title,
        message,
        type,
        is_read: false,
        action_url: '/portfolio',
      });

    if (error) {
      console.error('Failed to create notification:', error);
    } else {
      // Invalidate notifications cache to update the bell counter
      queryClient.invalidateQueries({ queryKey: ['notifications', sessionId] });
    }
  };

  const createWalletNotification = async ({
    transactionType,
    amount,
    method,
  }: {
    transactionType: 'deposit' | 'withdraw';
    amount: number;
    method: string;
  }) => {
    if (!sessionId) return;

    const action = transactionType === 'deposit' ? 'Deposit' : 'Withdrawal';

    const { error } = await supabase
      .from('notifications')
      .insert({
        session_id: sessionId,
        title: `${action} Successful`,
        message: `K${amount.toFixed(2)} has been ${transactionType === 'deposit' ? 'added to' : 'withdrawn from'} your wallet via ${method}.`,
        type: 'info',
        is_read: false,
        action_url: '/',
      });

    if (error) {
      console.error('Failed to create notification:', error);
    } else {
      queryClient.invalidateQueries({ queryKey: ['notifications', sessionId] });
    }
  };

  return {
    createOrderNotification,
    createWalletNotification,
  };
}
