import { useMemo } from 'react';
import { TrendingUp, BarChart3, Landmark, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceSectionProps {
  stockHoldings: Array<{
    stockTicker: string;
    sharesOwned: number;
    purchasePrice: number;
    currentValue?: number;
    totalReturn?: number;
    purchaseDate?: string;
  }>;
  bondHoldings: Array<{
    bondTicker: string;
    units: number;
    purchasePrice: number;
    currentValue?: number;
    totalReturn?: number;
    purchaseDate?: string;
  }>;
  commodityHoldings: Array<{
    commodityTicker: string;
    units: number;
    purchasePrice: number;
    currentValue?: number;
    totalReturn?: number;
  }>;
}

export function PortfolioPerformanceSection({
  stockHoldings,
  bondHoldings,
  commodityHoldings,
}: PerformanceSectionProps) {
  const stats = useMemo(() => {
    const stockValue = stockHoldings.reduce((sum, h) => sum + (h.currentValue ?? 0), 0);
    const stockReturn = stockHoldings.reduce((sum, h) => sum + (h.totalReturn ?? 0), 0);
    const stockCost = stockHoldings.reduce((sum, h) => sum + h.sharesOwned * h.purchasePrice, 0);
    const stockReturnPercent = stockCost > 0 ? (stockReturn / stockCost) * 100 : 0;

    const bondValue = bondHoldings.reduce((sum, h) => sum + (h.currentValue ?? 0), 0);
    const bondReturn = bondHoldings.reduce((sum, h) => sum + (h.totalReturn ?? 0), 0);
    const bondCost = bondHoldings.reduce((sum, h) => sum + h.units * h.purchasePrice, 0);
    const bondReturnPercent = bondCost > 0 ? (bondReturn / bondCost) * 100 : 0;

    const commodityValue = commodityHoldings.reduce((sum, h) => sum + (h.currentValue ?? 0), 0);
    const commodityReturn = commodityHoldings.reduce((sum, h) => sum + (h.totalReturn ?? 0), 0);

    const totalValue = stockValue + bondValue + commodityValue;
    const totalReturn = stockReturn + bondReturn + commodityReturn;

    return {
      stockValue,
      stockReturn,
      stockReturnPercent,
      stockPercent: totalValue > 0 ? (stockValue / totalValue) * 100 : 0,
      bondValue,
      bondReturn,
      bondReturnPercent,
      bondPercent: totalValue > 0 ? (bondValue / totalValue) * 100 : 0,
      commodityValue,
      commodityReturn,
      commodityPercent: totalValue > 0 ? (commodityValue / totalValue) * 100 : 0,
      totalValue,
      totalReturn,
    };
  }, [stockHoldings, bondHoldings, commodityHoldings]);

  return (
    <div className="premium-card p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Asset Performance
      </h3>

      <div className="space-y-4">
        {/* Allocation Bar */}
        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
          {stats.stockPercent > 0 && (
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${stats.stockPercent}%` }}
            />
          )}
          {stats.bondPercent > 0 && (
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${stats.bondPercent}%` }}
            />
          )}
          {stats.commodityPercent > 0 && (
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${stats.commodityPercent}%` }}
            />
          )}
        </div>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stocks */}
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-primary/10">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium">Stocks</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {stats.stockPercent.toFixed(0)}%
              </span>
            </div>
            <p className="font-semibold number-display">
              K{stats.stockValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <p className={cn(
              'text-xs number-display',
              stats.stockReturn >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {stats.stockReturn >= 0 ? '+' : ''}{stats.stockReturnPercent.toFixed(1)}%
            </p>
          </div>

          {/* Bonds */}
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-blue-500/10">
                <Landmark className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Securities</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {stats.bondPercent.toFixed(0)}%
              </span>
            </div>
            <p className="font-semibold number-display">
              K{stats.bondValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <p className={cn(
              'text-xs number-display',
              stats.bondReturn >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {stats.bondReturn >= 0 ? '+' : ''}{stats.bondReturnPercent.toFixed(1)}%
            </p>
          </div>

          {/* Commodities */}
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-amber-500/10">
                <Package className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <span className="text-sm font-medium">Other</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {stats.commodityPercent.toFixed(0)}%
              </span>
            </div>
            <p className="font-semibold number-display">
              K{stats.commodityValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
