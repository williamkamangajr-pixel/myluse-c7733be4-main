// Minimal fallback data - real data comes from LuSE database
import type { Stock, MarketSummary } from '@/types';

// Empty fallback stocks array - real data from database
export const mockStocks: Stock[] = [];

// Empty market summary fallback
export const mockMarketSummary: MarketSummary = {
  id: '',
  indexName: 'LASI',
  indexValue: 0,
  indexChange: 0,
  indexChangePercent: 0,
  marketStatus: 'closed',
  totalVolume: 0,
  totalValueTraded: 0,
  advancingStocks: 0,
  decliningStocks: 0,
  unchangedStocks: 0,
  lastUpdated: new Date().toISOString(),
};

// Helper functions for stock filtering
export function getTopGainers(stocks: Stock[], count = 5): Stock[] {
  return [...stocks]
    .filter(s => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, count);
}

export function getTopLosers(stocks: Stock[], count = 5): Stock[] {
  return [...stocks]
    .filter(s => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, count);
}

export function getMostActive(stocks: Stock[], count = 5): Stock[] {
  return [...stocks]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, count);
}

// Format large numbers
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

// Format currency
export function formatCurrency(amount: number, currency = 'ZMW'): string {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format ZMW currency
export function formatZMW(amount: number): string {
  return `K${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format percentage
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
