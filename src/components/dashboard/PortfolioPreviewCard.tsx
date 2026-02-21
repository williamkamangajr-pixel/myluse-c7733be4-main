import { Link } from 'react-router-dom';
import { Briefcase, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatZMW, formatPercent } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function PortfolioPreviewCard() {
  const { holdings, summary, isLoading } = usePortfolio();
  const isPositive = summary.dailyChange >= 0;
  const topHoldings = holdings.slice(0, 3);

  if (isLoading) {
    return (
      <div className="premium-card">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="mb-4 h-4 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Briefcase className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">My Portfolio</h3>
      </div>

      {/* Total Value */}
      <div className="mb-4">
        <p className="number-display text-2xl">{formatZMW(summary.totalValue)}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={cn(
            'flex items-center gap-0.5 text-sm font-medium',
            isPositive ? 'text-positive' : 'text-negative'
          )}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {isPositive ? '+' : ''}{formatZMW(summary.dailyChange)}
          </span>
          <span className={cn(
            'rounded-md px-1.5 py-0.5 text-xs font-medium',
            isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          )}>
            {formatPercent(summary.dailyChangePercent)}
          </span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>
      </div>

      {/* Top Holdings */}
      {topHoldings.length > 0 ? (
        <div className="space-y-2 border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground">Top Holdings</p>
          {topHoldings.map((holding) => (
            <div key={holding.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-2xs font-bold text-muted-foreground">
                  {holding.stockTicker.slice(0, 2)}
                </div>
                <span className="text-sm font-medium">{holding.stockTicker}</span>
              </div>
              <div className="text-right">
                <p className="number-display text-sm">{formatZMW(holding.currentValue || 0)}</p>
                <p className={cn(
                  'text-2xs',
                  (holding.gainLossPercent || 0) >= 0 ? 'text-positive' : 'text-negative'
                )}>
                  {formatPercent(holding.gainLossPercent || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-t border-border/50 pt-3">
          <p className="text-center text-sm text-muted-foreground">
            No holdings yet. Start trading!
          </p>
        </div>
      )}

      {/* View All Link */}
      <Link
        to="/portfolio"
        className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-border/50 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground touch-press"
      >
        View Portfolio
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
