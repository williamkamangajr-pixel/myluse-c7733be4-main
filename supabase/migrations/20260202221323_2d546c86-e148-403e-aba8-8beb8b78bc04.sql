-- Money Acumen Advisory - Complete Database Schema
-- ================================================

-- ===========================================
-- CORE PUBLIC DATA TABLES (Read-Only Access)
-- ===========================================

-- Stocks table - LuSE listed equities
CREATE TABLE public.stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sector TEXT,
  current_price NUMERIC(15, 4) NOT NULL DEFAULT 0,
  previous_close NUMERIC(15, 4),
  change NUMERIC(15, 4) DEFAULT 0,
  change_percent NUMERIC(8, 4) DEFAULT 0,
  volume BIGINT DEFAULT 0,
  market_cap NUMERIC(20, 2),
  high_52w NUMERIC(15, 4),
  low_52w NUMERIC(15, 4),
  pe_ratio NUMERIC(10, 2),
  eps NUMERIC(15, 4),
  dividend_yield NUMERIC(8, 4),
  logo_url TEXT,
  description TEXT,
  website TEXT,
  founded_year INTEGER,
  employees INTEGER,
  headquarters TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Market summary - Single-row LASI index data
CREATE TABLE public.market_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  index_name TEXT NOT NULL DEFAULT 'LASI',
  index_value NUMERIC(15, 4) NOT NULL DEFAULT 0,
  index_change NUMERIC(15, 4) DEFAULT 0,
  index_change_percent NUMERIC(8, 4) DEFAULT 0,
  market_status TEXT DEFAULT 'closed',
  total_volume BIGINT DEFAULT 0,
  total_value_traded NUMERIC(20, 2) DEFAULT 0,
  advancing_stocks INTEGER DEFAULT 0,
  declining_stocks INTEGER DEFAULT 0,
  unchanged_stocks INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LASI history - Historical index values
CREATE TABLE public.lasi_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  value NUMERIC(15, 4) NOT NULL,
  change NUMERIC(15, 4),
  change_percent NUMERIC(8, 4),
  volume BIGINT,
  value_traded NUMERIC(20, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Price history - Daily OHLCV data per stock
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  open_price NUMERIC(15, 4),
  high_price NUMERIC(15, 4),
  low_price NUMERIC(15, 4),
  close_price NUMERIC(15, 4) NOT NULL,
  volume BIGINT DEFAULT 0,
  value_traded NUMERIC(20, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(stock_id, date)
);

-- Stock trade summaries - Daily trade summaries
CREATE TABLE public.stock_trade_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_ticker TEXT NOT NULL,
  date DATE NOT NULL,
  opening_price NUMERIC(15, 4),
  closing_price NUMERIC(15, 4),
  high_price NUMERIC(15, 4),
  low_price NUMERIC(15, 4),
  volume_traded BIGINT DEFAULT 0,
  value_traded NUMERIC(20, 2),
  trades_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(stock_ticker, date)
);

-- Bonds - LuSE bond listings
CREATE TABLE public.bonds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  issuer TEXT,
  bond_type TEXT DEFAULT 'corporate',
  coupon_rate NUMERIC(8, 4),
  yield_to_maturity NUMERIC(8, 4),
  face_value NUMERIC(15, 2) DEFAULT 1000,
  current_price NUMERIC(15, 4),
  maturity_date DATE,
  issue_date DATE,
  payment_frequency TEXT DEFAULT 'semi-annual',
  credit_rating TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dividend history - Dividend payout records
CREATE TABLE public.dividend_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_ticker TEXT NOT NULL,
  dividend_per_share NUMERIC(15, 4) NOT NULL,
  ex_dividend_date DATE NOT NULL,
  record_date DATE,
  payment_date DATE,
  dividend_type TEXT DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================
-- USER-SCOPED TABLES (Session-Based RLS)
-- ===========================================

-- Portfolios - User portfolio containers
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Portfolio',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio holdings - Stock positions
CREATE TABLE public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  stock_ticker TEXT NOT NULL,
  shares_owned NUMERIC(15, 6) NOT NULL DEFAULT 0,
  purchase_price NUMERIC(15, 4) NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trade_type TEXT NOT NULL DEFAULT 'buy',
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio bond holdings - Bond positions
CREATE TABLE public.portfolio_bond_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  bond_ticker TEXT NOT NULL,
  units NUMERIC(15, 6) NOT NULL DEFAULT 0,
  purchase_price NUMERIC(15, 4) NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio snapshots - Historical portfolio values
CREATE TABLE public.portfolio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_value NUMERIC(20, 2) NOT NULL,
  daily_change NUMERIC(20, 2),
  daily_change_percent NUMERIC(8, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(portfolio_id, date)
);

-- Wallets - User cash balances
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  balance NUMERIC(20, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ZMW',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wallet transactions - Deposit/withdraw history
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC(20, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  reference TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Watchlist - Starred stocks per session
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  stock_ticker TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, stock_ticker)
);

-- Price alerts - Price trigger notifications
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  stock_ticker TEXT NOT NULL,
  target_price NUMERIC(15, 4) NOT NULL,
  direction TEXT NOT NULL DEFAULT 'above',
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications - User notification inbox
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles - User settings and preferences
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  mobile_money_number TEXT,
  mobile_money_provider TEXT,
  selected_broker_id TEXT DEFAULT 'money-acumen',
  notification_preferences JSONB DEFAULT '{"price_alerts": true, "portfolio_updates": true, "market_news": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI chat history - AI conversation logs
