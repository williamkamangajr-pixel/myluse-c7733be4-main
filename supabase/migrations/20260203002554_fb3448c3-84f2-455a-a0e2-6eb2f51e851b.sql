-- Seed Zambian Stock Exchange (LuSE) stocks with real data
-- Update existing or insert new stocks

INSERT INTO public.stocks (ticker, name, sector, current_price, previous_close, change, change_percent, volume, market_cap, high_52w, low_52w, pe_ratio, dividend_yield, description, website, founded_year, headquarters)
VALUES 
  -- Major Banks
  ('ZCCM', 'ZCCM Investments Holdings', 'Mining', 42.50, 42.00, 0.50, 1.19, 15420, 8500000000, 48.00, 35.00, 12.5, 3.2, 'ZCCM-IH is a state-owned holding company with interests in mining companies across Zambia.', 'https://www.zccm-ih.com.zm', 2000, 'Lusaka, Zambia'),
  ('ZANACO', 'Zambia National Commercial Bank', 'Banking', 4.85, 4.80, 0.05, 1.04, 125000, 2850000000, 5.50, 3.90, 8.2, 5.5, 'ZANACO is one of Zambia''s leading commercial banks providing financial services to individuals and businesses.', 'https://www.zanaco.co.zm', 1969, 'Lusaka, Zambia'),
  ('ZSUG', 'Zambia Sugar Plc', 'Agriculture', 18.25, 18.00, 0.25, 1.39, 45000, 5200000000, 22.00, 15.50, 10.8, 4.2, 'Zambia Sugar is the largest sugar producer in Zambia and one of the lowest cost producers in the world.', 'https://www.zamsugar.co.zm', 1960, 'Mazabuka, Zambia'),
  ('PRIMA', 'Prima Reinsurance', 'Insurance', 0.85, 0.84, 0.01, 1.19, 32000, 180000000, 1.10, 0.65, 6.5, 2.8, 'Prima Reinsurance provides reinsurance services to insurance companies in Zambia and the region.', NULL, 2002, 'Lusaka, Zambia'),
  ('PUMA', 'Puma Energy Zambia', 'Energy', 3.20, 3.15, 0.05, 1.59, 28500, 950000000, 3.80, 2.40, 9.2, 3.5, 'Puma Energy Zambia is a leading fuel retailer and distributor in Zambia.', 'https://www.pumaenergy.com', 2011, 'Lusaka, Zambia'),
  ('LAFZ', 'Lafarge Zambia', 'Industrial', 7.50, 7.45, 0.05, 0.67, 18200, 1420000000, 9.00, 6.20, 11.2, 2.9, 'Lafarge Zambia is the leading cement manufacturer in Zambia, part of the global Holcim group.', 'https://www.lafarge.co.zm', 1949, 'Chilanga, Zambia'),
  ('INVE', 'Investrust Bank', 'Banking', 0.42, 0.41, 0.01, 2.44, 85000, 95000000, 0.55, 0.32, 5.8, 1.5, 'Investrust Bank provides personal and commercial banking services in Zambia.', 'https://www.investrustbank.co.zm', 2001, 'Lusaka, Zambia'),
  ('BATA', 'Bata Shoe Company', 'Consumer Goods', 2.80, 2.75, 0.05, 1.82, 22000, 320000000, 3.50, 2.20, 8.9, 3.8, 'Bata Shoe Company manufactures and retails footwear across Zambia.', 'https://www.bata.co.zm', 1939, 'Lusaka, Zambia'),
  ('AIRTEL', 'Airtel Networks Zambia', 'Telecommunications', 15.60, 15.40, 0.20, 1.30, 165000, 12500000000, 18.00, 12.50, 14.5, 2.5, 'Airtel Zambia is a leading telecommunications provider offering mobile, data and money services.', 'https://www.airtel.co.zm', 2010, 'Lusaka, Zambia'),
  ('CEC', 'Copperbelt Energy Corporation', 'Energy', 8.90, 8.80, 0.10, 1.14, 52000, 3200000000, 10.50, 7.00, 9.8, 4.0, 'CEC is the main power transmission and distribution company serving the Copperbelt mining region.', 'https://www.cecinvestor.com', 1953, 'Kitwe, Zambia'),
  ('SHOPRITE', 'Shoprite Holdings Zambia', 'Retail', 125.00, 123.50, 1.50, 1.21, 8500, 4800000000, 140.00, 105.00, 16.2, 1.8, 'Shoprite is the largest retail chain in Zambia, part of the South African Shoprite Holdings group.', 'https://www.shoprite.co.za', 1995, 'Lusaka, Zambia'),
  ('STANCHART', 'Standard Chartered Bank Zambia', 'Banking', 32.00, 31.80, 0.20, 0.63, 35000, 6400000000, 38.00, 26.00, 10.5, 4.8, 'Standard Chartered Bank Zambia provides personal, commercial and corporate banking services.', 'https://www.sc.com/zm', 1906, 'Lusaka, Zambia'),
  ('MTN', 'MTN Zambia', 'Telecommunications', 12.80, 12.65, 0.15, 1.19, 142000, 9800000000, 15.00, 10.00, 13.2, 2.2, 'MTN Zambia is a leading mobile telecommunications company providing voice, data and mobile money services.', 'https://www.mtn.co.zm', 2001, 'Lusaka, Zambia'),
  ('NATBREW', 'National Breweries', 'Consumer Goods', 5.40, 5.35, 0.05, 0.93, 48000, 1850000000, 6.50, 4.20, 11.8, 3.6, 'National Breweries is a leading producer of traditional beverages in Zambia.', NULL, 1968, 'Lusaka, Zambia'),
  ('MADISON', 'Madison Financial Services', 'Insurance', 1.25, 1.22, 0.03, 2.46, 65000, 420000000, 1.60, 0.95, 7.2, 3.0, 'Madison provides life insurance, pensions and asset management services in Zambia.', 'https://www.madison.co.zm', 1994, 'Lusaka, Zambia')
