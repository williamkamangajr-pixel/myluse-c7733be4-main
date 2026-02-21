const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Ticker mapping: afx.kwayisi.org ticker -> internal database ticker
const TICKER_MAP: Record<string, string> = {
  'AECI': 'AELZ',
  'BATA': 'BATZ',
  'CECZ': 'CEC',
  'SCBL': 'SCBZ',
  'ZCCM': 'ZCCM-IH',
  'INVE': 'INVZ',
  'CCAF': 'CHAL',
};

// Reverse mapping for EODHD lookups
const INTERNAL_TO_EODHD: Record<string, string> = {
  'AELZ': 'AELZ',
  'ATEL': 'ATEL',
  'BATZ': 'BATZ',
  'CEC': 'CEC',
  'CHAL': 'CHAL',
  'CHIL': 'CHIL',
  'FARM': 'FARM',
  'INVZ': 'INVZ',
  'LAFZ': 'LAFZ',
  'MAFS': 'MAFS',
  'MFEZ': 'MFEZ',
  'METZ': 'METZ',
  'NATB': 'NATB',
  'PRSC': 'PRSC',
  'PUMA': 'PUMA',
  'REIZ': 'REIZ',
  'SBZL': 'SBZL',
  'SCBZ': 'SCBZ',
  'SHOP': 'SHOP',
  'ZNCO': 'ZNCO',
  'ZSUG': 'ZSUG',
  'ZBFP': 'ZBFP',
  'ZCCM-IH': 'ZCCM-IH',
  'ZMRE': 'ZMRE',
};

// All known LuSE tickers
const LUSE_STOCK_TICKERS = [
  'AELZ', 'ATEL', 'BATZ', 'CEC', 'CHAL', 'CHIL', 'FARM', 'INVZ', 'LAFZ', 
  'MAFS', 'MFEZ', 'METZ', 'NATB', 'PRSC', 'PUMA', 'REIZ', 'SBZL', 'SCBZ', 
  'SHOP', 'ZNCO', 'ZSUG', 'ZBFP', 'ZCCM-IH', 'ZMRE'
];

interface StockPrice {
  ticker: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  currency: string;
  source: 'eodhd' | 'firecrawl';
}

interface MarketSummary {
  indexValue: number;
  indexChange: number;
  indexChangePercent: number;
  totalVolume: number;
  totalValueTraded: number;
  advancingStocks: number;
  decliningStocks: number;
  unchangedStocks: number;
  marketStatus: string;
}

interface CombinedResponse {
  success: boolean;
  stocks?: StockPrice[];
  marketSummary?: MarketSummary;
  lastUpdated?: string;
  error?: string;
  sources: {
    primary: 'eodhd' | 'firecrawl';
    fallbackUsed: boolean;
  };
}

// Check if LuSE market is open (weekdays 10:00 - 12:30 CAT)
function isMarketOpen(): boolean {
  const now = new Date();
  const catHour = (now.getUTCHours() + 2) % 24;
  const catMinute = now.getUTCMinutes();
  const day = now.getUTCDay();
  
  if (day < 1 || day > 5) return false;
  if (catHour < 10 || catHour > 12) return false;
  if (catHour === 12 && catMinute > 30) return false;
  
  return true;
}

