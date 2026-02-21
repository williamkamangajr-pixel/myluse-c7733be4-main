import { TrendingUp, TrendingDown, Layers, BarChart3, Activity, Building, Loader2 } from 'lucide-react';
import { formatLargeNumber } from '@/lib/mockData';
import type { MarketSummary } from '@/types';
import { cn } from '@/lib/utils';

interface MarketOverviewCardProps {
  summary: MarketSummary;
  isLoading?: boolean;
  lastUpdated?: string;
}

export function MarketOverviewCard({ 
  summary, 
  isLoading,
  lastUpdated
}: MarketOverviewCardProps) {
  const isPositive = summary.indexChange >= 0;

  // Calculate total listed stocks
  const totalListed = summary.advancingStocks + summary.decliningStocks + summary.unchangedStocks;

  // Check if data is loading or empty
  const hasData = summary.indexValue > 0;

  return (
    <div className="premium-card">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{summary.indexName}</h3>
            <span className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase',
              summary.marketStatus === 'open' 
                ? 'bg-success/20 text-success' 
                : 'bg-muted text-muted-foreground'
            )}>
              {summary.marketStatus === 'open' ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
        
        {/* Loading/Updated indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isLoading ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>Updating...</span>
            </div>
          ) : lastUpdated ? (
            <span>Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
          ) : null}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !hasData && (
        <div className="mb-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-center">
          <Loader2 className="mx-auto mb-2 h-8 w-8 text-primary/60 animate-spin" />
          <p className="text-sm font-medium text-foreground">Loading market data...</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Fetching real-time prices from LuSE
          </p>
        </div>
      )}

      {/* Index Value */}
      <div className="mb-4">
        <p className="number-display text-4xl font-bold tracking-tight">
          {summary.indexValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="mt-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
            isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          )}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isPositive ? '+' : ''}{summary.indexChange.toFixed(2)} ({isPositive ? '+' : ''}{summary.indexChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-border/30 pt-4 md:grid-cols-4">
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
            <Layers className="h-3.5 w-3.5" />
            Market Cap
          </div>
          <p className="number-display text-lg font-semibold">
            K{formatLargeNumber(summary.totalValueTraded * 4.35)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
            <BarChart3 className="h-3.5 w-3.5" />
            Volume
          </div>
          <p className="number-display text-lg font-semibold">
            {formatLargeNumber(summary.totalVolume)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
            <Activity className="h-3.5 w-3.5" />
            Value
          </div>
          <p className="number-display text-lg font-semibold">
            K{formatLargeNumber(summary.totalValueTraded)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
            <Building className="h-3.5 w-3.5" />
            Listed
          </div>
          <p className="number-display text-lg font-semibold">
            {totalListed}
          </p>
        </div>
      </div>
    </div>
  );
}
