const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Ticker mapping: afx.kwayisi.org ticker -> internal database ticker
const AFX_TO_INTERNAL: Record<string, string> = {
  'AECI': 'AELZ',
  'BATA': 'BATZ',
  'CECZ': 'CEC',
  'SCBL': 'SCBZ',
  'ZCCM': 'ZCCM-IH',
  'INVE': 'INVZ',
  'CCAF': 'CHAL',
};

// All known LuSE tickers (internal naming)
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
}

interface LuSEResponse {
  success: boolean;
  stocks?: StockPrice[];
  marketSummary?: {
    indexValue: number;
    indexChange: number;
    indexChangePercent: number;
    totalVolume: number;
    totalValueTraded: number;
    advancingStocks: number;
    decliningStocks: number;
    unchangedStocks: number;
    marketStatus: string;
  };
  lastUpdated?: string;
  error?: string;
  source?: string;
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

// Parse stock data from afx.kwayisi.org markdown table
function parseAfxStockData(markdown: string): StockPrice[] {
  const stocksMap = new Map<string, StockPrice>();
  const lines = markdown.split('\n');
  
  console.log(`Parsing ${lines.length} lines from afx.kwayisi.org...`);
  
  // The table format from afx.kwayisi.org:
  // | Ticker | Name | Volume | Price | Change |
  // Example: | ZNCO | Zambia National Commercial Bank | 1,023,928 | 5.98 | +0.00 |
  
  for (const line of lines) {
    // Skip non-table lines
    if (!line.includes('|')) continue;
    if (line.includes('Ticker') || line.includes('---') || line.includes('Name')) continue;
    
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    
    if (cells.length >= 4) {
      // First cell should be ticker (possibly wrapped in brackets)
      const rawTicker = cells[0].replace(/[\[\]]/g, '').trim().toUpperCase();
      
      // Validate ticker format
      if (!/^[A-Z]{2,6}(-[A-Z]{1,3})?$/.test(rawTicker)) continue;
      
      // Map to internal ticker
      const internalTicker = AFX_TO_INTERNAL[rawTicker] || rawTicker;
      
      // Only process known LuSE tickers
      if (!LUSE_STOCK_TICKERS.includes(internalTicker)) {
        // But allow if it matches exactly in AFX format
        const isKnownAfx = Object.keys(AFX_TO_INTERNAL).includes(rawTicker);
        if (!isKnownAfx && !LUSE_STOCK_TICKERS.includes(rawTicker)) {
          continue;
        }
      }
      
      // Extract company name
      const name = cells.length > 1 ? cells[1] : '';
      
      // Parse numeric values from remaining cells
      let volume = 0;
      let price = 0;
      let change = 0;
      
      for (let i = 2; i < cells.length; i++) {
        const rawCell = cells[i];
        const cleanCell = rawCell.replace(/[,\s]/g, '');
        const num = parseFloat(cleanCell);
        
        if (isNaN(num)) continue;
        
        // Classify the number based on size and position
        if (Math.abs(num) > 100000) {
          // Very large number = likely volume
          volume = Math.round(num);
        } else if (num > 0 && num < 50000 && price === 0) {
          // Medium positive number = likely price (ZMW reasonable range)
          price = num;
        } else if (rawCell.startsWith('+') || rawCell.startsWith('-') || Math.abs(num) < 100) {
          // Signed number or small number = likely change
          if (rawCell.includes('%')) {
            // This is change percent, skip for now
          } else {
            change = num;
          }
        } else if (num > 1000 && num < 100000 && volume === 0) {
          // Medium-large number = could be volume
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
        });
      }
    }
  }
  
  const result = Array.from(stocksMap.values());
  console.log(`Parsed ${result.length} stocks with valid ZMW prices`);
  
  return result;
}

