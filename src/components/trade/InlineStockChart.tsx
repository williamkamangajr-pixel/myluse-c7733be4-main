import { useMemo, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Brush } from 'recharts';
import { TrendingUp, TrendingDown, Activity, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Stock } from '@/lib/types';
import { Button } from '@/components/ui/button';

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y';

interface InlineStockChartProps {
  stock?: Stock | null;
  ticker?: string;
  isPositive?: boolean;
  showPeriodSelector?: boolean;
  showZoomControls?: boolean;
}

export function InlineStockChart({ 
  stock, 
  ticker, 
  isPositive: isPositiveProp,
  showPeriodSelector = true,
  showZoomControls = true,
}: InlineStockChartProps) {
  const [period, setPeriod] = useState<TimePeriod>('1D');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brushStart, setBrushStart] = useState<number | undefined>(undefined);
  const [brushEnd, setBrushEnd] = useState<number | undefined>(undefined);

  // Generate mock chart data based on period
  const chartData = useMemo(() => {
    const seedValue = ticker || stock?.ticker || 'DEFAULT';
    const seed = seedValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const pointsMap: Record<TimePeriod, number> = {
      '1D': 24,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
    };
    
    const points = pointsMap[period];
    const data: Array<{ time: string; value: number; index: number }> = [];
    let value = 100;
    
    for (let i = 0; i < points; i++) {
      const periodSeed = period.charCodeAt(0) + period.charCodeAt(1);
      const noise = Math.sin(seed + periodSeed + i * 0.5) * 15 + Math.cos(seed * 2 + i * 0.3) * 10;
      value = value + noise * 0.3;
      
      // Generate appropriate time labels
      let timeLabel = '';
      if (period === '1D') {
        timeLabel = `${String(i).padStart(2, '0')}:00`;
      } else if (period === '1W') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        timeLabel = days[i % 7];
      } else {
        const date = new Date();
        date.setDate(date.getDate() - (points - i));
        timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      data.push({ time: timeLabel, value: Math.max(50, Math.min(150, value)), index: i });
    }
    
    return data;
  }, [stock, ticker, period]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(1);
    setBrushStart(undefined);
    setBrushEnd(undefined);
  }, []);

  const handleBrushChange = useCallback((params: { startIndex?: number; endIndex?: number }) => {
    setBrushStart(params.startIndex);
    setBrushEnd(params.endIndex);
  }, []);

  const isPositive = isPositiveProp ?? (stock ? (stock.changePercent ?? 0) >= 0 : true);

  const periods: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y'];

  // Minimal inline chart (for Zambian card)
  if (ticker && !stock) {
    const strokeColor = isPositive ? 'hsl(152, 69%, 36%)' : 'hsl(0, 72%, 51%)';
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#gradient-${ticker})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (!stock) {
    return (
      <div className="premium-card p-6 flex items-center justify-center h-[200px]">
        <div className="text-center text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a stock to view chart</p>
        </div>
      </div>
    );
  }

  // Apply zoom to chart data range
  const visibleData = brushStart !== undefined && brushEnd !== undefined
    ? chartData.slice(brushStart, brushEnd + 1)
    : chartData;

  const minPrice = Math.min(...visibleData.map((d) => d.value)) * 0.99;
  const maxPrice = Math.max(...visibleData.map((d) => d.value)) * 1.01;

  return (
    <div className="premium-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{stock.ticker}</h3>
          <span className="text-xs text-muted-foreground">{period}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          {showZoomControls && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 4}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-success' : 'text-destructive'
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="number-display">
              {isPositive ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      {showPeriodSelector && (
        <div className="flex gap-1 mb-3">
          {periods.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-7 px-2 text-xs',
                period === p && 'bg-primary text-primary-foreground'
              )}
              onClick={() => {
                setPeriod(p);
                handleReset();
              }}
            >
              {p}
            </Button>
          ))}
        </div>
      )}

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: 'hsl(220, 10%, 55%)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis domain={[minPrice, maxPrice]} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  return (
                    <div className="premium-card p-2 text-xs shadow-lg border border-border">
                      <p className="text-muted-foreground">{payload[0].payload.time}</p>
                      <p className="font-semibold number-display">
                        K{value?.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
            {/* Brush for zooming/panning */}
            {showZoomControls && chartData.length > 10 && (
              <Brush
                dataKey="time"
                height={20}
                stroke="hsl(var(--primary))"
                fill="hsl(var(--muted))"
                startIndex={brushStart}
                endIndex={brushEnd}
                onChange={handleBrushChange}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
