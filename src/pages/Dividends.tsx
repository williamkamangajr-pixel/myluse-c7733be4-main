import { PremiumLayout } from '@/components/layout';
import { useDividends } from '@/hooks/useDividends';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { BarChart3, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const DividendsPage = () => {
  const { dividendHistory, dividendSummary, portfolioDividends, isLoading } = useDividends();

  if (isLoading) {
    return (
      <PremiumLayout>
        <LoadingFallback type="page" />
      </PremiumLayout>
    );
  }

  // Get upcoming dividends (future dates)
  const today = new Date();
  const upcomingDividends = dividendHistory.filter(d => new Date(d.exDividendDate) >= today);
  const totalDividendIncome = dividendSummary.totalAnnualIncome;

  // Group dividends by month for chart
  const monthlyData = dividendHistory.reduce((acc, div) => {
    const month = new Date(div.exDividendDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const existing = acc.find(d => d.month === month);
    if (existing) {
      existing.amount += div.dividendPerShare;
    } else {
      acc.push({ month, amount: div.dividendPerShare });
    }
    return acc;
  }, [] as { month: string; amount: number }[]);

  return (
    <PremiumLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Dividend Calendar</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="zambian-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-white/70" />
              <span className="text-xs text-white/70">Total Income</span>
            </div>
            <p className="text-2xl font-bold text-white number-display">
              K{totalDividendIncome.toFixed(2)}
            </p>
          </div>
          <div className="zambian-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-white/70" />
              <span className="text-xs text-white/70">Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-white number-display">
              {upcomingDividends.length}
            </p>
          </div>
        </div>

        {/* Dividend Chart */}
        {monthlyData.length > 0 && (
          <div className="premium-card">
            <h2 className="font-semibold mb-4">Dividend History</h2>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 15%, 11%)',
                      border: '1px solid hsl(220, 12%, 18%)',
                      borderRadius: '8px',
                      color: 'hsl(40, 15%, 95%)',
                    }}
                    formatter={(value: number) => [`K${value.toFixed(2)}`, 'Dividend']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(25, 75%, 50%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Upcoming Dividends */}
        <div className="premium-card">
          <h2 className="font-semibold mb-4">Upcoming Dividends</h2>
          {upcomingDividends.length > 0 ? (
            <div className="space-y-2">
              {upcomingDividends.map((div) => (
                <div 
                  key={div.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-xs font-bold text-primary">
                        {div.stockTicker.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{div.stockTicker}</p>
                      <p className="text-xs text-muted-foreground">
                        Ex-Div: {new Date(div.exDividendDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success number-display">
                      K{div.dividendPerShare.toFixed(4)}
                    </p>
                    <p className="text-xs text-muted-foreground">{div.dividendType || 'Cash'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">No upcoming dividends</p>
            </div>
          )}
        </div>

        {/* Past Dividends */}
        <div className="premium-card">
          <h2 className="font-semibold mb-4">Dividend History</h2>
          {dividendHistory.length > 0 ? (
            <div className="space-y-2">
              {dividendHistory.slice(0, 10).map((div) => (
                <div 
                  key={div.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <span className="text-xs font-bold text-muted-foreground">
                        {div.stockTicker.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{div.stockTicker}</p>
                      <p className="text-xs text-muted-foreground">
                        Paid: {div.paymentDate ? new Date(div.paymentDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold number-display">
                      K{div.dividendPerShare.toFixed(4)}
                    </p>
                    <p className="text-xs text-muted-foreground">{div.dividendType || 'Cash'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">No dividend history available</p>
            </div>
          )}
        </div>
      </div>
    </PremiumLayout>
  );
};

export default DividendsPage;
