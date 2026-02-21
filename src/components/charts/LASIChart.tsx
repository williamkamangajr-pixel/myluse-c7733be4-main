import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LASIHistory, MarketSummary } from '@/lib/types';

interface LASIChartProps {
  history: LASIHistory[];
  current: MarketSummary | null;
}

export function LASIChart({ history, current }: LASIChartProps) {
  const chartData = useMemo(() => {
    return history.map((item) => ({
      date: item.date,
      value: item.value,
      formattedDate: new Date(item.date).toLocaleDateString('en-ZM', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [history]);

  const minValue = Math.min(...chartData.map((d) => d.value)) * 0.98;
  const maxValue = Math.max(...chartData.map((d) => d.value)) * 1.02;

  const change = current?.indexChange ?? 0;
  const isPositive = change >= 0;

  return (
    <div className="premium-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">LASI Index</h2>
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
            {isPositive ? '+' : ''}{change.toFixed(2)} ({current?.indexChangePercent?.toFixed(2) ?? 0}%)
          </span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lasiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minValue, maxValue]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.toLocaleString()}
              width={50}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="premium-card p-2 shadow-lg border border-border">
                      <p className="text-xs text-muted-foreground">{data.formattedDate}</p>
                      <p className="font-semibold number-display">
                        {data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#lasiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
