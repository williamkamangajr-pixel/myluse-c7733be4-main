-- Reset all stock prices to zero for fresh start with real LuSE data
UPDATE stocks SET 
  current_price = 0, 
  previous_close = 0, 
  change = 0, 
  change_percent = 0, 
  volume = 0, 
  market_cap = 0, 
  high_52w = 0, 
  low_52w = 0, 
  pe_ratio = NULL, 
  eps = NULL, 
  dividend_yield = NULL, 
  updated_at = now();

-- Reset market summary
UPDATE market_summary SET 
  index_value = 0, 
  index_change = 0, 
  index_change_percent = 0, 
  total_volume = 0, 
  total_value_traded = 0, 
  advancing_stocks = 0, 
  declining_stocks = 0, 
  unchanged_stocks = 0, 
  last_updated = now();

-- Clear LASI history
DELETE FROM lasi_history;

-- Reset wallet balances for fresh signups
UPDATE wallets SET balance = 0, updated_at = now();

-- Clear portfolio holdings for fresh start
DELETE FROM portfolio_holdings;

-- Clear portfolio snapshots
DELETE FROM portfolio_snapshots;

-- Clear orders history
DELETE FROM orders;

-- Clear watchlist
DELETE FROM watchlist;