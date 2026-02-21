import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PerformanceChartProps {
  portfolioData: Array<{ date: string; value: number }>;
  marketData: Array<{ date: string; value: number }>;
}

export function PortfolioPerformanceChart({ portfolioData, marketData }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    return portfolioData.map((item, index) => ({
      date: item.date,
      portfolio: item.value,
      market: marketData[index]?.value ?? 0,
      formattedDate: new Date(item.date).toLocaleDateString('en-ZM', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [portfolioData, marketData]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
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
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `K${(value / 1000).toFixed(0)}k`}
            width={50}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="premium-card p-2 shadow-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{data.formattedDate}</p>
                    <p className="text-sm text-primary">
                      Portfolio: K{data.portfolio.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Market: K{data.market.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground capitalize">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="market"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            fill="url(#marketGradient)"
            name="market"
          />
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#portfolioGradient)"
            name="portfolio"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
