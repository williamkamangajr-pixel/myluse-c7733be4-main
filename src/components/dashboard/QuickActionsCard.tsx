import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Briefcase, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActionsCard() {
  return (
    <div className="premium-card">
      <h3 className="mb-3 text-sm font-semibold">Quick Actions</h3>
      
      <div className="space-y-2">
        <Link to="/trade" className="block">
          <Button className="w-full justify-between" size="lg">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trade Now
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <Link to="/portfolio" className="block">
          <Button variant="secondary" className="w-full justify-between" size="lg">
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              View Portfolio
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <Link to="/stocks" className="block">
          <Button variant="outline" className="w-full justify-between" size="lg">
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse Market
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
