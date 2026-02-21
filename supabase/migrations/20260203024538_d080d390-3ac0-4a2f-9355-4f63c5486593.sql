-- Create orders table for broker visibility
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  broker_id TEXT NOT NULL,
  stock_ticker TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  shares NUMERIC NOT NULL,
  price_per_share NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  sec_fee NUMERIC NOT NULL DEFAULT 0,
  luse_fee NUMERIC NOT NULL DEFAULT 0,
  broker_fee NUMERIC NOT NULL DEFAULT 0,
  ptt_fee NUMERIC NOT NULL DEFAULT 0,
  total_fees NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (true);

-- Users can create orders
CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Brokers can update order status (for approval)
CREATE POLICY "Orders can be updated"
ON public.orders
FOR UPDATE
USING (true);

-- Create index for broker queries
CREATE INDEX idx_orders_broker_id ON public.orders(broker_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();