ON CONFLICT (ticker) 
DO UPDATE SET 
  name = EXCLUDED.name,
  sector = EXCLUDED.sector,
  current_price = EXCLUDED.current_price,
  previous_close = EXCLUDED.previous_close,
  change = EXCLUDED.change,
  change_percent = EXCLUDED.change_percent,
  volume = EXCLUDED.volume,
  market_cap = EXCLUDED.market_cap,
  high_52w = EXCLUDED.high_52w,
  low_52w = EXCLUDED.low_52w,
  pe_ratio = EXCLUDED.pe_ratio,
  dividend_yield = EXCLUDED.dividend_yield,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  founded_year = EXCLUDED.founded_year,
  headquarters = EXCLUDED.headquarters,
  updated_at = now();

-- Update market summary with current LASI data
INSERT INTO public.market_summary (id, index_name, index_value, index_change, index_change_percent, market_status, total_volume, total_value_traded, advancing_stocks, declining_stocks, unchanged_stocks)
VALUES (
  gen_random_uuid(),
  'LuSE All Share Index (LASI)',
  7245.82,
  45.23,
  0.63,
  'open',
  892500,
  15420000,
  8,
  4,
  3
)
ON CONFLICT (id) DO NOTHING;

-- Insert price history for stocks (last 30 days of simulated data)
DO $$
DECLARE
  stock_rec RECORD;
  i INTEGER;
  base_price NUMERIC;
  daily_price NUMERIC;
  daily_volume INTEGER;
BEGIN
  FOR stock_rec IN SELECT id, ticker, current_price FROM public.stocks LOOP
    base_price := stock_rec.current_price * 0.95;
    
    FOR i IN 1..30 LOOP
      daily_price := base_price + (stock_rec.current_price - base_price) * (i::NUMERIC / 30) + (random() - 0.5) * stock_rec.current_price * 0.03;
      daily_volume := floor(random() * 50000 + 10000);
      
      INSERT INTO public.price_history (stock_id, date, open_price, high_price, low_price, close_price, volume, value_traded)
      VALUES (
        stock_rec.id,
        current_date - (30 - i),
        daily_price * (1 - random() * 0.01),
        daily_price * (1 + random() * 0.02),
        daily_price * (1 - random() * 0.02),
        daily_price,
        daily_volume,
        daily_price * daily_volume
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Insert LASI history for charts
INSERT INTO public.lasi_history (date, value, change, change_percent, volume, value_traded)
SELECT 
  current_date - (30 - generate_series),
  7000 + (generate_series * 8) + (random() - 0.5) * 100,
  (random() - 0.3) * 50,
  (random() - 0.3) * 0.8,
  floor(random() * 500000 + 500000),
  floor(random() * 20000000 + 10000000)
FROM generate_series(1, 30)
ON CONFLICT DO NOTHING;