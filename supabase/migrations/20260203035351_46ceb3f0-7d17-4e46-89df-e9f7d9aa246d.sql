-- Clear all user-related data
DELETE FROM wallet_transactions;
DELETE FROM wallets;
DELETE FROM portfolio_bond_holdings;
DELETE FROM portfolio_snapshots;
DELETE FROM portfolio_holdings;
DELETE FROM portfolios;
DELETE FROM orders;
DELETE FROM notifications;
DELETE FROM price_alerts;
DELETE FROM watchlist;
DELETE FROM user_passkeys;
DELETE FROM user_passcodes;
DELETE FROM user_profiles;
DELETE FROM ai_chat_history;
DELETE FROM broker_order_actions;
DELETE FROM broker_sessions;
DELETE FROM broker_settings;
DELETE FROM broker_activity_log;
DELETE FROM broker_client_assignments;
DELETE FROM broker_roles;
DELETE FROM brokers;

-- Clear market data (will be repopulated from LuSE)
DELETE FROM price_history;
DELETE FROM lasi_history;
DELETE FROM stock_trade_summaries;
DELETE FROM dividend_history;

-- Reset stocks to zero prices
UPDATE stocks SET 
  current_price = 0,
  previous_close = 0,
  change = 0,
  change_percent = 0,
  volume = 0,
  market_cap = 0,
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
  market_status = 'closed',
  last_updated = now();