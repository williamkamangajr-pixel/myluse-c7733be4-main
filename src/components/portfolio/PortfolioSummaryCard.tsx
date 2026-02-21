import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortfolioSummary } from '@/lib/types';

interface PortfolioSummaryCardProps {
  summary: {
    totalValue: number;
    totalCost: number;
    totalReturn: number;
    totalReturnPercent: number;
    holdings?: any[];
  };
}

export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
  const isPositive = summary.totalReturn >= 0;

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-5 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Portfolio Value</span>
        </div>
        
        <p className="text-3xl md:text-4xl font-bold number-display">
          K{summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
        
        <div className="flex items-center gap-2 mt-2">
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-success' : 'text-destructive'
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="number-display">
              {isPositive ? '+' : ''}K{Math.abs(summary.totalReturn).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className="number-display">
              ({isPositive ? '+' : ''}{summary.totalReturnPercent.toFixed(2)}%)
            </span>
          </div>
          <span className="text-xs text-muted-foreground">All time</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 divide-x divide-border/50 border-t border-border/50">
        <div className="p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Invested</p>
          <p className="font-semibold number-display">
            K{summary.totalCost.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Return</p>
          <p className={cn(
            'font-semibold number-display',
            isPositive ? 'text-success' : 'text-destructive'
          )}>
            {isPositive ? '+' : ''}{summary.totalReturnPercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
