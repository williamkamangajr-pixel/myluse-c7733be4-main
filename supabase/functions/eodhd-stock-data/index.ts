const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close?: number;
  // Aliased fields for frontend compatibility
  price?: number;
  previousClose?: number;
}

// Ticker mapping for afx.kwayisi.org
const AFX_TICKER_MAP: Record<string, string> = {
  'AECI': 'AELZ',
  'BATA': 'BATZ',
  'CECZ': 'CEC',
  'SCBL': 'SCBZ',
  'ZCCM': 'ZCCM-IH',
};

// Parse stock data from afx.kwayisi.org markdown (fallback)
function parseAfxStockData(markdown: string, targetTicker: string): StockDataPoint | null {
  const lines = markdown.split('\n');
  
  // Normalize ticker for matching
  const normalizedTarget = targetTicker.replace('.LUSE', '').toUpperCase();
  
  for (const line of lines) {
    if (!line.includes('|')) continue;
    
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length < 4) continue;
    
    const afxTicker = cells[0].replace(/[\[\]]/g, '').trim().toUpperCase();
    const internalTicker = AFX_TICKER_MAP[afxTicker] || afxTicker;
    
    // Check if this matches our target
    if (internalTicker === normalizedTarget || afxTicker === normalizedTarget) {
      // Extract price from cells
      for (let i = 2; i < cells.length; i++) {
        const cell = cells[i].replace(/[,\s]/g, '');
        const price = parseFloat(cell);
        
        if (!isNaN(price) && price > 0 && price < 10000) {
          console.log(`[AFX Fallback] Found ${targetTicker}: ${price} ZMW`);
          
          return {
            date: new Date().toISOString().split('T')[0],
            open: price,
            high: price,
            low: price,
            close: price,
            volume: 0,
            price: price,
            previousClose: price,
          };
        }
      }
    }
  }
  
  return null;
}

// Fetch fallback data from Firecrawl
async function fetchFirecrawlFallback(ticker: string, firecrawlKey: string): Promise<StockDataPoint | null> {
  try {
    console.log(`[Fallback] Trying Firecrawl for ${ticker}...`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://afx.kwayisi.org/luse/',
        formats: ['markdown'],
        waitFor: 3000,
        onlyMainContent: false,
        location: { country: 'ZM', languages: ['en'] },
      }),
    });
    
    if (!response.ok) {
      console.error('[Fallback] Firecrawl request failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || '';
    
    return parseAfxStockData(markdown, ticker);
  } catch (error) {
    console.error('[Fallback] Firecrawl error:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EODHD_API_KEY = Deno.env.get('EODHD_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!EODHD_API_KEY) {
      console.error('EODHD_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'EODHD API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { ticker, period = '1D', useRealtime = true } = await req.json();

    if (!ticker) {
      return new Response(
        JSON.stringify({ success: false, error: 'Ticker is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format ticker with .LUSE suffix for Lusaka Securities Exchange
    const formattedTicker = ticker.includes('.') ? ticker : `${ticker}.LUSE`;
    
    console.log(`Fetching data for ${formattedTicker}, period: ${period}, realtime: ${useRealtime}`);

    let data: StockDataPoint[] = [];
    let source: 'realtime' | 'eod' | 'firecrawl' = 'realtime';

    // Try real-time endpoint first for live dashboard
    if (useRealtime) {
      try {
        const realtimeUrl = `https://eodhd.com/api/real-time/${formattedTicker}?api_token=${EODHD_API_KEY}&fmt=json`;
        console.log('Trying real-time endpoint...');
        
        const realtimeResponse = await fetch(realtimeUrl);
        
        if (realtimeResponse.ok) {
          const realtimeData = await realtimeResponse.json();
          
          // Check if real-time data is valid and not delayed
          if (realtimeData && realtimeData.close && !realtimeData.error) {
            const price = parseFloat(realtimeData.close);
            const previousClose = parseFloat(realtimeData.previousClose) || price;
            
            if (price > 0) {
              data = [{
                date: new Date().toISOString().split('T')[0],
                open: parseFloat(realtimeData.open) || price,
                high: parseFloat(realtimeData.high) || price,
                low: parseFloat(realtimeData.low) || price,
                close: price,
                volume: parseInt(realtimeData.volume) || 0,
                // Add aliased fields for frontend compatibility
                price: price,
                previousClose: previousClose,
              }];
              
              console.log(`Real-time data retrieved: ${price} ZMW (prev: ${previousClose})`);
            }
          }
        }
      } catch (realtimeError) {
        console.warn('Real-time endpoint failed, will try fallback:', realtimeError);
      }
    }

    // Fallback to EOD endpoint if real-time failed or not requested
    if (data.length === 0) {
      source = 'eod';
      
      // Calculate date range based on period
      const now = new Date();
      const fromDate = new Date();
      
      switch (period) {
        case '1D':
          fromDate.setDate(now.getDate() - 5); // Get last 5 days to ensure we have data
          break;
        case '1W':
          fromDate.setDate(now.getDate() - 7);
          break;
        case '1M':
          fromDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          fromDate.setMonth(now.getMonth() - 3);
          break;
        case '1Y':
          fromDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          fromDate.setDate(now.getDate() - 30);
      }

      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = now.toISOString().split('T')[0];

      console.log(`Fetching EOD data from ${fromDateStr} to ${toDateStr}`);

      // EODHD API endpoint for historical EOD data with .LUSE suffix
      const eodUrl = `https://eodhd.com/api/eod/${formattedTicker}?from=${fromDateStr}&to=${toDateStr}&period=d&api_token=${EODHD_API_KEY}&fmt=json`;

      const eodResponse = await fetch(eodUrl);

      if (eodResponse.ok) {
        const eodData = await eodResponse.json();
        
        if (Array.isArray(eodData) && eodData.length > 0) {
          // Filter and parse data ensuring ZMW values
          data = eodData.map((point: any) => {
            const close = parseFloat(point.close) || 0;
            return {
              date: point.date,
              open: parseFloat(point.open) || 0,
              high: parseFloat(point.high) || 0,
              low: parseFloat(point.low) || 0,
              close: close,
              volume: parseInt(point.volume) || 0,
              adjusted_close: parseFloat(point.adjusted_close) || close,
              // Add aliased fields
              price: close,
              previousClose: parseFloat(point.adjusted_close) || close,
            };
          }).filter((point: StockDataPoint) => point.close > 0);

          console.log(`EOD data retrieved: ${data.length} points`);
        }
      } else {
        console.warn(`EOD request failed: ${eodResponse.status}`);
      }
    }

    // Final fallback: Use Firecrawl if both EODHD methods failed
    if (data.length === 0 && FIRECRAWL_API_KEY) {
      console.log('EODHD failed, attempting Firecrawl fallback...');
      source = 'firecrawl';
      
      const fallbackData = await fetchFirecrawlFallback(formattedTicker, FIRECRAWL_API_KEY);
      
      if (fallbackData) {
        data = [fallbackData];
        console.log(`Firecrawl fallback successful: ${fallbackData.close} ZMW`);
      }
    }

    // If still no data, return error
    if (data.length === 0) {
      console.error(`No data found for ${formattedTicker} from any source`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `No data available for ${formattedTicker}`,
          ticker: formattedTicker
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        source,
        ticker: formattedTicker,
        currency: 'ZMW',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching stock data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
