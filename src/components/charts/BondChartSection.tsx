import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Landmark } from 'lucide-react';
import { Bond } from '@/lib/types';

interface BondChartSectionProps {
  bonds: Bond[];
}

export function BondChartSection({ bonds }: BondChartSectionProps) {
  // Generate yield curve data
  const yieldCurveData = useMemo(() => {
    const sorted = [...bonds]
      .filter((b) => b.yieldToMaturity && b.maturityDate)
      .sort((a, b) => {
        const dateA = new Date(a.maturityDate!);
        const dateB = new Date(b.maturityDate!);
        return dateA.getTime() - dateB.getTime();
      });

    return sorted.map((bond) => {
      const maturityDate = new Date(bond.maturityDate!);
      const yearsToMaturity = Math.max(
        0,
        (maturityDate.getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)
      );

      return {
        ticker: bond.ticker,
        years: Math.round(yearsToMaturity * 10) / 10,
        yield: bond.yieldToMaturity ?? 0,
        coupon: bond.couponRate ?? 0,
      };
    });
  }, [bonds]);

  if (yieldCurveData.length === 0) {
    return null;
  }

  return (
    <div className="premium-card p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Landmark className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">Bond Yield Curve</h2>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={yieldCurveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200 70% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(200 70% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="years"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}y`}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              width={40}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="premium-card p-2 shadow-lg border border-border">
                      <p className="font-medium">{data.ticker}</p>
                      <p className="text-sm text-muted-foreground">
                        Maturity: {data.years.toFixed(1)} years
                      </p>
                      <p className="text-sm text-primary">
                        Yield: {data.yield.toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Coupon: {data.coupon.toFixed(2)}%
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

      {/* Bond Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {bonds.slice(0, 4).map((bond) => (
          <div key={bond.ticker} className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-sm">{bond.ticker}</p>
            <p className="text-xs text-muted-foreground truncate">{bond.name}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">Yield</span>
              <span className="font-semibold text-primary">
                {(bond.yieldToMaturity ?? 0).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
