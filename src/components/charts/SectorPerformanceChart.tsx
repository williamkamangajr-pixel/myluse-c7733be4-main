import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Stock } from '@/lib/types';

interface SectorPerformanceChartProps {
  stocks: Stock[];
}

export function SectorPerformanceChart({ stocks }: SectorPerformanceChartProps) {
  const sectorData = useMemo(() => {
    const sectorMap = new Map<string, { total: number; count: number }>();

    stocks.forEach((stock) => {
      const sector = stock.sector || 'Other';
      const existing = sectorMap.get(sector) || { total: 0, count: 0 };
      sectorMap.set(sector, {
        total: existing.total + (stock.changePercent ?? 0),
        count: existing.count + 1,
      });
    });

    return Array.from(sectorMap.entries())
      .map(([sector, data]) => ({
        sector,
        change: data.total / data.count,
      }))
      .sort((a, b) => b.change - a.change);
  }, [stocks]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sectorData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <YAxis
            type="category"
            dataKey="sector"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="premium-card p-2 shadow-lg border border-border">
                    <p className="font-medium">{data.sector}</p>
                    <p className={data.change >= 0 ? 'text-success' : 'text-destructive'}>
                      {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="change" radius={[0, 4, 4, 0]}>
            {sectorData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.change >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