CREATE TABLE public.ai_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ===========================================

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lasi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_trade_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_bond_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES - PUBLIC DATA (Read-Only)
-- ===========================================

-- Stocks - Public read access
CREATE POLICY "Anyone can view stocks" ON public.stocks
  FOR SELECT USING (true);

-- Market summary - Public read access
CREATE POLICY "Anyone can view market summary" ON public.market_summary
  FOR SELECT USING (true);

-- LASI history - Public read access
CREATE POLICY "Anyone can view LASI history" ON public.lasi_history
  FOR SELECT USING (true);

-- Price history - Public read access
CREATE POLICY "Anyone can view price history" ON public.price_history
  FOR SELECT USING (true);

-- Stock trade summaries - Public read access
CREATE POLICY "Anyone can view trade summaries" ON public.stock_trade_summaries
  FOR SELECT USING (true);

-- Bonds - Public read access
CREATE POLICY "Anyone can view bonds" ON public.bonds
  FOR SELECT USING (true);

-- Dividend history - Public read access
CREATE POLICY "Anyone can view dividend history" ON public.dividend_history
  FOR SELECT USING (true);

-- ===========================================
-- RLS POLICIES - SESSION-BASED USER DATA
-- Note: Using permissive policies for session-based anonymous access
-- ===========================================

-- Portfolios policies
CREATE POLICY "Users can view their own portfolios" ON public.portfolios
  FOR SELECT USING (true);

CREATE POLICY "Users can create portfolios" ON public.portfolios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own portfolios" ON public.portfolios
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own portfolios" ON public.portfolios
  FOR DELETE USING (true);

-- Portfolio holdings policies
CREATE POLICY "Users can view portfolio holdings" ON public.portfolio_holdings
  FOR SELECT USING (true);

CREATE POLICY "Users can create portfolio holdings" ON public.portfolio_holdings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update portfolio holdings" ON public.portfolio_holdings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete portfolio holdings" ON public.portfolio_holdings
  FOR DELETE USING (true);

-- Portfolio bond holdings policies
CREATE POLICY "Users can view bond holdings" ON public.portfolio_bond_holdings
  FOR SELECT USING (true);

CREATE POLICY "Users can create bond holdings" ON public.portfolio_bond_holdings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update bond holdings" ON public.portfolio_bond_holdings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete bond holdings" ON public.portfolio_bond_holdings
  FOR DELETE USING (true);

-- Portfolio snapshots policies
CREATE POLICY "Users can view portfolio snapshots" ON public.portfolio_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Users can create portfolio snapshots" ON public.portfolio_snapshots
  FOR INSERT WITH CHECK (true);

-- Wallets policies
CREATE POLICY "Users can view wallets" ON public.wallets
  FOR SELECT USING (true);

CREATE POLICY "Users can create wallets" ON public.wallets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update wallets" ON public.wallets
  FOR UPDATE USING (true);

-- Wallet transactions policies
CREATE POLICY "Users can view wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create wallet transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (true);

-- Watchlist policies
CREATE POLICY "Users can view watchlist" ON public.watchlist
  FOR SELECT USING (true);

CREATE POLICY "Users can create watchlist items" ON public.watchlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete watchlist items" ON public.watchlist
  FOR DELETE USING (true);

-- Price alerts policies
CREATE POLICY "Users can view price alerts" ON public.price_alerts
  FOR SELECT USING (true);

CREATE POLICY "Users can create price alerts" ON public.price_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update price alerts" ON public.price_alerts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete price alerts" ON public.price_alerts
  FOR DELETE USING (true);

-- Notifications policies
CREATE POLICY "Users can view notifications" ON public.notifications
  FOR SELECT USING (true);

CREATE POLICY "Users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update notifications" ON public.notifications
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete notifications" ON public.notifications
  FOR DELETE USING (true);

-- User profiles policies
CREATE POLICY "Users can view profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update profiles" ON public.user_profiles
  FOR UPDATE USING (true);

-- AI chat history policies
CREATE POLICY "Users can view chat history" ON public.ai_chat_history
  FOR SELECT USING (true);

CREATE POLICY "Users can create chat messages" ON public.ai_chat_history
  FOR INSERT WITH CHECK (true);

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

CREATE TRIGGER update_stocks_updated_at
  BEFORE UPDATE ON public.stocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bonds_updated_at
  BEFORE UPDATE ON public.bonds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_bond_holdings_updated_at
  BEFORE UPDATE ON public.portfolio_bond_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX idx_stocks_ticker ON public.stocks(ticker);
CREATE INDEX idx_stocks_sector ON public.stocks(sector);
CREATE INDEX idx_price_history_stock_date ON public.price_history(stock_id, date DESC);
CREATE INDEX idx_trade_summaries_ticker_date ON public.stock_trade_summaries(stock_ticker, date DESC);
CREATE INDEX idx_lasi_history_date ON public.lasi_history(date DESC);
CREATE INDEX idx_portfolios_session ON public.portfolios(session_id);
CREATE INDEX idx_portfolio_holdings_portfolio ON public.portfolio_holdings(portfolio_id);
CREATE INDEX idx_wallets_session ON public.wallets(session_id);
CREATE INDEX idx_watchlist_session ON public.watchlist(session_id);
CREATE INDEX idx_price_alerts_session ON public.price_alerts(session_id);
CREATE INDEX idx_notifications_session ON public.notifications(session_id);
CREATE INDEX idx_notifications_unread ON public.notifications(session_id, is_read);
CREATE INDEX idx_user_profiles_session ON public.user_profiles(session_id);
CREATE INDEX idx_ai_chat_session ON public.ai_chat_history(session_id);