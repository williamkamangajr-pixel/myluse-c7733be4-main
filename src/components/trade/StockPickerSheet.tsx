import { useState } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Stock } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface StockPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stocks: Stock[];
  onSelect: (ticker: string) => void;
  selectedTicker?: string;
}

export function StockPickerSheet({
  open,
  onOpenChange,
  stocks,
  onSelect,
  selectedTicker,
}: StockPickerSheetProps) {
  const [search, setSearch] = useState('');

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase()) ||
      stock.sector?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (ticker: string) => {
    onSelect(ticker);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Select Stock</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks..."
            className="pl-10"
          />
        </div>

        {/* Stock List */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(80vh-140px)]">
          {filteredStocks.map((stock) => {
            const isPositive = (stock.changePercent ?? 0) >= 0;
            const isSelected = stock.ticker === selectedTicker;

            return (
              <button
                key={stock.ticker}
                onClick={() => handleSelect(stock.ticker)}
                className={cn(
                  'w-full p-3 rounded-xl text-left transition-all touch-press',
                  'border border-border/50 hover:border-primary/30',
                  isSelected && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stock.ticker}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {stock.sector}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {stock.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold number-display">
                      K{stock.currentPrice.toFixed(2)}
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
                        {isPositive ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
