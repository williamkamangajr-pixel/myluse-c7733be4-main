import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Stock } from '@/types';
interface SectorBreakdownProps {
  stocks: Stock[];
}
const COLORS = ['hsl(35, 95%, 55%)',
// Primary orange
'hsl(152, 69%, 31%)',
// Success green
'hsl(45, 93%, 58%)',
// Gold
'hsl(200, 70%, 50%)',
// Blue
'hsl(280, 65%, 60%)',
// Purple
'hsl(15, 85%, 55%)',
// Coral
'hsl(180, 60%, 45%)',
// Teal
'hsl(320, 70%, 55%)' // Pink
];
export function SectorBreakdown({
  stocks
}: SectorBreakdownProps) {
  const sectorData = useMemo(() => {
    const sectors = stocks.reduce((acc, stock) => {
      const sector = stock.sector || 'Other';
      const marketCap = stock.marketCap || 0;
      if (acc[sector]) {
        acc[sector].value += marketCap;
        acc[sector].count += 1;
      } else {
        acc[sector] = {
          name: sector,
          value: marketCap,
          count: 1
        };
      }
      return acc;
    }, {} as Record<string, {
      name: string;
      value: number;
      count: number;
    }>);
    return Object.values(sectors).sort((a, b) => b.value - a.value);
  }, [stocks]);
  const totalMarketCap = sectorData.reduce((sum, s) => sum + s.value, 0);
  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: Array<{
      payload: typeof sectorData[0];
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = (data.value / totalMarketCap * 100).toFixed(1);
      return <div className="rounded-lg border border-border bg-popover p-2 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.count} stocks</p>
          <p className="text-sm text-primary">{percentage}% of market</p>
        </div>;
    }
    return null;
  };
  return (
    <div className="premium-card">
      <h3 className="mb-3 text-sm font-semibold">Sector Breakdown</h3>
      
      <div className="flex items-center gap-4">
        <div className="h-32 w-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-1.5">
          {sectorData.slice(0, 5).map((sector, index) => (
            <div key={sector.name} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground truncate flex-1">
                {sector.name}
              </span>
              <span className="text-xs font-medium tabular-nums">
                {((sector.value / totalMarketCap) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}