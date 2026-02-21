import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Holding {
  id: string;
  stockTicker: string;
  sharesOwned: number;
  purchasePrice: number;
  status: string;
  tradeType?: string;
  currentValue?: number;
  totalReturn?: number;
  totalReturnPercent?: number;
  currentPrice?: number;
  stock?: {
    id?: string;
    name?: string;
  };
}

interface HoldingsTableProps {
  holdings: Holding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="premium-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Stock</TableHead>
            <TableHead className="text-right w-[60px]">Shares</TableHead>
            <TableHead className="text-right w-[80px]">Avg Cost</TableHead>
            <TableHead className="text-right w-[90px]">Value</TableHead>
            <TableHead className="text-right w-[70px]">Return</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => {
            const isPositive = (holding.totalReturn ?? 0) >= 0;
            const isPending = holding.status === 'pending';
            
            return (
              <TableRow key={holding.id} className={cn(isPending && 'opacity-60')}>
                <TableCell className="py-2">
                  <Link 
                    to={holding.stock?.id ? `/company/${holding.stock.id}` : '#'}
                    className="hover:text-primary transition-colors"
                  >
                    <div className="font-medium text-sm">{holding.stockTicker}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                      {holding.stock?.name}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm py-2">
                  {holding.sharesOwned.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm py-2">
                  K{holding.purchasePrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm py-2">
                  K{(holding.currentValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-right py-2">
                  <div className={cn(
                    'flex items-center justify-end gap-0.5 text-xs',
                    isPositive ? 'text-success' : 'text-destructive'
                  )}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="tabular-nums">
                      {isPositive ? '+' : ''}{(holding.totalReturnPercent ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function HoldingsCards({ holdings }: HoldingsTableProps) {
  return (
    <div className="space-y-2 md:hidden">
      {holdings.map((holding, index) => {
        const isPositive = (holding.totalReturn ?? 0) >= 0;
        const isPending = holding.status === 'pending';
        
        return (
          <div 
            key={holding.id}
            className={cn(
              'premium-card p-3 animate-fade-in',
              isPending && 'opacity-60'
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <Link 
                to={holding.stock?.id ? `/company/${holding.stock.id}` : '#'}
                className="hover:text-primary transition-colors flex-1 min-w-0"
              >
                <div className="font-semibold text-sm">{holding.stockTicker}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {holding.stock?.name}
                </div>
              </Link>
              <div className="text-right ml-2">
                <div className="font-semibold text-sm number-display">
                  K{(holding.currentValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
                <div className={cn(
                  'flex items-center justify-end gap-0.5 text-xs',
                  isPositive ? 'text-success' : 'text-destructive'
                )}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="number-display">
                    {isPositive ? '+' : ''}{(holding.totalReturnPercent ?? 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/30 text-[10px] text-muted-foreground">
              <span>{holding.sharesOwned.toLocaleString()} shares @ K{holding.purchasePrice.toFixed(2)}</span>
              {isPending && (
                <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning text-[9px]">Pending</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
