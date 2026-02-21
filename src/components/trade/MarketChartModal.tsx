import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { Stock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MarketChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stocks: Stock[];
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
}

export function MarketChartModal({
  open,
  onOpenChange,
  stocks,
  selectedTicker,
  onTickerChange,
}: MarketChartModalProps) {
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M'>('1M');

  const selectedStock = stocks.find((s) => s.ticker === selectedTicker);
  const currentIndex = stocks.findIndex((s) => s.ticker === selectedTicker);

  // Generate mock chart data based on period
  const chartData = useMemo(() => {
    if (!selectedStock) return [];

    const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : 90;
    const data: Array<{ date: string; price: number }> = [];
    const basePrice = selectedStock.currentPrice * 0.9;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (period !== '1D' && (date.getDay() === 0 || date.getDay() === 6)) continue;

      const progress = (days - i) / days;
      const trend = (selectedStock.currentPrice - basePrice) * progress;
      const noise = (Math.random() - 0.5) * selectedStock.currentPrice * 0.03;
      
      data.push({
        date: date.toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' }),
        price: Math.round((basePrice + trend + noise) * 100) / 100,
      });
    }

    return data;
  }, [selectedStock, period]);

  const navigateStock = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      onTickerChange(stocks[currentIndex - 1].ticker);
    } else if (direction === 'next' && currentIndex < stocks.length - 1) {
      onTickerChange(stocks[currentIndex + 1].ticker);
    }
  };

  if (!selectedStock) return null;

  const isPositive = (selectedStock.changePercent ?? 0) >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateStock('prev')}
              disabled={currentIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl">{selectedStock.ticker}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateStock('next')}
              disabled={currentIndex >= stocks.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Price Display */}
          <div>
            <p className="text-3xl font-bold number-display">
              K{selectedStock.currentPrice.toFixed(2)}
            </p>
            <p className={cn(
              'text-sm font-medium',
              isPositive ? 'text-success' : 'text-destructive'
            )}>
              {isPositive ? '+' : ''}{(selectedStock.changePercent ?? 0).toFixed(2)}%
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {(['1D', '1W', '1M', '3M'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="modalPriceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `K${value.toFixed(0)}`}
                  width={50}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value as number;
                      return (
                        <div className="premium-card p-2 shadow-lg border border-border">
                          <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
                          <p className="font-semibold number-display">
                            K{value?.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                  strokeWidth={2}
                  fill="url(#modalPriceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="font-semibold number-display">K{selectedStock.previousClose?.toFixed(2)}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="font-semibold number-display">{(selectedStock.volume ?? 0).toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">52W High</p>
              <p className="font-semibold number-display">K{selectedStock.high52w?.toFixed(2)}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">52W Low</p>
              <p className="font-semibold number-display">K{selectedStock.low52w?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
