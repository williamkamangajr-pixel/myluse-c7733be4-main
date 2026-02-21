import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketSummary } from '@/lib/types';

interface LASISummaryCardProps {
  current: MarketSummary | null;
}

export function LASISummaryCard({ current }: LASISummaryCardProps) {
  if (!current) {
    return (
      <div className="premium-card p-4 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-2" />
        <div className="h-8 w-24 bg-muted rounded" />
      </div>
    );
  }

  const isPositive = (current.indexChange ?? 0) >= 0;
  const isOpen = current.marketStatus === 'open';

  return (
    <div className="premium-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">{current.indexName}</span>
        </div>
        <div className={cn(
          'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
          isOpen ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        )}>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            isOpen ? 'bg-success animate-pulse' : 'bg-muted-foreground'
          )} />
          {isOpen ? 'Market Open' : 'Market Closed'}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <p className="text-3xl font-bold number-display">
          {current.indexValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium pb-1',
          isPositive ? 'text-success' : 'text-destructive'
        )}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="number-display">
            {isPositive ? '+' : ''}{(current.indexChange ?? 0).toFixed(2)}
          </span>
          <span className="number-display">
            ({isPositive ? '+' : ''}{(current.indexChangePercent ?? 0).toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
        <div>
          <p className="text-xs text-muted-foreground">Advancing</p>
          <p className="font-semibold text-success">{current.advancingStocks}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Declining</p>
          <p className="font-semibold text-destructive">{current.decliningStocks}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Unchanged</p>
          <p className="font-semibold text-muted-foreground">{current.unchangedStocks}</p>
        </div>
      </div>
    </div>
  );
}
