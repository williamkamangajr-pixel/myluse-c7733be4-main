export interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  peRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  description?: string;
  logoUrl?: string;
  website?: string;
  headquarters?: string;
  employees?: number;
  foundedYear?: number;
}

export interface Bond {
  id: string;
  ticker: string;
  name: string;
  issuer: string | null;
  bondType: string | null;
  couponRate: number | null;
  yieldToMaturity: number | null;
  maturityDate: string | null;
  faceValue: number | null;
  currentPrice: number;
  creditRating: string | null;
  paymentFrequency: string | null;
}

export interface MarketSummary {
  indexName: string;
  indexValue: number;
  indexChange: number;
  indexChangePercent: number;
  totalVolume: number;
  totalValueTraded: number;
  advancingStocks: number;
  decliningStocks: number;
  unchangedStocks: number;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  lastUpdated: string;
}

export interface PortfolioHolding {
  id: string;
  portfolioId: string;
  stockTicker: string;
  sharesOwned: number;
  purchasePrice: number;
  purchaseDate: string;
  status: 'pending' | 'executed' | 'cancelled';
  tradeType: 'buy' | 'sell';
  notes?: string;
  currentPrice?: number;
  currentValue?: number;
  totalReturn?: number;
  totalReturnPercent?: number;
}

export interface BondHolding {
  id: string;
  portfolioId: string;
  bondTicker: string;
  bondName?: string;
  units: number;
  purchasePrice: number;
  purchaseDate: string;
  status: 'pending' | 'executed' | 'cancelled';
  tradeType?: 'buy' | 'sell';
  couponRate?: number;
  maturityDate?: string;
  currentPrice?: number;
  currentValue?: number;
  totalReturn?: number;
  totalReturnPercent?: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  holdings: PortfolioHolding[];
}

export interface BondSummary {
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
}

export interface Wallet {
  id: string;
  sessionId: string;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string | null;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  sessionId: string;
  stockTicker: string;
  addedAt: string;
  stock?: Stock;
}

export interface Notification {
  id: string;
  sessionId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface PriceHistory {
  id: string;
  stockId: string;
  date: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
  valueTrade?: number;
}

export interface LASIHistory {
  id: string;
  date: string;
  value: number;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  valueTraded: number | null;
}

export interface DividendHistory {
  id: string;
  stockTicker: string;
  dividendPerShare: number;
  exDividendDate: string;
  recordDate: string | null;
  paymentDate: string | null;
  dividendType: string | null;
}

export interface TradeSummary {
  id: string;
  stockTicker: string;
  date: string;
  openingPrice: number | null;
  closingPrice: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  volumeTraded: number | null;
  valueTraded: number | null;
  tradesCount: number | null;
}

export interface UserProfile {
  id: string;
  sessionId: string;
  portfolioName: string;
  fullName: string | null;
  address?: string | null;
  email: string | null;
  mobileMoneyProvider: string | null;
  mobileMoneyNumber: string | null;
  selectedBrokerId: string | null;
  csdNumber?: string | null;
  notificationsEnabled: boolean;
  notifyPriceChanges: boolean;
  notifyTrades: boolean;
}

export interface PortfolioDividend {
  stockTicker: string;
  stockName: string;
  sharesOwned: number;
  dividendYield: number;
  annualDividendTotal: number;
}

export interface DividendSummary {
  totalAnnualIncome: number;
  portfolioYield: number;
  averageYield: number;
}

export interface StockDetails extends Stock {
  priceHistory: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  metrics: {
    value: number;
    growth: number;
    health: number;
    dividends: number;
    performance: number;
  };
  financials: {
    revenue: Array<{ year: string; value: number }>;
    earnings: Array<{ year: string; value: number }>;
    assets: Array<{ year: string; value: number }>;
  };
}
