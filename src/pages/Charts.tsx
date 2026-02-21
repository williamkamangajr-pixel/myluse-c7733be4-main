import { useState } from 'react';
import { PremiumLayout } from '@/components/layout';
import { LASIChart } from '@/components/charts/LASIChart';
import { MarketHeatmap } from '@/components/charts/MarketHeatmap';
import { SectorPerformanceChart } from '@/components/charts/SectorPerformanceChart';
import { StockComparisonChart } from '@/components/charts/StockComparisonChart';
import { useLASI } from '@/hooks/useLASI';
import { useStocks } from '@/hooks/useStocks';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, Grid3X3, BarChart3, RefreshCw, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Line,
} from 'recharts';

const ChartsPage = () => {
  const { history, current, isLoading: lasiLoading } = useLASI();
  const { stocks, isLoading: stocksLoading, marketSummary } = useStocks();
  const [activeTab, setActiveTab] = useState('performance');
  const [chartPeriod, setChartPeriod] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');

  if (lasiLoading || stocksLoading) {
    return (
      <PremiumLayout>
        <LoadingFallback type="page" />
      </PremiumLayout>
    );
  }

  // Calculate summary data from market summary
  const lasiSummary = {
    currentValue: current?.indexValue || marketSummary.indexValue,
    change: current?.indexChange || marketSummary.indexChange,
    changePercent: current?.indexChangePercent || marketSummary.indexChangePercent,
    trades: 616,
    volumeTraded: current?.totalVolume || marketSummary.totalVolume,
    valueTraded: current?.totalValueTraded || marketSummary.totalValueTraded,
  };

  // Determine trend analysis
  const trendStatus = lasiSummary.change >= 0 ? 'BULLISH' : 'BEARISH';
  const trendIntensity = Math.abs(lasiSummary.changePercent) > 1 ? 'Strong' : 'Moderate';

  // Generate mock bond yield data
  const bondYieldData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yield: 11.5 + Math.sin(i / 3) * 0.8 + (Math.random() - 0.5) * 0.3,
    };
  });

  const currentYield = bondYieldData[bondYieldData.length - 1]?.yield || 12;

  // Generate portfolio performance data
  const generatePerformanceData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    let portfolioValue = 100000;
    let marketValue = 100000;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      portfolioValue += (Math.random() - 0.45) * 2000;
      marketValue += (Math.random() - 0.5) * 1500;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        portfolio: Math.round(portfolioValue),
        market: Math.round(marketValue),
      });
    }
    return data;
  };

  const performanceData = generatePerformanceData();
  const portfolioReturn = ((performanceData[performanceData.length - 1].portfolio - performanceData[0].portfolio) / performanceData[0].portfolio * 100).toFixed(2);

  return (
    <PremiumLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Charts & Analysis</h1>
            <p className="text-sm text-muted-foreground">LuSE Market Overview</p>
          </div>
          <Link to="/stocks">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              View Stock
            </Button>
          </Link>
        </div>

        {/* LASI Summary Card - Premium themed (no Zambian flag) */}
        <div className="premium-card p-4">
          <h2 className="mb-4 text-lg font-semibold">LASI Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Current Value
              </div>
              <p className="mt-1 text-xl font-bold number-display">
                {lasiSummary.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Change
              </div>
              <p className={cn(
                'mt-1 text-xl font-bold number-display',
                lasiSummary.change >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {lasiSummary.change >= 0 ? '+' : ''}{lasiSummary.change.toFixed(2)}
              </p>
              <p className={cn(
                'text-sm',
                lasiSummary.change >= 0 ? 'text-success/80' : 'text-destructive/80'
              )}>
                {lasiSummary.changePercent.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                Trades
              </div>
              <p className="mt-1 text-xl font-bold number-display">
                {lasiSummary.trades.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Volume Traded
              </div>
              <p className="mt-1 text-xl font-bold number-display">
                {lasiSummary.volumeTraded.toLocaleString()}
              </p>
            </div>
            <div className="col-span-2 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-primary">K</span>
                Value Traded
              </div>
              <p className="mt-1 text-xl font-bold number-display">
                K{(lasiSummary.valueTraded / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>
        </div>

        {/* LASI Index Chart */}
        <div className="premium-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">LuSE All Share Index (LASI)</h2>
            </div>
            <div className={cn(
              'flex items-center gap-1.5 text-sm font-medium',
              lasiSummary.change >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {lasiSummary.change >= 0 ? '+' : ''}{lasiSummary.change.toFixed(2)} ({lasiSummary.changePercent.toFixed(2)}%)
            </div>
          </div>

          {/* Period Tabs */}
          <div className="flex gap-1 mb-4">
            {(['1W', '1M', '3M', '1Y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-all',
                  chartPeriod === period 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {period}
              </button>
            ))}
          </div>

          <LASIChart history={history} current={current} />
          
          {/* Trend Analysis */}
          <div className="mt-4 border-t border-border/30 pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Trend Analysis</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                trendStatus === 'BULLISH' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
              )}>
                {trendIntensity} {trendStatus}
              </span>
              <span className="text-xs text-muted-foreground">
                {trendStatus === 'BULLISH' 
                  ? 'Short-term momentum above long-term average'
                  : 'Short-term momentum below long-term average'}
              </span>
            </div>
          </div>
        </div>


        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger 
              value="performance" 
              className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm tab-glow"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="heatmap" 
              className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm tab-glow"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger 
              value="sectors" 
              className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm tab-glow"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Sectors
            </TabsTrigger>
            <TabsTrigger 
              value="compare" 
              className="gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm tab-glow"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-4">
            <div className="premium-card">
              <h3 className="font-semibold mb-2">Portfolio vs Market Performance</h3>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className={cn(
                  'text-lg font-bold',
                  parseFloat(portfolioReturn) >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {parseFloat(portfolioReturn) >= 0 ? '+' : ''}{portfolioReturn}%
                </span>
                <span className="text-sm text-muted-foreground">(K26)</span>
              </div>
              
              {/* Period Selector */}
              <div className="flex gap-1 mb-4">
                {['7D', '1M', '3M', 'YTD', '1Y'].map((period) => (
                  <button
                    key={period}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full transition-all',
                      period === '1M' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(25, 75%, 50%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(25, 75%, 50%)" stopOpacity={0} />
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
                    />
                    <Line 
                      type="monotone" 
                      dataKey="market" 
                      stroke="hsl(220, 10%, 55%)" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      name="LuSE All Share Index"
                    />
                    <Area
                      type="monotone"
                      dataKey="portfolio"
                      stroke="hsl(25, 75%, 50%)"
                      strokeWidth={2}
                      fill="url(#portfolioGradient)"
                      name="Your Portfolio"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 bg-muted-foreground" style={{ borderStyle: 'dashed' }} />
                  <span className="text-xs text-muted-foreground">LuSE All Share Index</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 bg-primary" />
                  <span className="text-xs text-muted-foreground">Your Portfolio</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="heatmap" className="mt-4">
            <div className="premium-card">
              <MarketHeatmap stocks={stocks} />
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="mt-4">
            <div className="premium-card">
              <SectorPerformanceChart stocks={stocks} />
            </div>
          </TabsContent>

          <TabsContent value="compare" className="mt-4">
            <div className="premium-card">
              <h3 className="font-semibold mb-2">Stock Comparison</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Compare normalized price performance of up to 3 stocks (rebased to 100).
              </p>
              <StockComparisonChart stocks={stocks} priceHistory={[]} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PremiumLayout>
  );
};

export default ChartsPage;
