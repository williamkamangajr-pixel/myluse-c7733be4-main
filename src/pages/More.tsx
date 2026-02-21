import { Link } from 'react-router-dom';
import { 
  Wallet, 
  DollarSign, 
  BarChart3, 
  Star, 
  User, 
  ChevronRight,
  LineChart
} from 'lucide-react';
import { PremiumLayout } from '@/components/layout';
import myluseLogo from '@/assets/myluse-logo.png';

const menuItems = [
  { href: '/securities', label: 'Securities', icon: Wallet, description: 'Bonds & Treasury Bills' },
  { href: '/charts', label: 'Charts', icon: LineChart, description: 'Market Analytics' },
  { href: '/dividends', label: 'Dividends', icon: BarChart3, description: 'Income Calendar' },
  { href: '/watchlist', label: 'Watchlist', icon: Star, description: 'Your Favorites' },
  { href: '/profile', label: 'Profile', icon: User, description: 'Settings & Preferences' },
];

const MorePage = () => {
  return (
    <PremiumLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">More</h1>
        
        <div className="space-y-2 stagger-children">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80 touch-press glow-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            );
          })}
        </div>

        {/* App Info */}
        <div className="mt-8 rounded-xl border border-border/50 bg-card p-4 text-center">
          <div className="mb-3 flex justify-center">
            <img 
              src={myluseLogo} 
              alt="MyLuSE" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <h2 className="font-semibold">MyLuSE</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your gateway to the Zambian Stock Market
          </p>
          <p className="mt-2 text-2xs text-muted-foreground">
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
      </div>
    </PremiumLayout>
  );
};

export default MorePage;
