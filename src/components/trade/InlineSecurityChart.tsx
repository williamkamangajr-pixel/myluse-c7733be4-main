import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Landmark, Activity } from 'lucide-react';

interface Security {
  id: string;
  ticker: string;
  name: string;
  currentPrice: number;
  yieldToMaturity?: number;
  couponRate?: number;
  maturityDate?: string;
  securityType: 'bond' | 'tbill';
}

interface InlineSecurityChartProps {
  security: Security | null;
}

export function InlineSecurityChart({ security }: InlineSecurityChartProps) {
  // Generate mock yield history
  const chartData = useMemo(() => {
    if (!security) return [];

    const data: Array<{ date: string; yield: number }> = [];
    const baseYield = security.yieldToMaturity ?? 14;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.5;
      data.push({
        date: date.toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' }),
        yield: Math.round((baseYield + variation) * 100) / 100,
      });
    }

    return data;
  }, [security]);

  if (!security) {
    return (
      <div className="premium-card p-6 flex items-center justify-center h-[200px]">
        <div className="text-center text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a security to view chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">{security.ticker}</h3>
        </div>
        <div className="text-sm text-primary font-medium">
          <span className="number-display">
            {(security.yieldToMaturity ?? 0).toFixed(2)}% yield
          </span>
        </div>
      </div>

      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200 70% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(200 70% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  return (
                    <div className="premium-card p-2 text-xs shadow-lg border border-border">
                      <p className="text-muted-foreground">{payload[0].payload.date}</p>
                      <p className="font-semibold number-display">
                        {value?.toFixed(2)}% yield
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="yield"
              stroke="hsl(200 70% 50%)"
              strokeWidth={2}
              fill="url(#yieldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
