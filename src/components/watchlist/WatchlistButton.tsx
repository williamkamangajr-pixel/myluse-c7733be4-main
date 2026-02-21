import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Button } from '@/components/ui/button';

interface WatchlistButtonProps {
  ticker: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export function WatchlistButton({ ticker, className, size = 'icon' }: WatchlistButtonProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist, isLoading } = useWatchlist();

  const isWatched = watchlist.some((item) => item.stockTicker === ticker);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWatched) {
      const item = watchlist.find((w) => w.stockTicker === ticker);
      if (item) {
        removeFromWatchlist(item.id);
      }
    } else {
      addToWatchlist(ticker);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        'transition-all duration-200 hover:scale-110 touch-press',
        isWatched && 'text-primary',
        className
      )}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Star
        className={cn(
          'h-4 w-4 transition-all',
          isWatched && 'fill-primary'
        )}
      />
    </Button>
  );
}
