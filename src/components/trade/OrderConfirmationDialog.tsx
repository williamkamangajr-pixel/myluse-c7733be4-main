import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Check, Clock, AlertTriangle } from 'lucide-react';
import { isMarketOpen, getMarketStatusMessage } from '@/lib/luseStockData';

interface OrderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderDetails: {
    shares: number;
    ticker: string;
    total: number;
    type?: 'buy' | 'sell';
  } | null;
  brokerName: string;
}

export function OrderConfirmationDialog({
  open,
  onOpenChange,
  orderDetails,
  brokerName,
}: OrderConfirmationDialogProps) {
  const [stage, setStage] = useState<'market-closed' | 'processing' | 'confirmed'>('processing');
  
  const marketOpen = isMarketOpen();
  const orderType = orderDetails?.type || 'buy';

  useEffect(() => {
    if (open && orderDetails) {
      // Check if market is open
      if (!marketOpen) {
        setStage('market-closed');
      } else {
        setStage('processing');
        // Simulate processing delay
        const timer = setTimeout(() => {
          setStage('confirmed');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [open, orderDetails, marketOpen]);

  if (!orderDetails) return null;

  // Prevent closing during processing
  const handleOpenChange = (newOpen: boolean) => {
    if (stage === 'processing') return; // Block closing during processing
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-xs border-0 bg-transparent shadow-none"
        onPointerDownOutside={(e) => stage === 'processing' && e.preventDefault()}
        onEscapeKeyDown={(e) => stage === 'processing' && e.preventDefault()}
        hideCloseButton={stage === 'processing'}
      >
        <DialogTitle className="sr-only">
          {stage === 'market-closed' ? 'Market Closed' : stage === 'processing' ? 'Processing Order' : 'Order Confirmed'}
        </DialogTitle>

        <div className="flex flex-col items-center text-center">
          {stage === 'market-closed' ? (
            <div className="premium-card p-6 w-full">
              {/* Market Closed State */}
              <div className="flex flex-col items-center">
                <div className="market-closed-glow h-20 w-20 rounded-full bg-warning/20 flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-warning flex items-center justify-center animate-pulse">
                    <AlertTriangle className="h-6 w-6 text-warning-foreground" strokeWidth={2} />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2">Market Closed</h2>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/20 text-warning text-sm mb-4">
                  <Clock className="h-3 w-3" />
                  {getMarketStatusMessage()}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  The LuSE market is currently closed. Trading hours are 10:00 AM - 12:30 PM CAT, Monday to Friday.
                </p>
                
                <Button 
                  variant="outline"
                  className="w-full border-warning/30 text-warning hover:bg-warning/10"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          ) : stage === 'processing' ? (
            <>
              {/* Processing State - Circle with Glowing Border */}
              <div className="processing-spinner h-24 w-24 rounded-full bg-card/80 backdrop-blur flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
              <p className="text-lg font-semibold text-foreground">Processing...</p>
            </>
          ) : (
            <div className="premium-card p-6 w-full">
              {/* Confirmed State with Glowing Checkbox */}
              <div className="flex flex-col items-center">
                <div className="checkbox-glow h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-success flex items-center justify-center animate-scale-in">
                    <Check className="h-6 w-6 text-white" strokeWidth={3} />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2">Order Submitted!</h2>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4 ${
                  orderType === 'buy' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                }`}>
                  {orderType === 'buy' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {orderType.toUpperCase()} ORDER
                </div>
                
                <p className="text-muted-foreground mb-2">
                  {orderDetails.shares} shares of{' '}
                  <span className="text-primary font-medium">{orderDetails.ticker}</span>
                </p>
                
                <p className="text-2xl font-bold number-display mb-4">
                  K{orderDetails.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                
                <div className="w-full px-4 py-3 rounded-lg bg-warning/20 text-warning text-sm mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                    Pending Execution by {brokerName}
                  </div>
                  <p className="text-xs mt-1 text-warning/70">
                    Wallet balance deducted. Order will be confirmed once broker approves.
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
