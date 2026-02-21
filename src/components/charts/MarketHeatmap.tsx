import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Stock } from '@/lib/types';

interface MarketHeatmapProps {
  stocks: Stock[];
}

export function MarketHeatmap({ stocks }: MarketHeatmapProps) {
  const sortedStocks = useMemo(() => {
    return [...stocks].sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
  }, [stocks]);

  const getColorClass = (changePercent: number) => {
    if (changePercent > 3) return 'bg-success';
    if (changePercent > 1) return 'bg-success/70';
    if (changePercent > 0) return 'bg-success/40';
    if (changePercent === 0) return 'bg-muted';
    if (changePercent > -1) return 'bg-destructive/40';
    if (changePercent > -3) return 'bg-destructive/70';
    return 'bg-destructive';
  };

  const getTileSize = (marketCap: number, maxCap: number) => {
    const ratio = marketCap / maxCap;
    if (ratio > 0.3) return 'col-span-2 row-span-2';
    if (ratio > 0.15) return 'col-span-2';
    return '';
  };

  const maxCap = sortedStocks[0]?.marketCap ?? 1;

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-1 auto-rows-fr">
      {sortedStocks.slice(0, 20).map((stock) => {
        const tileSize = getTileSize(stock.marketCap ?? 0, maxCap);
        const isPositive = (stock.changePercent ?? 0) >= 0;

        return (
          <div
            key={stock.ticker}
            className={cn(
              'p-2 rounded flex flex-col items-center justify-center text-center transition-all hover:scale-105 cursor-pointer min-h-[60px]',
              getColorClass(stock.changePercent ?? 0),
              tileSize
            )}
          >
            <span className="text-xs font-bold text-white drop-shadow-md">
              {stock.ticker}
            </span>
            <span className="text-[10px] text-white/80 drop-shadow-md">
              {isPositive ? '+' : ''}{(stock.changePercent ?? 0).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
