import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockMiniCard } from './StockMiniCard';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface TopMoversSectionProps {
  gainers: Stock[];
  losers: Stock[];
  active: Stock[];
}

export function TopMoversSection({ gainers, losers, active }: TopMoversSectionProps) {
  return (
    <div className="premium-card">
      <Tabs defaultValue="gainers" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger
            value="gainers"
            className={cn(
              'gap-1.5 text-xs data-[state=active]:bg-success/10 data-[state=active]:text-success'
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Gainers
          </TabsTrigger>
          <TabsTrigger
            value="losers"
            className={cn(
              'gap-1.5 text-xs data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive'
            )}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Losers
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className={cn(
              'gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary'
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gainers" className="mt-0 space-y-2 stagger-children">
          {gainers.length > 0 ? (
            gainers.map((stock, index) => (
              <StockMiniCard key={stock.id} stock={stock} index={index} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No gaining stocks today
            </p>
          )}
        </TabsContent>

        <TabsContent value="losers" className="mt-0 space-y-2 stagger-children">
          {losers.length > 0 ? (
            losers.map((stock, index) => (
              <StockMiniCard key={stock.id} stock={stock} index={index} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No declining stocks today
            </p>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-0 space-y-2 stagger-children">
          {active.length > 0 ? (
            active.map((stock, index) => (
              <StockMiniCard key={stock.id} stock={stock} index={index} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No trading activity today
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