// Fetch from EODHD API (primary source)
async function fetchFromEODHD(ticker: string, apiKey: string): Promise<StockPrice | null> {
  try {
    const eodhdTicker = INTERNAL_TO_EODHD[ticker] || ticker;
    const formattedTicker = `${eodhdTicker}.LUSE`;
    
    console.log(`[EODHD] Fetching ${formattedTicker}...`);
    
    const response = await fetch(
      `https://eodhd.com/api/real-time/${formattedTicker}?api_token=${apiKey}&fmt=json`
    );
    
    if (!response.ok) {
      console.warn(`[EODHD] Failed for ${formattedTicker}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || data.error || !data.close || parseFloat(data.close) <= 0) {
      console.warn(`[EODHD] Invalid data for ${formattedTicker}:`, data);
      return null;
    }
    
    const currentPrice = parseFloat(data.close);
    const previousClose = parseFloat(data.previousClose) || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    
    return {
      ticker,
      name: '',
      currentPrice: Math.round(currentPrice * 100) / 100,
      previousClose: Math.round(previousClose * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: parseInt(data.volume) || 0,
      currency: 'ZMW',
      source: 'eodhd',
    };
  } catch (error) {
    console.error(`[EODHD] Error fetching ${ticker}:`, error);
    return null;
  }
}

// Parse stock data from afx.kwayisi.org markdown (same logic as working luse-price-scraper)
function parseAfxStockData(markdown: string): StockPrice[] {
  const stocksMap = new Map<string, StockPrice>();
  const lines = markdown.split('\n');
  
  console.log(`[AFX] Parsing ${lines.length} lines of content...`);
  
  for (const line of lines) {
    // Skip non-table lines
    if (!line.includes('|')) continue;
    if (line.includes('Ticker') || line.includes('---') || line.includes('Name')) continue;
    
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    
    if (cells.length >= 4) {
      const rawTicker = cells[0].replace(/[\[\]]/g, '').trim().toUpperCase();
      
      if (!/^[A-Z]{2,6}(-[A-Z]{1,3})?$/.test(rawTicker)) continue;
      
      const internalTicker = TICKER_MAP[rawTicker] || rawTicker;
      
      if (!LUSE_STOCK_TICKERS.includes(internalTicker)) {
        const isKnownAfx = Object.keys(TICKER_MAP).includes(rawTicker);
        if (!isKnownAfx && !LUSE_STOCK_TICKERS.includes(rawTicker)) {
          continue;
        }
      }
      
      const name = cells.length > 1 ? cells[1] : '';
      
      let volume = 0;
      let price = 0;
      let change = 0;
      
      for (let i = 2; i < cells.length; i++) {
        const rawCell = cells[i];
        const cleanCell = rawCell.replace(/[,\s]/g, '');
        const num = parseFloat(cleanCell);
        
        if (isNaN(num)) continue;
        
        if (Math.abs(num) > 100000) {
          volume = Math.round(num);
        } else if (num > 0 && num < 50000 && price === 0) {
          price = num;
        } else if (rawCell.startsWith('+') || rawCell.startsWith('-') || Math.abs(num) < 100) {
          if (!rawCell.includes('%')) {
            change = num;
          }
        } else if (num > 1000 && num < 100000 && volume === 0) {
          volume = Math.round(num);
        }
      }
      
      if (price > 0) {
        const previousClose = price - change;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
        
        stocksMap.set(internalTicker, {
          ticker: internalTicker,
          name,
          currentPrice: Math.round(price * 100) / 100,
          previousClose: Math.round(previousClose * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          volume,
          currency: 'ZMW',
          source: 'firecrawl',
        });
      }
    }
  }
  
  const result = Array.from(stocksMap.values());
  console.log(`[AFX] Parsed ${result.length} stocks with valid ZMW prices`);
  return result;
}

// Parse LASI index from afx.kwayisi.org
function parseLASIFromAfx(markdown: string): { indexValue: number; indexChange: number; indexChangePercent: number } | null {
  const patterns = [
    /LASI\s*Index[:\s]*([\d,]+\.?\d*)/i,
    /LASI[:\s]*([\d,]+\.?\d*)/i,
    /All\s*Share[:\s]*([\d,]+\.?\d*)/i,
  ];
  
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match) {
      const indexValue = parseFloat(match[1].replace(/,/g, ''));
      if (indexValue > 5000 && indexValue < 100000) {
        const changeMatch = markdown.match(/LASI.*?([+-][\d.]+)\s*%/i);
        const changePercent = changeMatch ? parseFloat(changeMatch[1]) : 0;
        const indexChange = indexValue * (changePercent / 100);
        
        return {
          indexValue: Math.round(indexValue * 100) / 100,
          indexChange: Math.round(indexChange * 100) / 100,
          indexChangePercent: Math.round(changePercent * 100) / 100,
        };
      }
    }
  }
  
  return null;
}

// Fetch from Firecrawl (fallback source)
async function fetchFromFirecrawl(apiKey: string): Promise<{ stocks: StockPrice[]; lasi: ReturnType<typeof parseLASIFromAfx> }> {
  try {
    console.log('[Firecrawl] Fetching from afx.kwayisi.org/luse/...');
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://afx.kwayisi.org/luse/',
        formats: ['markdown'],
        waitFor: 3000,
        onlyMainContent: false,
        location: {
          country: 'ZM',
          languages: ['en'],
        },
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Firecrawl] API error:', errorData);
      return { stocks: [], lasi: null };
    }
    
    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || '';
    
    console.log(`[Firecrawl] Received ${markdown.length} chars of content`);
    
    const stocks = parseAfxStockData(markdown);
    const lasi = parseLASIFromAfx(markdown);
    
    return { stocks, lasi };
  } catch (error) {
    console.error('[Firecrawl] Error:', error);
    return { stocks: [], lasi: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EODHD_API_KEY = Deno.env.get('EODHD_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!EODHD_API_KEY && !FIRECRAWL_API_KEY) {
      console.error('Neither EODHD nor Firecrawl API keys configured');
      return new Response(
        JSON.stringify({ success: false, error: 'No API keys configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tickers } = await req.json().catch(() => ({ tickers: null }));
    
    const targetTickers = tickers || Object.values(INTERNAL_TO_EODHD);
    
    console.log(`[Combined] Fetching ${targetTickers.length} tickers...`);
    
    let stocks: StockPrice[] = [];
    let lasi: ReturnType<typeof parseLASIFromAfx> = null;
    let fallbackUsed = false;
    
    // Step 1: Try EODHD first for each ticker
    if (EODHD_API_KEY) {
      console.log('[Combined] Trying EODHD as primary source...');
      
      const eodhdPromises = targetTickers.slice(0, 10).map((ticker: string) => 
        fetchFromEODHD(ticker, EODHD_API_KEY)
      );
      
      const eodhdResults = await Promise.all(eodhdPromises);
      stocks = eodhdResults.filter((s): s is StockPrice => s !== null);
      
      console.log(`[Combined] EODHD returned ${stocks.length} stocks`);
    }
    
    // Step 2: If EODHD didn't return enough data, fall back to Firecrawl
    if (stocks.length < 5 && FIRECRAWL_API_KEY) {
      console.log('[Combined] EODHD insufficient, falling back to Firecrawl...');
      fallbackUsed = true;
      
      const firecrawlData = await fetchFromFirecrawl(FIRECRAWL_API_KEY);
      
      // Use Firecrawl data - merge with any EODHD data we got
      for (const fcStock of firecrawlData.stocks) {
        const existing = stocks.find(s => s.ticker === fcStock.ticker);
        if (!existing) {
          stocks.push(fcStock);
        }
      }
      
      if (firecrawlData.lasi) {
        lasi = firecrawlData.lasi;
      }
      
      console.log(`[Combined] After Firecrawl merge: ${stocks.length} stocks`);
    }
    
    // Calculate market summary
    const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);
    const totalValueTraded = stocks.reduce((sum, s) => sum + (s.currentPrice * s.volume), 0);
    
    const marketSummary: MarketSummary = {
      indexValue: lasi?.indexValue || 0,
      indexChange: lasi?.indexChange || 0,
      indexChangePercent: lasi?.indexChangePercent || 0,
      totalVolume,
      totalValueTraded,
      advancingStocks: stocks.filter(s => s.change > 0).length,
      decliningStocks: stocks.filter(s => s.change < 0).length,
      unchangedStocks: stocks.filter(s => s.change === 0).length,
      marketStatus: isMarketOpen() ? 'open' : 'closed',
    };
    
    const response: CombinedResponse = {
      success: true,
      stocks,
      marketSummary,
      lastUpdated: new Date().toISOString(),
      sources: {
        primary: stocks.length > 0 && stocks[0].source === 'eodhd' ? 'eodhd' : 'firecrawl',
        fallbackUsed,
      },
    };
    
    console.log(`[Combined] Success: ${stocks.length} stocks, fallback: ${fallbackUsed}`);
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Combined] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
