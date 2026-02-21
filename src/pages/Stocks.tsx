import { PremiumLayout } from '@/components/layout';
import { useStocks } from '@/hooks/useStocks';
import { useRealtimeStocks } from '@/hooks/useRealtimeSubscriptions';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { Search, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const sectors = ['All Sectors', 'Banking', 'Mining', 'Agriculture', 'Manufacturing', 'Energy', 'Telecommunications', 'Retail', 'Consumer Goods', 'Insurance', 'Industrial'];

const StocksPage = () => {
  const { stocks, isLoading, isFetching, marketSummary } = useStocks();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All Sectors');

  // Enable real-time updates from database
  useRealtimeStocks();

  const filteredStocks = useMemo(() => {
    let result = stocks;
    
    if (selectedSector !== 'All Sectors') {
      result = result.filter(stock => stock.sector === selectedSector);
    }
    
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (stock) =>
          stock.ticker.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query) ||
          stock.sector?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [stocks, search, selectedSector]);

  if (isLoading) {
    return (
      <PremiumLayout>
        <LoadingFallback type="list" />
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="space-y-4">
        {/* Auto-update indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isFetching ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span>Updating prices...</span>
              </>
            ) : marketSummary?.lastUpdated ? (
              <span>Live prices • Updated {new Date(marketSummary.lastUpdated).toLocaleTimeString()}</span>
            ) : (
              <span>Live prices from LuSE</span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>

        {/* Sector Filters */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {sectors.map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  selectedSector === sector
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {sector}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Orange accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-transparent rounded-full" />

        {/* Stock List */}
        <div className="space-y-2">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => {
              const isPositive = (stock.changePercent ?? 0) >= 0;
              
              return (
                <Link 
                  key={stock.id} 
                  to={`/company/${stock.ticker}`}
                  className="block"
                >
                  <div className="premium-card p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-base">{stock.ticker}</h3>
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                          {stock.sector || 'Other'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{stock.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold number-display">
                          K{stock.currentPrice.toFixed(2)}
                        </span>
                        <div className={cn(
                          'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded',
                          isPositive ? 'text-success' : 'text-destructive'
                        )}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span className="number-display">
                            {isPositive ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No stocks found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </PremiumLayout>
  );
};

export default StocksPage;
