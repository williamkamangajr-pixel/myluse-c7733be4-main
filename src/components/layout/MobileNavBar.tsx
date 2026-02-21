import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BarChart3, 
  ArrowLeftRight, 
  Store,
  MoreHorizontal
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/stocks', label: 'Stocks', icon: BarChart3 },
  { href: '/trade', label: 'Trade', icon: ArrowLeftRight },
  { href: '/marketplace', label: 'Market', icon: Store },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

export function MobileNavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-lg pb-safe lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/' && location.pathname === '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 transition-all duration-200 touch-press nav-glow-mobile',
                isActive
                  ? 'text-primary active'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-2xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
