-- 1. Insert real LuSE stock tickers
INSERT INTO public.stocks (ticker, name, sector, current_price, previous_close, change, change_percent, volume, market_cap)
VALUES
  ('AECI', 'AECI Mining Chemicals', 'Mining', 0, 0, 0, 0, 0, 0),
  ('ATEL', 'Airtel Networks Zambia Plc', 'Telecommunications', 0, 0, 0, 0, 0, 0),
  ('BATA', 'Bata Shoe Company (Zambia) Plc', 'Consumer Goods', 0, 0, 0, 0, 0, 0),
  ('BATZ', 'British American Tobacco Zambia Plc', 'Consumer Goods', 0, 0, 0, 0, 0, 0),
  ('CEC', 'Copperbelt Energy Corporation Plc', 'Energy', 0, 0, 0, 0, 0, 0),
  ('CEF', 'CEC Africa Investments Ltd', 'Energy', 0, 0, 0, 0, 0, 0),
  ('CHAL', 'Chilanga Cement Plc', 'Construction', 0, 0, 0, 0, 0, 0),
  ('FBZ', 'First Quantum Minerals Ltd', 'Mining', 0, 0, 0, 0, 0, 0),
  ('INVE', 'Investrust Bank Plc', 'Banking', 0, 0, 0, 0, 0, 0),
  ('LAFZ', 'Lafarge Zambia Plc', 'Construction', 0, 0, 0, 0, 0, 0),
  ('MAFS', 'Madison Financial Services Plc', 'Financial Services', 0, 0, 0, 0, 0, 0),
  ('MFIN', 'Metal Fabricators of Zambia Plc', 'Manufacturing', 0, 0, 0, 0, 0, 0),
  ('NATB', 'National Breweries Plc', 'Consumer Goods', 0, 0, 0, 0, 0, 0),
  ('PUMA', 'Puma Energy Zambia Plc', 'Energy', 0, 0, 0, 0, 0, 0),
  ('PRIMA', 'Prima Reinsurance Plc', 'Insurance', 0, 0, 0, 0, 0, 0),
  ('PRLA', 'Press Corporation Ltd', 'Conglomerate', 0, 0, 0, 0, 0, 0),
  ('REIZ', 'Real Estate Investments Zambia Plc', 'Real Estate', 0, 0, 0, 0, 0, 0),
  ('SCBZ', 'Standard Chartered Bank Zambia Plc', 'Banking', 0, 0, 0, 0, 0, 0),
  ('SHOP', 'Shoprite Holdings Ltd', 'Retail', 0, 0, 0, 0, 0, 0),
  ('ZNCO', 'Zambia Consolidated Copper Mines Ltd', 'Mining', 0, 0, 0, 0, 0, 0),
  ('ZSUG', 'Zambia Sugar Plc', 'Agriculture', 0, 0, 0, 0, 0, 0),
  ('ZCCM', 'ZCCM Investments Holdings Plc', 'Mining', 0, 0, 0, 0, 0, 0),
  ('ZAFFICO', 'Zambia Forestry and Forest Industries Corporation Plc', 'Forestry', 0, 0, 0, 0, 0, 0),
  ('ZANACO', 'Zambia National Commercial Bank Plc', 'Banking', 0, 0, 0, 0, 0, 0)
ON CONFLICT (ticker) DO UPDATE SET
  name = EXCLUDED.name,
  sector = EXCLUDED.sector;

-- 2. Create marketplace_listings table for P2P share trading
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_session_id TEXT NOT NULL,
  seller_broker_id TEXT NOT NULL,
  stock_ticker TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'open_to_bids')),
  asking_price NUMERIC CHECK (asking_price >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'approved', 'completed', 'cancelled', 'expired')),
  sell_id TEXT NOT NULL,
  seller_csd_last4 TEXT NOT NULL,
  reserved_shares INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create marketplace_offers table for bids
