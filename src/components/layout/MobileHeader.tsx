import { RefreshCw, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import myluseLogo from '@/assets/myluse-logo.png';

interface MobileHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MobileHeader({ onRefresh, isRefreshing }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg pt-safe lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={myluseLogo} 
            alt="MyLuSE" 
            className="h-8 w-auto object-contain"
          />
          <span className="text-sm font-semibold text-foreground">MyLuSE</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Portfolio Icon */}
          <Link
            to="/portfolio"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground touch-press"
            aria-label="Portfolio"
          >
            <Briefcase className="h-5 w-5" />
          </Link>
          
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground touch-press disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw className={cn('h-5 w-5', isRefreshing && 'animate-spin')} />
            </button>
          )}
          
          {/* Notifications */}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
