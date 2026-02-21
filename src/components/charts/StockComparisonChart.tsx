import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Stock, PriceHistory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface StockComparisonChartProps {
  stocks: Stock[];
  priceHistory: PriceHistory[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(200 70% 50%)'];

export function StockComparisonChart({ stocks, priceHistory }: StockComparisonChartProps) {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

  const addTicker = (ticker: string) => {
    if (selectedTickers.length < 3 && !selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker]);
    }
  };

  const removeTicker = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
  };

  // Generate mock comparison data (normalized to 100)
  const chartData = useMemo(() => {
    if (selectedTickers.length === 0) return [];

    const days = 30;
    const data: Array<Record<string, string | number>> = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const entry: Record<string, string | number> = {
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' }),
      };

      selectedTickers.forEach((ticker, idx) => {
        // Simulate normalized price movement (starts at 100)
        const baseVariation = Math.sin((days - i) / 5 + idx) * 5;
        const randomVariation = (Math.random() - 0.5) * 3;
        entry[ticker] = Math.round((100 + baseVariation + randomVariation + (days - i) * 0.3) * 100) / 100;
      });

      data.push(entry);
    }

    return data;
  }, [selectedTickers]);

  return (
    <div className="space-y-4">
      {/* Stock Selection */}
      <div className="flex flex-wrap gap-2">
        {selectedTickers.map((ticker, idx) => (
          <div
            key={ticker}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm"
            style={{ backgroundColor: `${COLORS[idx]}20`, color: COLORS[idx] }}
          >
            <span className="font-medium">{ticker}</span>
            <button
              onClick={() => removeTicker(ticker)}
              className="hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {selectedTickers.length < 3 && (
          <select
            className="px-2 py-1 text-sm rounded-lg bg-muted border-0 cursor-pointer"
            value=""
            onChange={(e) => addTicker(e.target.value)}
          >
            <option value="" disabled>Add stock...</option>
            {stocks
              .filter((s) => !selectedTickers.includes(s.ticker))
              .slice(0, 10)
              .map((stock) => (
                <option key={stock.ticker} value={stock.ticker}>
                  {stock.ticker} - {stock.name}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* Chart */}
      {selectedTickers.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="premium-card p-2 shadow-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">{data.formattedDate}</p>
                        {selectedTickers.map((ticker, idx) => (
                          <p key={ticker} style={{ color: COLORS[idx] }} className="text-sm">
                            {ticker}: {data[ticker]?.toFixed(2)}
                          </p>
                        ))}
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
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              {selectedTickers.map((ticker, idx) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={COLORS[idx]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Select up to 3 stocks to compare
        </div>
      )}
    </div>
  );
}
