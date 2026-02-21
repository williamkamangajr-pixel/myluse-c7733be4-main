import { PremiumLayout } from '@/components/layout';
import { useWatchlist } from '@/hooks/useWatchlist';
import { StockMiniCard } from '@/components/dashboard/StockMiniCard';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { Eye, Star, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const WatchlistPage = () => {
  const { watchlist, isLoading } = useWatchlist();

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Watchlist</h1>
            </div>
            <p className="text-sm text-muted-foreground">Watch market performance</p>
          </div>
          <Link to="/stocks">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <BarChart3 className="h-4 w-4" />
              Browse Market
            </Button>
          </Link>
        </div>

        {watchlist.length > 0 ? (
          <div className="space-y-2 stagger-children">
            {watchlist.map((item, index) => 
              item.stock ? (
                <div 
                  key={item.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <StockMiniCard stock={item.stock} />
                </div>
              ) : null
            )}
          </div>
        ) : (
          /* Empty State - Premium themed (no Zambian flag) */
          <div className="premium-card flex flex-col items-center justify-center py-16 text-center">
            <Star className="mb-4 h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
            <h2 className="text-lg font-semibold">No items in watchlist</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Start adding stocks, securities, or commodities to track their performance
            </p>
            <Link to="/stocks">
              <Button className="mt-6 gap-2 bg-primary hover:bg-primary/90">
                Browse Market
              </Button>
            </Link>
          </div>
        )}
      </div>
    </PremiumLayout>
  );
};

export default WatchlistPage;