import { useState } from 'react';
import { PremiumLayout } from '@/components/layout';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';
import { formatZMW, formatPercent } from '@/lib/mockData';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  BarChart3,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { CancelOrderDialog } from '@/components/portfolio/CancelOrderDialog';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Line,
} from 'recharts';

const PortfolioPage = () => {
  const { holdings, summary, isLoading, rawHoldings, removeHolding } = usePortfolio();
  const [activeTab, setActiveTab] = useState('overview');
  const [cancellingOrder, setCancellingOrder] = useState<{
    id: string;
    ticker: string;
    type: 'stock' | 'bond';
    tradeType: 'buy' | 'sell';
    amount: number;
  } | null>(null);

  useRealtimePortfolio();

  if (isLoading) {
    return (
      <PremiumLayout>
        <LoadingFallback type="page" />
      </PremiumLayout>
    );
  }

  const isPositive = summary.totalGainLoss >= 0;

  // Filter by status for pending orders
  const pendingOrders = rawHoldings?.filter(h => h.status === 'pending') || [];
  const completedHoldings = holdings;

  // Generate performance chart data
  const performanceData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    const baseValue = summary.totalValue * 0.9;
    const variance = summary.totalValue * 0.15 * (Math.sin(i / 5) + (Math.random() - 0.5) * 0.3);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(baseValue + (variance * i / 30)),
    };
  });

  return (
    <PremiumLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">My Portfolio</h1>
            <p className="text-sm text-muted-foreground">Unified investment portfolio</p>
          </div>
          <Link to="/trade">
            <Button className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Trade
            </Button>
          </Link>
        </div>

        {/* Asset Type Tabs - Only Overview and Stocks */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
            <TabsTrigger 
              value="overview" 
              className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm tab-glow"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="stocks" 
              className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm tab-glow"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Stocks
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Portfolio Value Card - Premium themed (no Zambian flag) */}
            <div className="premium-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
              </div>
              
              <p className="text-3xl font-bold number-display">
                K{summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              
              <div className={cn(
                'mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium',
                isPositive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
              )}>
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                K{Math.abs(summary.totalGainLoss).toFixed(2)} ({formatPercent(summary.totalGainLossPercent)})
              </div>

              {/* Stats Row */}
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border/30 pt-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Invested</p>
                  <p className="mt-1 font-semibold number-display">
                    K{summary.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Holdings</p>
                  <p className="mt-1 font-semibold number-display">
                    {summary.holdingsCount}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Return %</p>
                  <p className={cn(
                    'mt-1 font-semibold number-display',
                    isPositive ? 'text-success' : 'text-destructive'
                  )}>
                    {formatPercent(summary.totalGainLossPercent)}
                  </p>
                </div>
              </div>
            </div>

            {/* Asset Breakdown */}
            <div className="premium-card">
              <h3 className="mb-4 font-semibold">Asset Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Stocks</p>
                      <p className="text-xs text-muted-foreground">
                        {completedHoldings.length} holdings {pendingOrders.length > 0 && (
                          <span className="text-primary">({pendingOrders.length} pending)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold number-display">
                      K{summary.totalValue.toFixed(1)}
                    </p>
                    <p className={cn(
                      'text-xs',
                      isPositive ? 'text-success' : 'text-destructive'
                    )}>
                      {formatPercent(summary.totalGainLossPercent)}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div className="premium-card">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Pending Orders ({pendingOrders.length})</h3>
                </div>
                <div className="space-y-2">
                  {pendingOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="font-medium">{order.stockTicker}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          STOCK
                        </span>
                        <span className={cn(
                          'rounded px-1.5 py-0.5 text-xs',
                          order.tradeType === 'buy' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-destructive/20 text-destructive'
                        )}>
                          {order.tradeType.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold number-display">
                          K{(order.sharesOwned * order.purchasePrice).toFixed(0)}
                        </span>
                        <button
                          onClick={() => setCancellingOrder({
                            id: order.id,
                            ticker: order.stockTicker,
                            type: 'stock',
                            tradeType: order.tradeType,
                            amount: order.sharesOwned * order.purchasePrice,
                          })}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Performance Chart */}
            <div className="premium-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Portfolio Performance (30 Days)</h3>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(25, 75%, 50%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(25, 75%, 50%)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                      tickFormatter={(v) => `K${(v/1000).toFixed(0)}k`}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220, 15%, 11%)',
                        border: '1px solid hsl(220, 12%, 18%)',
                        borderRadius: '8px',
                        color: 'hsl(40, 15%, 95%)',
                      }}
                      formatter={(value: number) => [`K${value.toLocaleString()}`, 'Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(25, 75%, 50%)"
                      strokeWidth={2}
                      fill="url(#performanceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* Stocks Tab */}
          <TabsContent value="stocks" className="mt-4">
            {completedHoldings.length > 0 ? (
              <HoldingsTable 
                holdings={completedHoldings.map(h => ({
                  ...h,
                  totalReturn: h.gainLoss,
                  totalReturnPercent: h.gainLossPercent,
                }))} 
              />
            ) : (
              <div className="premium-card py-12 text-center">
                <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium">No stock holdings yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start trading to build your portfolio</p>
                <Link to="/trade">
                  <Button className="mt-4">Start Trading</Button>
                </Link>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        open={cancellingOrder !== null}
        onOpenChange={(open) => !open && setCancellingOrder(null)}
        order={cancellingOrder}
        onSuccess={() => {
          setCancellingOrder(null);
        }}
      />
    </PremiumLayout>
  );
};

export default PortfolioPage;