// Parse LASI index from the page
function parseLASIData(markdown: string): { indexValue: number; indexChange: number; indexChangePercent: number } | null {
  // Look for LASI patterns in the content
  const patterns = [
    /LASI\s*Index[:\s]*([\d,]+\.?\d*)/i,
    /LASI[:\s]*([\d,]+\.?\d*)/i,
    /All\s*Share\s*Index[:\s]*([\d,]+\.?\d*)/i,
    /Index\s*Value[:\s]*([\d,]+\.?\d*)/i,
  ];
  
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match) {
      const indexValue = parseFloat(match[1].replace(/,/g, ''));
      
      // LASI reasonable range: 5,000 - 50,000
      if (indexValue > 5000 && indexValue < 50000) {
        // Try to find change value/percentage nearby
        const changePatterns = [
          /LASI.*?([+-][\d,]+\.?\d*)\s*\(/i,
          /([+-]\s*[\d,]+\.?\d*)\s*%/,
          /change[:\s]*([+-]?\s*[\d,]+\.?\d*)/i,
        ];
        
        let indexChange = 0;
        let indexChangePercent = 0;
        
        for (const cp of changePatterns) {
          const cm = markdown.match(cp);
          if (cm) {
            const val = parseFloat(cm[1].replace(/[,\s]/g, ''));
            if (Math.abs(val) < 100) {
              // Likely a percentage
              indexChangePercent = val;
              indexChange = indexValue * (val / 100);
            } else if (Math.abs(val) < 1000) {
              // Likely absolute change
              indexChange = val;
              indexChangePercent = (val / (indexValue - val)) * 100;
            }
            break;
          }
        }
        
        return {
          indexValue: Math.round(indexValue * 100) / 100,
          indexChange: Math.round(indexChange * 100) / 100,
          indexChangePercent: Math.round(indexChangePercent * 100) / 100,
        };
      }
    }
  }
  
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Primary source: afx.kwayisi.org (more reliable table format)
    const afxUrl = 'https://afx.kwayisi.org/luse/';
    
    console.log('Scraping LuSE market data from afx.kwayisi.org...');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: afxUrl,
        formats: ['markdown'],
        waitFor: 3000,
        onlyMainContent: false,
        location: {
          country: 'ZM',
          languages: ['en']
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = data.data?.markdown || data.markdown || '';
    console.log('Scraped content length:', markdown.length);

    // Parse stock prices from afx.kwayisi.org table format
    let stocks = parseAfxStockData(markdown);
    const lasiData = parseLASIData(markdown);

    // If we didn't get enough stocks from AFX, try fallback to official LuSE
    if (stocks.length < 5) {
      console.log(`Only found ${stocks.length} stocks from AFX, trying LuSE official...`);
      
      const luseResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://www.luse.co.zm/market-data/',
          formats: ['markdown'],
          waitFor: 5000,
          onlyMainContent: false,
          location: { country: 'ZM', languages: ['en'] }
        }),
      });

      if (luseResponse.ok) {
        const luseData = await luseResponse.json();
        const luseMarkdown = luseData.data?.markdown || luseData.markdown || '';
        
        // Parse additional stocks from LuSE official
        const luseStocks = parseAfxStockData(luseMarkdown);
        
        // Merge unique stocks
        for (const stock of luseStocks) {
          const existing = stocks.find(s => s.ticker === stock.ticker);
          if (!existing && stock.currentPrice > 0) {
            stocks.push(stock);
          }
        }
      }
    }

    // Filter out any stocks with invalid prices
    stocks = stocks.filter(s => s.currentPrice > 0);

    // Calculate market summary
    const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);
    const totalValueTraded = stocks.reduce((sum, s) => sum + (s.currentPrice * s.volume), 0);

    const result: LuSEResponse = {
      success: true,
      stocks,
      marketSummary: {
        indexValue: lasiData?.indexValue || 0,
        indexChange: lasiData?.indexChange || 0,
        indexChangePercent: lasiData?.indexChangePercent || 0,
        totalVolume,
        totalValueTraded,
        advancingStocks: stocks.filter(s => s.change > 0).length,
        decliningStocks: stocks.filter(s => s.change < 0).length,
        unchangedStocks: stocks.filter(s => s.change === 0).length,
        marketStatus: isMarketOpen() ? 'open' : 'closed',
      },
      lastUpdated: new Date().toISOString(),
      source: 'afx-kwayisi',
    };

    console.log(`Successfully parsed ${stocks.length} stocks with ZMW prices from afx.kwayisi.org`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping LuSE:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape LuSE';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