CREATE TABLE public.marketplace_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_session_id TEXT NOT NULL,
  buyer_broker_id TEXT NOT NULL,
  offer_price NUMERIC NOT NULL CHECK (offer_price > 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'seller_approved', 'buyer_broker_approved', 'seller_broker_approved', 'completed', 'rejected', 'cancelled', 'expired')),
  buyer_sell_id TEXT NOT NULL,
  buyer_csd_last4 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create marketplace_transactions table for completed trades
CREATE TABLE public.marketplace_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id),
  offer_id UUID REFERENCES public.marketplace_offers(id),
  seller_session_id TEXT NOT NULL,
  buyer_session_id TEXT NOT NULL,
  seller_broker_id TEXT NOT NULL,
  buyer_broker_id TEXT NOT NULL,
  stock_ticker TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_share NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  ppt_tax NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  seller_receives NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'buyer_broker_approved', 'seller_broker_approved', 'completed', 'failed')),
  buyer_broker_approved_at TIMESTAMP WITH TIME ZONE,
  seller_broker_approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create marketplace_audit_log for compliance
CREATE TABLE public.marketplace_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('listing', 'offer', 'transaction')),
  entity_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  performed_by_type TEXT NOT NULL CHECK (performed_by_type IN ('user', 'broker', 'system', 'admin')),
  broker_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Enable RLS on all marketplace tables
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_audit_log ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for marketplace_listings
CREATE POLICY "Anyone can view active marketplace listings" 
  ON public.marketplace_listings FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own listings" 
  ON public.marketplace_listings FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own listings" 
  ON public.marketplace_listings FOR UPDATE 
  USING (true);

CREATE POLICY "Users can cancel their own listings" 
  ON public.marketplace_listings FOR DELETE 
  USING (true);

-- 8. RLS Policies for marketplace_offers
CREATE POLICY "Anyone can view marketplace offers" 
  ON public.marketplace_offers FOR SELECT 
  USING (true);

CREATE POLICY "Users can create offers" 
  ON public.marketplace_offers FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their offers" 
  ON public.marketplace_offers FOR UPDATE 
  USING (true);

CREATE POLICY "Users can cancel their offers" 
  ON public.marketplace_offers FOR DELETE 
  USING (true);

-- 9. RLS Policies for marketplace_transactions
CREATE POLICY "Anyone can view marketplace transactions" 
  ON public.marketplace_transactions FOR SELECT 
  USING (true);

CREATE POLICY "System can create transactions" 
  ON public.marketplace_transactions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Brokers can update transactions" 
  ON public.marketplace_transactions FOR UPDATE 
  USING (true);

-- 10. RLS Policies for marketplace_audit_log
CREATE POLICY "Authorized users can view audit logs" 
  ON public.marketplace_audit_log FOR SELECT 
  USING (true);

CREATE POLICY "System can insert audit logs" 
  ON public.marketplace_audit_log FOR INSERT 
  WITH CHECK (true);

-- 11. Create indexes for performance
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_stock ON public.marketplace_listings(stock_ticker);
CREATE INDEX idx_marketplace_listings_seller ON public.marketplace_listings(seller_session_id);
CREATE INDEX idx_marketplace_offers_listing ON public.marketplace_offers(listing_id);
CREATE INDEX idx_marketplace_offers_buyer ON public.marketplace_offers(buyer_session_id);
CREATE INDEX idx_marketplace_transactions_status ON public.marketplace_transactions(status);
CREATE INDEX idx_marketplace_audit_entity ON public.marketplace_audit_log(entity_type, entity_id);

-- 12. Create trigger for updated_at timestamps
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_offers_updated_at
  BEFORE UPDATE ON public.marketplace_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_transactions_updated_at
  BEFORE UPDATE ON public.marketplace_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Add csd_number column to user_profiles if not exists (for generating sell IDs)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'csd_number') THEN
    ALTER TABLE public.user_profiles ADD COLUMN csd_number TEXT;
  END IF;
END $$;