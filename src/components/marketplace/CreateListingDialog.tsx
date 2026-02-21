import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMarketplace } from '@/hooks/useMarketplace';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatZMW } from '@/lib/mockData';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListingDialog({ open, onOpenChange }: CreateListingDialogProps) {
  const { createListing, getAvailableShares } = useMarketplace();
  const { holdings } = usePortfolio();
  
  const [stockTicker, setStockTicker] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priceType, setPriceType] = useState<'fixed' | 'open_to_bids'>('fixed');
  const [askingPrice, setAskingPrice] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  // Get unique stocks the user owns
  const ownedStocks = useMemo(() => {
    if (!holdings) return [];
    const stockMap = new Map<string, number>();
    
    // Holdings from usePortfolio are already filtered by status='completed'
    holdings
      .forEach(h => {
        stockMap.set(h.stockTicker, (stockMap.get(h.stockTicker) || 0) + h.sharesOwned);
      });
    
    return Array.from(stockMap.entries()).map(([ticker, shares]) => ({
      ticker,
      shares,
      available: getAvailableShares(ticker),
    }));
  }, [holdings, getAvailableShares]);

  const selectedStock = ownedStocks.find(s => s.ticker === stockTicker);
  const maxQuantity = selectedStock?.available || 0;

  const handleSubmit = () => {
    if (!stockTicker || quantity < 1) return;
    
    createListing.mutate({
      stockTicker,
      quantity,
      priceType,
      askingPrice: priceType === 'fixed' ? askingPrice : undefined,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setStockTicker('');
    setQuantity(1);
    setPriceType('fixed');
    setAskingPrice(undefined);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) resetForm();
      onOpenChange(o);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>List Shares for Sale</DialogTitle>
          <DialogDescription>
            Create a listing to sell shares from your portfolio on the marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {ownedStocks.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have any shares in your portfolio to sell. Purchase shares first before listing.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Stock Selection */}
              <div className="space-y-2">
                <Label>Select Stock</Label>
                <Select value={stockTicker} onValueChange={setStockTicker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a stock from your portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownedStocks.map(stock => (
                      <SelectItem 
                        key={stock.ticker} 
                        value={stock.ticker}
                        disabled={stock.available <= 0}
                      >
                        {stock.ticker} ({stock.available} available of {stock.shares} owned)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity to Sell</Label>
                <Input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(Number(e.target.value), maxQuantity))}
                  disabled={!stockTicker}
                />
                {stockTicker && (
                  <p className="text-xs text-muted-foreground">
                    Maximum: {maxQuantity} shares
                  </p>
                )}
              </div>

              {/* Price Type */}
              <div className="space-y-3">
                <Label>Pricing Type</Label>
                <RadioGroup 
                  value={priceType} 
                  onValueChange={(v) => setPriceType(v as 'fixed' | 'open_to_bids')}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="cursor-pointer">
                      <div className="font-medium">Fixed Price</div>
                      <p className="text-xs text-muted-foreground">Set your price</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="open_to_bids" id="bids" />
                    <Label htmlFor="bids" className="cursor-pointer">
                      <div className="font-medium">Open to Bids</div>
                      <p className="text-xs text-muted-foreground">Accept offers</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Asking Price (for fixed price) */}
              {priceType === 'fixed' && (
                <div className="space-y-2">
                  <Label>Asking Price (per share)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">K</span>
                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={askingPrice || ''}
                      onChange={(e) => setAskingPrice(Number(e.target.value))}
                      className="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                  {askingPrice && quantity > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Total value: {formatZMW(askingPrice * quantity)}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for potential buyers..."
                  rows={2}
                />
              </div>

              {/* Info */}
              <Alert className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  Your broker will be notified when you create this listing. All sales are subject to 5% PPT tax.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              createListing.isPending || 
              !stockTicker || 
              quantity < 1 || 
              quantity > maxQuantity ||
              (priceType === 'fixed' && !askingPrice)
            }
          >
            {createListing.isPending ? 'Creating...' : 'Create Listing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
