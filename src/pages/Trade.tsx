import { useState } from 'react';
import { PremiumLayout } from '@/components/layout';
import { useStocks } from '@/hooks/useStocks';
import { useWallet } from '@/hooks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useProfile } from '@/hooks/useProfile';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Sparkles,
  Smartphone,
  User,
  LineChart,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
// Dialog removed - using OrderConfirmationDialog instead
import { StockPickerSheet } from '@/components/trade/StockPickerSheet';
import { InlineStockChart } from '@/components/trade/InlineStockChart';
import { OrderConfirmationDialog } from '@/components/trade/OrderConfirmationDialog';
import { getBrokers } from '@/lib/brokerData';

const TradePage = () => {
  const { stocks, isLoading } = useStocks();
  const { balance, withdraw } = useWallet();
  const { addHolding } = usePortfolio();
  const { profile } = useProfile();
  
  const [selectedTicker, setSelectedTicker] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStockPicker, setShowStockPicker] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{shares: number, ticker: string, total: number} | null>(null);

  const brokers = getBrokers();
  const selectedBroker = brokers.find(b => b.id === profile?.selectedBrokerId) || brokers[0];

  if (isLoading) {
    return (
      <PremiumLayout>
        <LoadingFallback type="page" />
      </PremiumLayout>
    );
  }

  const selectedStock = stocks.find(s => s.ticker === selectedTicker);
  const quantityNum = parseInt(quantity) || 0;
  const stockPrice = selectedStock?.currentPrice ?? 0;
  const orderValue = quantityNum * stockPrice;
  const serviceFee = orderValue * 0.03; // 3% fee
  const totalCost = orderValue + serviceFee;
  const isPositive = (selectedStock?.changePercent ?? 0) >= 0;
  const insufficientFunds = tradeType === 'buy' && totalCost > balance;

  const canExecute = selectedStock && quantityNum > 0 && !insufficientFunds;

  const handleSelectStock = (ticker: string) => {
    setSelectedTicker(ticker);
    setShowStockPicker(false);
  };

  const handleSubmit = async () => {
    if (!selectedStock || !canExecute) return;

    setIsSubmitting(true);
    try {
      if (tradeType === 'buy') {
        await withdraw({ amount: totalCost, paymentMethod: 'wallet' });
        
        addHolding({
          stockTicker: selectedStock.ticker,
          sharesOwned: quantityNum,
          purchasePrice: stockPrice,
          tradeType: 'buy',
        });
      }

      setOrderDetails({
        shares: quantityNum,
        ticker: selectedStock.ticker,
        total: totalCost
      });
      setShowConfirmation(true);
      setQuantity('');
    } catch (error) {
      toast.error('Trade failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PremiumLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Trade</h1>
          <p className="text-sm text-muted-foreground">Buy or sell stocks, commodities & securities</p>
        </div>

        {/* Stock Selector Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowStockPicker(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {selectedStock ? selectedStock.ticker : 'Select Market'}
          </Button>
        </div>

        {selectedStock ? (
          <>
            {/* Stock Info Card with Chart - No Zambian theme here */}
            <div className="premium-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedStock.ticker}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-foreground number-display">
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

              {/* Inline Chart */}
              <div className="h-32 -mx-4 -mb-4 bg-muted/20 rounded-b-xl overflow-hidden">
                <InlineStockChart ticker={selectedStock.ticker} isPositive={isPositive} />
              </div>
            </div>

            {/* AI Insight */}
            <div className="premium-card p-4">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">AI Insight</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedStock.name} remains a stable, defensive holding with steady demand from the {selectedStock.sector?.toLowerCase() || 'general'} sector, though its current flat price movement and high share price suggest limited short-term volatility for traders.
              </p>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="premium-card p-8 text-center bg-muted/30">
            <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-1">Select to view chart</h3>
            <p className="text-sm text-muted-foreground">
              Tap the + button above to choose
            </p>
          </div>
        )}

        {/* Place Order Card */}
        <div className="premium-card p-4 space-y-4">
          <h3 className="font-semibold">Place Order</h3>

          {/* Trade Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={tradeType === 'buy' ? 'default' : 'outline'}
              onClick={() => setTradeType('buy')}
              className={cn(
                'w-full gap-2',
                tradeType === 'buy' && 'bg-success hover:bg-success/90 border-success'
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Buy
            </Button>
            <Button
              variant={tradeType === 'sell' ? 'default' : 'outline'}
              onClick={() => setTradeType('sell')}
              className={cn(
                'w-full gap-2',
                tradeType === 'sell' && 'bg-muted hover:bg-muted/90'
              )}
            >
              <TrendingDown className="h-4 w-4" />
              Sell
            </Button>
          </div>

          {selectedStock ? (
            <>
              {/* Quantity Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Shares</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="text-center text-lg bg-muted/50"
                />
              </div>

              {/* Order Summary */}
              {quantityNum > 0 && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value</span>
                    <span className="number-display">K{orderValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee (3%)</span>
                    <span className="text-primary number-display">K{serviceFee.toLocaleString(undefined, {minimumFractionDigits: 3})}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Value</span>
                    <span className="text-primary number-display">K{totalCost.toLocaleString(undefined, {minimumFractionDigits: 3})}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-sm bg-primary" />
                      </div>
                      <span className="text-muted-foreground">Wallet Balance</span>
                    </div>
                    <span className={cn(
                      'number-display',
                      insufficientFunds ? 'text-destructive' : 'text-primary'
                    )}>
                      K{balance.toLocaleString(undefined, {minimumFractionDigits: 3})}
                    </span>
                  </div>
                  
                  {insufficientFunds && (
                    <div className="flex items-center gap-2 text-destructive text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Insufficient funds. Please deposit more</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Money Payment */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span>Mobile Money Payment</span>
                </div>
                <div className="premium-card p-3 bg-muted/30">
                  <p className="font-medium">{profile?.mobileMoneyProvider || 'airtel'}</p>
                  <p className="text-sm text-muted-foreground">{profile?.mobileMoneyNumber || '0973819545'}</p>
                </div>
              </div>

              {/* Stock Broker */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Your Stock Broker</span>
                </div>
                <div className="premium-card p-3 bg-muted/30">
                  <p className="font-medium">{selectedBroker?.name || 'Money Acumen Advisory'}</p>
                  <p className="text-sm text-muted-foreground">LuSE Broker</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className={cn(
                  'w-full h-12 text-base font-semibold gap-2',
                  tradeType === 'buy' ? 'bg-success hover:bg-success/90' : 'bg-muted hover:bg-muted/80'
                )}
                disabled={!canExecute || isSubmitting}
                onClick={handleSubmit}
              >
                <TrendingUp className="h-4 w-4" />
                {isSubmitting ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedStock.ticker}`}
              </Button>
            </>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-4">
              Select a stock to trade
            </p>
          )}
        </div>
      </div>

      {/* Stock Picker Sheet */}
      <StockPickerSheet
        open={showStockPicker}
        onOpenChange={setShowStockPicker}
        stocks={stocks}
        onSelect={handleSelectStock}
      />

      {/* Order Confirmation Dialog with Processing & Glowing Checkbox */}
      <OrderConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        orderDetails={orderDetails}
        brokerName={selectedBroker?.name || 'MyLuSE Advisory'}
      />
    </PremiumLayout>
  );
};

export default TradePage;