import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PremiumLayout } from '@/components/layout';
import { useStock } from '@/hooks/useStocks';
import { useWatchlist } from '@/hooks/useWatchlist';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { useTradeSummaries } from '@/hooks/useTradeSummaries';
import { formatZMW, formatPercent, formatLargeNumber } from '@/lib/mockData';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Building2,
  Globe,
  Users,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const CompanyPage = () => {
  const { id } = useParams<{ id: string }>();
  const { stock, isLoading } = useStock(id || '');
  const { isInWatchlist, toggleWatchlist, isToggling } = useWatchlist();
  const { priceHistory } = usePriceHistory(id || '');
  const { summaries } = useTradeSummaries(id || '');
  const [chartPeriod, setChartPeriod] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');

  if (isLoading) {
    return (
      <PremiumLayout>
        <LoadingFallback type="page" />
      </PremiumLayout>
    );
  }

  if (!stock) {
    return (
      <PremiumLayout>
        <div className="py-16 text-center">
          <h1 className="text-xl font-bold">Stock not found</h1>
          <p className="mt-2 text-muted-foreground">
            The stock with ticker "{id}" could not be found.
          </p>
          <Link to="/stocks">
            <Button className="mt-4">Browse Stocks</Button>
          </Link>
        </div>
      </PremiumLayout>
    );
  }

  const isPositive = stock.changePercent >= 0;
  const inWatchlist = isInWatchlist(stock.ticker);

  // Generate mock price history for chart
  const generatePriceData = () => {
    const data = [];
    const days = chartPeriod === '1W' ? 7 : chartPeriod === '1M' ? 30 : chartPeriod === '3M' ? 90 : 365;
    const basePrice = stock.currentPrice * 0.95;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const variation = (Math.random() - 0.5) * stock.currentPrice * 0.1;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: basePrice + (stock.currentPrice - basePrice) * (i / days) + variation,
      });
    }
    return data;
  };

  const priceData = priceHistory.length > 0 
    ? priceHistory.map(p => ({ date: p.date, price: p.closePrice }))
    : generatePriceData();

  // Stock analysis radar data
  const radarData = [
    { metric: 'Value', value: 2.5, fullMark: 5 },
    { metric: 'Growth', value: 3.0, fullMark: 5 },
    { metric: 'Health', value: 3.0, fullMark: 5 },
    { metric: 'Dividends', value: 1.0, fullMark: 5 },
    { metric: 'Performance', value: 2.5, fullMark: 5 },
  ];

  const overallScore = radarData.reduce((sum, d) => sum + d.value, 0) / radarData.length;

  // Revenue & Earnings mock data
  const financialData = [
    { year: '2020', revenue: 95000, earnings: 42000 },
    { year: '2021', revenue: 110000, earnings: 48000 },
    { year: '2022', revenue: 125000, earnings: 55000 },
    { year: '2023', revenue: 140000, earnings: 62000 },
    { year: '2024', revenue: 165000, earnings: 78000 },
  ];

  return (
    <PremiumLayout>
      <div className="space-y-4">
        {/* Back Button */}
        <Link 
          to="/stocks" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stocks
        </Link>

        {/* Company Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary font-bold text-lg">
              {stock.ticker.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{stock.name}</h1>
                <Badge variant="secondary" className="text-xs">{stock.ticker}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{stock.sector || 'General'}</p>
              {stock.website && (
                <a 
                  href={stock.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  Visit Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleWatchlist(stock.ticker)}
            disabled={isToggling}
            className={cn(inWatchlist && 'text-primary border-primary/50 bg-primary/10')}
          >
            <Star className={cn('h-4 w-4', inWatchlist && 'fill-current')} />
          </Button>
        </div>

        {/* Current Price */}
        <div className="premium-card">
          <p className="text-xs text-muted-foreground mb-1">Current Price</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold number-display">K{stock.currentPrice.toFixed(2)}</p>
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              isPositive ? 'text-success' : 'text-destructive'
            )}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}
              <span className="text-xs">({formatPercent(stock.changePercent)})</span>
            </div>
          </div>
        </div>

        {/* Price History Chart */}
        <div className="premium-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Price History</h2>
            <div className="flex gap-1">
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
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 69%, 36%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(152, 69%, 36%)" stopOpacity={0.05} />
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
                  hide 
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 15%, 11%)',
                    border: '1px solid hsl(220, 12%, 18%)',
                    borderRadius: '8px',
                    color: 'hsl(40, 15%, 95%)',
                  }}
                  formatter={(value: number) => [`K${value.toFixed(2)}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(152, 69%, 36%)"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Trade Summary */}
        <div className="premium-card">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Daily Trade Summary</h2>
          </div>
          {summaries.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="font-semibold number-display">
                  {summaries[0]?.volumeTraded?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Value Traded</p>
                <p className="font-semibold number-display">
                  K{((summaries[0]?.valueTraded || 0) / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No trade summary data available for {stock.ticker}
            </p>
          )}
        </div>

        {/* Revenue & Earnings Chart */}
        <div className="premium-card">
          <h2 className="font-semibold mb-4">Revenue & Earnings (ZMW Millions)</h2>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} barGap={4}>
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 15%, 11%)',
                    border: '1px solid hsl(220, 12%, 18%)',
                    borderRadius: '8px',
                    color: 'hsl(40, 15%, 95%)',
                  }}
                  formatter={(value: number) => [`K${(value / 1000).toFixed(0)}M`, '']}
                />
                <Bar dataKey="revenue" fill="hsl(25, 75%, 50%)" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="earnings" fill="hsl(30, 85%, 55%)" radius={[4, 4, 0, 0]} name="Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-accent" />
              <span className="text-xs text-muted-foreground">Earnings</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="premium-card">
          <h2 className="font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="font-semibold number-display">
                K{stock.marketCap ? formatLargeNumber(stock.marketCap) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">P/E Ratio</p>
              <p className="font-semibold number-display">
                {stock.peRatio?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dividend Yield</p>
              <p className="font-semibold number-display">
                {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">52W High</p>
              <p className="font-semibold number-display">
                K{stock.high52w?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">52W Low</p>
              <p className="font-semibold number-display">
                K{stock.low52w?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="font-semibold number-display">
                {stock.volume?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Previous Close</p>
              <p className="font-semibold number-display">
                K{stock.previousClose?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Assets</p>
              <p className="font-semibold number-display">K19.45B</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Equity</p>
              <p className="font-semibold number-display">K11.67B</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Debt to Equity</p>
              <p className="font-semibold number-display">0.67</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Ratio</p>
              <p className="font-semibold number-display">1.80</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Return on Equity</p>
              <p className="font-semibold number-display">15.0%</p>
            </div>
          </div>
        </div>

        {/* Stock Analysis Radar */}
        <div className="premium-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Stock Analysis</h2>
            <span className="text-2xl font-bold text-primary number-display">{overallScore.toFixed(1)}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {stock.name}'s overall score: {overallScore >= 3 ? 'Good' : overallScore >= 2 ? 'Fair' : 'Poor'}
          </p>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(220, 12%, 20%)" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: 'hsl(220, 10%, 65%)', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 5]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="hsl(25, 75%, 50%)"
                  fill="hsl(25, 75%, 50%)"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-5 gap-2 mt-4 border-t border-border/30 pt-4">
            {radarData.map((item) => (
              <div key={item.metric} className="text-center">
                <p className="text-xs text-muted-foreground">{item.metric}</p>
                <p className="text-lg font-bold text-primary number-display">{item.value.toFixed(1)}</p>
              </div>
            ))}
          </div>

          {/* What does this mean */}
          <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm space-y-1">
            <p className="font-medium mb-2">What does this mean?</p>
            <p><span className="font-medium text-primary">Value:</span> Is the stock fairly priced based on earnings and assets?</p>
            <p><span className="font-medium text-primary">Growth:</span> Are revenue and earnings growing?</p>
            <p><span className="font-medium text-primary">Health:</span> How strong is the balance sheet?</p>
            <p><span className="font-medium text-primary">Dividends:</span> Does it pay reliable dividends?</p>
            <p><span className="font-medium text-primary">Performance:</span> How has the stock performed recently?</p>
          </div>
        </div>

        {/* About Company */}
        <div className="premium-card">
          <h2 className="font-semibold mb-3">About {stock.name}</h2>
          <p className="text-sm text-muted-foreground">
            {stock.description || `${stock.name} is a leading ${stock.sector?.toLowerCase() || 'company'} listed on the Lusaka Securities Exchange (LuSE). The company has established itself as a key player in Zambia's economy, contributing significantly to the nation's growth and development.`}
          </p>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            {stock.sector && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Sector</p>
                  <p className="text-sm font-medium">{stock.sector}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Headquarters</p>
                <p className="text-sm font-medium">{stock.headquarters || 'Lusaka, Zambia'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Founded</p>
                <p className="text-sm font-medium">{stock.foundedYear || '1990'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="text-sm font-medium">{stock.employees?.toLocaleString() || '3,807'}</p>
              </div>
            </div>
          </div>

          {/* CEO info */}
          <div className="mt-4 rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Chief Executive Officer</p>
            <p className="font-medium">CEO Information Not Available</p>
          </div>
        </div>

        {/* Trade Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/trade" className="w-full">
            <Button className="w-full" size="lg">Buy</Button>
          </Link>
          <Link to="/trade" className="w-full">
            <Button variant="secondary" className="w-full" size="lg">Sell</Button>
          </Link>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default CompanyPage;
