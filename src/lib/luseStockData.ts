// Real LuSE Stock Market Data
// Pulled from luse.co.zm/trading/market-data/
// All prices in ZMW (Zambian Kwacha)

export interface LuSEStock {
  ticker: string;
  isin: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  valueTraded: number;
  bestBid: number | null;
  bestAsk: number | null;
  description: string;
}

// Official LuSE listed stocks as of Feb 2026
export const luseStocks: LuSEStock[] = [
  {
    ticker: 'AECI',
    isin: 'ZM0000000284',
    name: 'AECI Mining Explosives',
    sector: 'Mining',
    currentPrice: 129.67,
    previousClose: 129.67,
    change: 0,
    changePercent: 0,
    volume: 9,
    valueTraded: 1167.09,
    bestBid: 129.67,
    bestAsk: 129.68,
    description: 'AECI Mining Explosives provides mining explosives and related services to the mining industry in Zambia.',
  },
  {
    ticker: 'ATEL',
    isin: 'ZM0000000342',
    name: 'Airtel Networks Zambia',
    sector: 'Telecommunications',
    currentPrice: 139.25,
    previousClose: 139.25,
    change: 0,
    changePercent: 0,
    volume: 7263,
    valueTraded: 1011383.30,
    bestBid: 139.25,
    bestAsk: 139.50,
    description: 'Airtel Networks Zambia Plc provides mobile telecommunications services across Zambia with extensive 4G/5G coverage.',
  },
  {
    ticker: 'BATA',
    isin: 'ZM0000000102',
    name: 'Bata Shoe Company',
    sector: 'Consumer Goods',
    currentPrice: 8.00,
    previousClose: 8.00,
    change: 0,
    changePercent: 0,
    volume: 3176,
    valueTraded: 25408.50,
    bestBid: 7.00,
    bestAsk: 8.00,
    description: 'Bata Shoe Company Zambia manufactures and retails footwear products across the country.',
  },
  {
    ticker: 'BATZ',
    isin: 'ZM0000000029',
    name: 'British American Tobacco Zambia',
    sector: 'Consumer Goods',
    currentPrice: 14.50,
    previousClose: 14.50,
    change: 0,
    changePercent: 0,
    volume: 902,
    valueTraded: 13079.00,
    bestBid: 14.35,
    bestAsk: 14.50,
    description: 'British American Tobacco Zambia manufactures and distributes tobacco products.',
  },
  {
    ticker: 'CCAF',
    isin: 'ZM0000000500',
    name: 'CEC Africa Investments',
    sector: 'Utilities',
    currentPrice: 0.82,
    previousClose: 0.82,
    change: 0,
    changePercent: 0,
    volume: 0,
    valueTraded: 0,
    bestBid: null,
    bestAsk: null,
    description: 'CEC Africa Investments is a quoted tier company focused on power and energy investments.',
  },
  {
    ticker: 'CECZ',
    isin: 'ZM0000000136',
    name: 'Copperbelt Energy Corporation',
    sector: 'Utilities',
    currentPrice: 19.07,
    previousClose: 19.08,
    change: -0.01,
    changePercent: -0.05,
    volume: 4057,
    valueTraded: 77376.70,
    bestBid: 19.00,
    bestAsk: 19.08,
    description: 'Copperbelt Energy Corporation Plc provides electricity to the mining industry on the Copperbelt.',
  },
  {
    ticker: 'CHIL',
    isin: 'ZM0000000011',
    name: 'Chilanga Cement',
    sector: 'Industrial',
    currentPrice: 85.00,
    previousClose: 85.00,
    change: 0,
    changePercent: 0,
    volume: 332,
    valueTraded: 28120.00,
    bestBid: 80.90,
    bestAsk: 85.00,
    description: 'Chilanga Cement Plc is Zambia\'s leading cement manufacturer, part of Lafarge group.',
  },
  {
    ticker: 'DCZM',
    isin: 'ZM0000000581',
    name: 'Discovery Copper Zambia',
    sector: 'Mining',
    currentPrice: 23.39,
    previousClose: 23.39,
    change: 0,
    changePercent: 0,
    volume: 226,
    valueTraded: 5316.64,
    bestBid: 23.39,
    bestAsk: 24.00,
    description: 'Discovery Copper Zambia is a copper exploration and mining company.',
  },
  {
    ticker: 'FARM',
    isin: 'ZM0000000318',
    name: 'Zambia Farmers Market',
    sector: 'Agriculture',
    currentPrice: 5.80,
    previousClose: 5.80,
    change: 0,
    changePercent: 0,
    volume: 0,
    valueTraded: 0,
    bestBid: 7.00,
    bestAsk: null,
    description: 'Zambia Farmers Market supports agricultural trading and farmer development.',
  },
  {
    ticker: 'MAFS',
    isin: 'ZM0000000391',
    name: 'Madison Financial Services',
    sector: 'Financial Services',
    currentPrice: 1.81,
    previousClose: 1.82,
    change: -0.01,
    changePercent: -0.55,
    volume: 587,
    valueTraded: 1062.47,
    bestBid: 1.80,
    bestAsk: 1.81,
    description: 'Madison Financial Services provides insurance and financial services across Zambia.',
  },
  {
    ticker: 'NATB',
    isin: 'ZM0000000086',
    name: 'National Breweries',
    sector: 'Consumer Goods',
    currentPrice: 2.89,
    previousClose: 2.89,
    change: 0,
    changePercent: 0,
    volume: 174,
    valueTraded: 502.86,
    bestBid: null,
    bestAsk: 2.89,
    description: 'National Breweries Plc produces traditional and mainstream beverages.',
  },
  {
    ticker: 'PMDZ',
    isin: 'ZM0000000565',
    name: 'Prima Reinsurance',
    sector: 'Financial Services',
    currentPrice: 4.62,
    previousClose: 4.62,
    change: 0,
    changePercent: 0,
    volume: 0,
    valueTraded: 0,
    bestBid: null,
    bestAsk: null,
    description: 'Prima Reinsurance Plc provides reinsurance services in Zambia.',
  },
  {
    ticker: 'PUMA',
    isin: 'ZM0000000185',
    name: 'Puma Energy Zambia',
    sector: 'Energy',
    currentPrice: 3.64,
    previousClose: 3.64,
    change: 0,
    changePercent: 0,
    volume: 625,
    valueTraded: 2275.00,
    bestBid: null,
    bestAsk: 3.64,
    description: 'Puma Energy Zambia Plc is a leading fuel retailer and distributor.',
  },
  {
    ticker: 'SCBL',
    isin: 'ZM0000000094',
    name: 'Standard Chartered Bank Zambia',
    sector: 'Financial Services',
    currentPrice: 2.02,
    previousClose: 2.10,
    change: -0.08,
    changePercent: -3.81,
    volume: 1234,
    valueTraded: 2509.66,
    bestBid: 1.90,
    bestAsk: 2.00,
    description: 'Standard Chartered Bank Zambia Plc provides banking and financial services.',
  },
  {
    ticker: 'SHOP',
    isin: 'ZAE000012084',
    name: 'Shoprite Holdings',
    sector: 'Retail',
    currentPrice: 350.00,
    previousClose: 350.00,
    change: 0,
    changePercent: 0,
    volume: 0,
    valueTraded: 0,
    bestBid: 350.00,
    bestAsk: null,
    description: 'Shoprite Holdings operates supermarket chains across Zambia.',
  },
  {
    ticker: 'ZABR',
    isin: 'ZM0000000078',
    name: 'Zambia Breweries',
    sector: 'Consumer Goods',
    currentPrice: 6.75,
    previousClose: 6.75,
    change: 0,
    changePercent: 0,
    volume: 1111,
    valueTraded: 7499.25,
    bestBid: null,
    bestAsk: 6.75,
    description: 'Zambia Breweries is a leading beverage manufacturer, part of AB InBev.',
  },
  {
    ticker: 'ZCCM',
    isin: 'ZM0000000037',
    name: 'ZCCM Investments Holdings',
    sector: 'Mining',
    currentPrice: 166.00,
    previousClose: 166.00,
    change: 0,
    changePercent: 0,
    volume: 57,
    valueTraded: 9462.00,
    bestBid: 165.00,
    bestAsk: 166.00,
    description: 'ZCCM Investments Holdings Plc is Zambia\'s investment holding company for mining assets.',
  },
  {
    ticker: 'ZFCO',
    isin: 'ZM0000000524',
    name: 'Zambia Forestry and Forest Industries',
    sector: 'Industrial',
    currentPrice: 4.00,
    previousClose: 4.00,
    change: 0,
    changePercent: 0,
    volume: 0,
    valueTraded: 0,
    bestBid: 4.10,
    bestAsk: null,
    description: 'ZAFFICO manages commercial forestry and timber production.',
  },
  {
    ticker: 'ZMBF',
    isin: 'ZM0000000201',
    name: 'Zambeef Products',
    sector: 'Consumer Goods',
    currentPrice: 2.16,
    previousClose: 2.16,
    change: 0,
    changePercent: 0,
    volume: 2786,
    valueTraded: 6017.76,
    bestBid: 2.15,
    bestAsk: 2.16,
    description: 'Zambeef Products PLC is an integrated cold chain food products and retail company.',
  },
  {
    ticker: 'ZMFA',
    isin: 'ZM0000000243',
    name: 'Zambia Sugar',
    sector: 'Agriculture',
    currentPrice: 59.96,
    previousClose: 59.96,
    change: 0,
    changePercent: 0,
    volume: 27,
    valueTraded: 1618.78,
    bestBid: 59.19,
    bestAsk: 59.95,
    description: 'Zambia Sugar Plc is one of Africa\'s largest sugar producers.',
  },
  {
    ticker: 'ZMRE',
    isin: 'ZM0000000326',
    name: 'Zambia Reinsurance',
    sector: 'Financial Services',
    currentPrice: 2.65,
    previousClose: 2.65,
    change: 0,
    changePercent: 0,
    volume: 0,
    valueTraded: 0,
    bestBid: 2.80,
    bestAsk: null,
    description: 'Zambia Reinsurance provides reinsurance services across the region.',
  },
  {
    ticker: 'ZNCO',
    isin: 'ZM0000000250',
    name: 'Zambia National Commercial Bank',
    sector: 'Financial Services',
    currentPrice: 5.98,
    previousClose: 5.98,
    change: 0,
    changePercent: 0,
    volume: 1023928,
    valueTraded: 6123126.38,
    bestBid: 5.97,
    bestAsk: 5.98,
    description: 'ZANACO provides retail and corporate banking services across Zambia.',
  },
  {
    ticker: 'ZSUG',
    isin: 'ZM0000000052',
    name: 'Zambia Sugar',
    sector: 'Agriculture',
    currentPrice: 73.00,
    previousClose: 73.00,
    change: 0,
    changePercent: 0,
    volume: 505,
    valueTraded: 36863.53,
    bestBid: 70.00,
    bestAsk: 72.99,
    description: 'Zambia Sugar Plc, a subsidiary of Illovo Sugar, produces sugar from Nakambala Estate.',
  },
  {
    ticker: 'REIZUSD',
    isin: 'ZM4000000013',
    name: 'Real Estate Investments Zambia (USD)',
    sector: 'Real Estate',
    currentPrice: 0.09,
    previousClose: 0.09,
    change: 0,
    changePercent: 0,
    volume: 0,
    valueTraded: 0,
    bestBid: 0.08,
    bestAsk: 0.09,
    description: 'REIZ is a real estate investment trust focused on commercial properties in Zambia.',
  },
];

