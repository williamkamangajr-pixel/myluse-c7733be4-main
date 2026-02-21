import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CancelOrderData {
  id: string;
  ticker: string;
  type: 'stock' | 'bond';
  tradeType: 'buy' | 'sell';
  amount: number;
}

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: CancelOrderData | null;
  onSuccess?: () => void;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: CancelOrderDialogProps) {
  if (!order) return null;

  const handleCancel = async () => {
    try {
      const table = order.type === 'stock' ? 'portfolio_holdings' : 'portfolio_bond_holdings';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', order.id);

      if (error) {
        toast.error('Failed to cancel order');
        return;
      }

      toast.success(`${order.tradeType.toUpperCase()} order for ${order.ticker} cancelled`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your {order.tradeType.toLowerCase()} order for{' '}
            <span className="font-semibold">{order.ticker}</span>?
            <br />
            <br />
            Order amount: <span className="font-semibold">K{order.amount.toLocaleString()}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Order</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cancel Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
