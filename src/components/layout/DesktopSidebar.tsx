import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  Landmark,
  BarChart3,
  ArrowLeftRight,
  Clock,
  LineChart,
  Star,
  User,
  Store
} from 'lucide-react';
import myluseLogo from '@/assets/myluse-logo.png';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/stocks', label: 'Stocks', icon: BarChart3 },
  { href: '/trade', label: 'Trade', icon: ArrowLeftRight },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/portfolio', label: 'Portfolio', icon: Clock },
  { href: '/more', label: 'More', icon: Landmark },
];

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    navigate(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[200px] flex-col border-r border-border/50 bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border/50 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={myluseLogo} 
            alt="MyLuSE" 
            className="h-9 w-auto object-contain"
          />
          <span className="text-sm font-semibold text-foreground">MyLuSE</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 tab-glow',
                    isActive
                      ? 'bg-primary/15 text-primary active'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile Link */}
      <div className="border-t border-border/50 p-3">
        <button
          onClick={() => handleNavClick('/profile')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 tab-glow',
            location.pathname === '/profile'
              ? 'bg-primary/15 text-primary active'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
          )}
        >
          <User className="h-4 w-4" />
          Profile
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-3">
        <p className="text-center text-2xs text-muted-foreground">
          Data from{' '}
          <a
            href="https://luse.co.zm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            luse.co.zm
          </a>
        </p>
      </div>
    </aside>
  );
}