// LASI (LuSE All Share Index) Data
export interface LASIData {
  currentValue: number;
  change: number;
  changePercent: number;
  trades: number;
  volumeTraded: number;
  valueTraded: number;
  marketStatus: 'open' | 'closed';
  lastUpdated: string;
}

export const lasiData: LASIData = {
  currentValue: 26199.65,
  change: -27.71,
  changePercent: -0.11,
  trades: 577,
  volumeTraded: 1049368,
  valueTraded: 7354731.50,
  marketStatus: 'closed', // Market hours: 10:00 - 12:30 CAT, Monday-Friday
  lastUpdated: new Date().toISOString(),
};

// Market hours check (10:00 AM - 12:30 PM CAT, Monday-Friday)
export function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Closed on weekends
  if (day === 0 || day === 6) return false;
  
  // Open 10:00 - 12:30 CAT (UTC+2)
  const currentTime = hours * 60 + minutes;
  const openTime = 10 * 60; // 10:00
  const closeTime = 12 * 60 + 30; // 12:30
  
  return currentTime >= openTime && currentTime <= closeTime;
}

export function getMarketStatusMessage(): string {
  if (isMarketOpen()) {
    return 'Market Open';
  }
  
  const now = new Date();
  const day = now.getDay();
  
  if (day === 0 || day === 6) {
    return 'Market Closed (Weekend)';
  }
  
  const hours = now.getHours();
  if (hours < 10) {
    return 'Market Opens at 10:00 CAT';
  }
  
  return 'Market Closed (Opens 10:00 CAT)';
}
