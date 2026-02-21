// Money Acumen Advisory - TypeScript Type Definitions
// All types use camelCase for frontend, mapping from snake_case DB columns

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  currentPrice: number;
  previousClose: number | null;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number | null;
  high52w: number | null;
  low52w: number | null;
  peRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  foundedYear: number | null;
  employees: number | null;
  headquarters: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketSummary {
  id: string;
  indexName: string;
  indexValue: number;
  indexChange: number;
  indexChangePercent: number;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  totalVolume: number;
  totalValueTraded: number;
  advancingStocks: number;
  decliningStocks: number;
  unchangedStocks: number;
  lastUpdated: string;
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

export interface PriceHistory {
  id: string;
  stockId: string;
  date: string;
  openPrice: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  closePrice: number;
  volume: number;
  valueTraded: number | null;
}

export interface StockTradeSummary {
  id: string;
  stockTicker: string;
  date: string;
  openingPrice: number | null;
  closingPrice: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  volumeTraded: number;
  valueTraded: number | null;
  tradesCount: number;
}

export interface Bond {
  id: string;
  ticker: string;
  name: string;
  issuer: string | null;
  bondType: string;
  couponRate: number | null;
  yieldToMaturity: number | null;
  faceValue: number;
  currentPrice: number | null;
  maturityDate: string | null;
  issueDate: string | null;
  paymentFrequency: string;
  creditRating: string | null;
}

export interface DividendHistory {
  id: string;
  stockTicker: string;
  dividendPerShare: number;
  exDividendDate: string;
  recordDate: string | null;
  paymentDate: string | null;
  dividendType: string;
}

export interface Portfolio {
  id: string;
  sessionId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioHolding {
  id: string;
  portfolioId: string;
  stockTicker: string;
  sharesOwned: number;
  purchasePrice: number;
  purchaseDate: string;
  tradeType: 'buy' | 'sell';
  status: 'pending' | 'completed' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields (joined from stocks)
  stock?: Stock;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
}

export interface PortfolioBondHolding {
  id: string;
  portfolioId: string;
  bondTicker: string;
  units: number;
  purchasePrice: number;
  purchaseDate: string;
  bond?: Bond;
}

export interface PortfolioSnapshot {
  id: string;
  portfolioId: string;
  date: string;
  totalValue: number;
  dailyChange: number | null;
  dailyChangePercent: number | null;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdingsCount: number;
}

export interface Wallet {
  id: string;
  sessionId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdraw' | 'trade_buy' | 'trade_sell' | 'p2p_purchase' | 'p2p_sale';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string | null;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

// Marketplace types
export interface MarketplaceListing {
  id: string;
  sellerSessionId: string;
  sellerBrokerId: string;
  sellerCsdLast4: string;
  sellId: string;
  stockTicker: string;
  quantity: number;
  reservedShares: number;
  priceType: 'fixed' | 'bid';
  askingPrice: number | null;
  status: 'pending_approval' | 'active' | 'sold' | 'cancelled' | 'expired';
  notes: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOffer {
  id: string;
  listingId: string;
  buyerSessionId: string;
  buyerBrokerId: string;
  buyerCsdLast4: string;
  buyerSellId: string;
  quantity: number;
  offerPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceTransaction {
  id: string;
  listingId: string;
  offerId: string | null;
  sellerSessionId: string;
  buyerSessionId: string;
  sellerBrokerId: string;
  buyerBrokerId: string;
  stockTicker: string;
  quantity: number;
  pricePerShare: number;
  subtotal: number;
  pptTax: number;
  totalAmount: number;
  sellerReceives: number;
  status: 'pending_broker_approval' | 'seller_approved' | 'buyer_approved' | 'completed' | 'cancelled';
  sellerBrokerApprovedAt: string | null;
  buyerBrokerApprovedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  sessionId: string;
  stockTicker: string;
  addedAt: string;
  stock?: Stock;
}

export interface PriceAlert {
  id: string;
  sessionId: string;
  stockTicker: string;
  targetPrice: number;
  direction: 'above' | 'below';
  isTriggered: boolean;
  triggeredAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  sessionId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'price_alert' | 'trade';
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  sessionId: string;
  fullName: string | null;
  email: string | null;
  mobileMoneyNumber: string | null;
  mobileMoneyProvider: 'airtel' | 'mtn' | 'zamtel' | null;
  selectedBrokerId: string;
  notificationPreferences: {
    priceAlerts: boolean;
    portfolioUpdates: boolean;
    marketNews: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// Helper type for formatting
export type CurrencyFormat = 'ZMW' | 'K';
