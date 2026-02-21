import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AssetPortfolioSectionProps {
  title: string;
  icon: ReactNode;
  holdings: Array<{
    id: string;
    ticker: string;
    units: number;
    purchasePrice: number;
    currentPrice?: number;
    currentValue?: number;
    totalReturn?: number;
    totalReturnPercent?: number;
    status?: string;
  }>;
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  emptyMessage: string;
  accentColor?: 'primary' | 'blue' | 'amber';
}

export function AssetPortfolioSection({
  title,
  icon,
  holdings,
  totalValue,
  totalCost,
  totalReturn,
  totalReturnPercent,
  emptyMessage,
  accentColor = 'primary',
}: AssetPortfolioSectionProps) {
  const isPositive = totalReturn >= 0;
  const executedHoldings = holdings.filter((h) => h.status !== 'pending');

  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    blue: 'bg-blue-500/10 text-blue-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };

  if (executedHoldings.length === 0) {
    return (
      <div className="premium-card p-6 text-center">
        <div className={cn('w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center', colorClasses[accentColor])}>
          {icon}
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
        <Link to="/trade">
          <Button size="sm" className="mt-4">Start Trading</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', colorClasses[accentColor])}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-xs text-muted-foreground">{executedHoldings.length} holdings</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold number-display">
              K{totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
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
                {isPositive ? '+' : ''}{totalReturnPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30 max-h-[300px] overflow-y-auto">
        {executedHoldings.slice(0, 5).map((holding, index) => {
          const holdingReturn = holding.totalReturn ?? 0;
          const holdingPositive = holdingReturn >= 0;

          return (
            <div
              key={holding.id}
              className="p-3 hover:bg-muted/20 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{holding.ticker}</p>
                  <p className="text-xs text-muted-foreground">
                    {holding.units} units @ K{holding.purchasePrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold number-display">
                    K{(holding.currentValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </p>
                  <p className={cn(
                    'text-xs number-display',
                    holdingPositive ? 'text-success' : 'text-destructive'
                  )}>
                    {holdingPositive ? '+' : ''}{(holding.totalReturnPercent ?? 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {executedHoldings.length > 5 && (
        <div className="p-3 text-center border-t border-border/50">
          <Link to="/portfolio" className="text-sm text-primary hover:underline">
            View all {executedHoldings.length} holdings
          </Link>
        </div>
      )}
    </div>
  );
}
