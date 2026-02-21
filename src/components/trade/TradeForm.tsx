import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Stock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useOrders } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useProfile';
import { calculateTradingFees, TRADING_FEES, TOTAL_BASE_FEE, TOTAL_SELL_FEE } from '@/lib/brokerData';
import { toast } from 'sonner';

interface TradeFormProps {
  stocks: Stock[];
  isLoading: boolean;
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
  selectedStock: Stock | null;
}

export function TradeForm({
  stocks,
  isLoading,
  selectedTicker,
  onTickerChange,
  selectedStock,
}: TradeFormProps) {
  const { wallet, withdraw, deposit } = useWallet();
  const { addHolding } = usePortfolio();
  const { createOrderNotification } = useOrderNotifications();
  const { createOrder } = useOrders();
  const { profile } = useProfile();

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  const quantityNum = parseInt(quantity) || 0;
  const stockPrice = selectedStock?.currentPrice ?? 0;
  const grossAmount = quantityNum * stockPrice;
  
  // Calculate fees
  const isSell = tradeType === 'sell';
  const fees = calculateTradingFees(grossAmount, isSell);
  const totalCost = isSell ? grossAmount - fees.totalFee : grossAmount + fees.totalFee;
  const netProceeds = isSell ? grossAmount - fees.totalFee : 0;

  const isPositive = (selectedStock?.changePercent ?? 0) >= 0;

  const canBuy = wallet && totalCost > 0 && totalCost <= wallet.balance;
  const canExecute = selectedStock && quantityNum > 0 && (tradeType === 'buy' ? canBuy : true);

  const handleProceedToConfirm = () => {
    if (!canExecute) return;
    setShowBalance(true);
    setConfirmStep(true);
  };

  const handleSubmit = async () => {
    if (!selectedStock || !canExecute) return;

    setIsSubmitting(true);
    try {
      // Create order record for broker visibility (with all fee details)
      await createOrder({
        brokerId: profile.selectedBrokerId || 'money-acumen',
        stockTicker: selectedStock.ticker,
        stockName: selectedStock.name,
        tradeType,
        shares: quantityNum,
        pricePerShare: stockPrice,
        subtotal: grossAmount,
        secFee: fees.secFee,
        luseFee: fees.luseFee,
        brokerFee: fees.brokerFee,
        pttFee: fees.pttFee,
        totalFees: fees.totalFee,
        totalAmount: tradeType === 'buy' ? totalCost : netProceeds,
      });

      if (tradeType === 'buy') {
        // Withdraw from wallet (including fees)
        await withdraw({ amount: totalCost, paymentMethod: 'wallet' });
        
        // Add to portfolio with pending status
        addHolding({
          stockTicker: selectedStock.ticker,
          sharesOwned: quantityNum,
          purchasePrice: stockPrice,
          tradeType: 'buy',
        });

        // Create notification
        await createOrderNotification({
          orderType: 'buy',
          ticker: selectedStock.ticker,
          shares: quantityNum,
          price: stockPrice,
          status: 'pending',
        });

        toast.success(`Order placed: ${quantityNum} ${selectedStock.ticker} for K${totalCost.toLocaleString()} (pending broker approval)`);
      } else {
        // Sell logic - deposit net proceeds after fees
        deposit({ amount: netProceeds, paymentMethod: 'wallet' });
        
        // Create notification
        await createOrderNotification({
          orderType: 'sell',
          ticker: selectedStock.ticker,
          shares: quantityNum,
          price: stockPrice,
          status: 'pending',
        });

        toast.success(`Sell order placed for ${quantityNum} ${selectedStock.ticker} - K${netProceeds.toLocaleString()} (pending broker approval)`);
      }

      setQuantity('');
      setConfirmStep(false);
    } catch (error) {
      toast.error('Trade failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedStock) {
    return (
      <div className="premium-card p-8 text-center">
        <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">Select a Stock</h3>
        <p className="text-sm text-muted-foreground">
          Choose a stock from the list to start trading
        </p>
      </div>
    );
  }

  return (
    <div className="premium-card p-4 space-y-4">
      {/* Stock Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{selectedStock.ticker}</h3>
          <p className="text-sm text-muted-foreground">{selectedStock.name}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl number-display">
            K{stockPrice.toFixed(2)}
          </p>
          <div className={cn(
            'flex items-center justify-end gap-1 text-sm',
            isPositive ? 'text-success' : 'text-destructive'
          )}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="number-display">
              {isPositive ? '+' : ''}{(selectedStock.changePercent ?? 0).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Trade Type Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={tradeType === 'buy' ? 'default' : 'outline'}
          onClick={() => { setTradeType('buy'); setConfirmStep(false); }}
          className={cn(
            'w-full',
            tradeType === 'buy' && 'bg-success hover:bg-success/90'
          )}
        >
          Buy
        </Button>
        <Button
          variant={tradeType === 'sell' ? 'default' : 'outline'}
          onClick={() => { setTradeType('sell'); setConfirmStep(false); }}
          className={cn(
            'w-full',
            tradeType === 'sell' && 'bg-destructive hover:bg-destructive/90'
          )}
        >
          Sell
        </Button>
      </div>

      {/* Fee Notice */}
      <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-xs text-warning">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">LuSE Trading Fees</p>
            <ul className="space-y-0.5 text-warning/80">
              <li>• SEC: {(TRADING_FEES.SEC * 100).toFixed(3)}%</li>
              <li>• LuSE: {(TRADING_FEES.LUSE * 100).toFixed(2)}%</li>
              <li>• Broker: {(TRADING_FEES.BROKER * 100).toFixed(0)}%</li>
              <li className="font-medium">• Total: {(TOTAL_BASE_FEE * 100).toFixed(3)}%</li>
            </ul>
            {tradeType === 'sell' && (
              <p className="mt-2 pt-2 border-t border-warning/30 font-medium">
                + 3% Property Transfer Tax (PTT) on sales = {(TOTAL_SELL_FEE * 100).toFixed(3)}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quantity Input */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity (Shares)</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          placeholder="0"
          value={quantity}
          onChange={(e) => { setQuantity(e.target.value); setConfirmStep(false); }}
          className="text-lg"
        />
      </div>

      {/* Order Summary */}
      {quantityNum > 0 && (
        <div className="p-3 rounded-lg bg-muted/30 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per share</span>
            <span className="number-display">K{stockPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span className="number-display">{quantityNum}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gross Amount</span>
            <span className="number-display">K{grossAmount.toLocaleString()}</span>
          </div>
          
          {/* Fee Breakdown */}
          <div className="pt-2 border-t border-border/30 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">SEC Fee (0.125%)</span>
              <span className="number-display">K{fees.secFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">LuSE Fee (0.25%)</span>
              <span className="number-display">K{fees.luseFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Broker Fee (1%)</span>
              <span className="number-display">K{fees.brokerFee.toFixed(2)}</span>
            </div>
            {isSell && (
              <div className="flex justify-between text-xs text-warning">
                <span>PTT (3%)</span>
                <span className="number-display">K{fees.pttFee.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between font-semibold pt-2 border-t border-border/50">
            <span>{isSell ? 'Net Proceeds' : 'Total Cost'}</span>
            <span className="number-display">
              K{(isSell ? netProceeds : totalCost).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Balance Reveal - Only shown before confirmation */}
      {confirmStep && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Wallet Balance</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'font-bold number-display',
                canBuy || tradeType === 'sell' ? 'text-success' : 'text-destructive'
              )}>
                {showBalance ? `K${(wallet?.balance ?? 0).toLocaleString()}` : '••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {tradeType === 'buy' && !canBuy && (
            <p className="text-xs text-destructive mt-1">Insufficient balance</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      {!confirmStep ? (
        <Button
          className="w-full h-12 text-base font-semibold"
          disabled={!canExecute || isSubmitting}
          onClick={handleProceedToConfirm}
        >
          Review Order
        </Button>
      ) : (
        <Button
          className={cn(
            'w-full h-12 text-base font-semibold',
            tradeType === 'buy' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'
          )}
          disabled={!canExecute || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Processing...' : `Confirm ${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedStock.ticker}`}
        </Button>
      )}
    </div>
  );
}
