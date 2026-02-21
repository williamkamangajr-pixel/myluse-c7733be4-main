import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatZMW, formatPercent } from '@/lib/mockData';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface StockMiniCardProps {
  stock: Stock;
  index?: number;
}

export function StockMiniCard({ stock, index }: StockMiniCardProps) {
  const isPositive = stock.changePercent >= 0;

  return (
    <Link
      to={`/company/${stock.ticker}`}
      className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-card touch-press"
      style={index !== undefined ? { animationDelay: `${index * 0.05}s` } : undefined}
    >
      <div className="flex items-center gap-3">
        {/* Logo/Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <span className="text-xs font-bold text-muted-foreground">
            {stock.ticker.slice(0, 2)}
          </span>
        </div>
        
        {/* Info */}
        <div>
          <p className="font-semibold">{stock.ticker}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{stock.name}</p>
        </div>
      </div>

      {/* Price & Change */}
      <div className="text-right">
        <p className="number-display">{formatZMW(stock.currentPrice)}</p>
        <p className={cn(
          'flex items-center justify-end gap-0.5 text-xs font-medium',
          isPositive ? 'text-positive' : 'text-negative'
        )}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {formatPercent(stock.changePercent)}
        </p>
      </div>
    </Link>
  );
}
