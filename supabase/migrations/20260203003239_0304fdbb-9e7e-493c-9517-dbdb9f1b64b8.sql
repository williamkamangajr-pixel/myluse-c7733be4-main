-- Create user_passkeys table for WebAuthn credentials
CREATE TABLE public.user_passkeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  device_type TEXT,
  backed_up BOOLEAN DEFAULT false,
  transports TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create user_passcodes table for 4-digit quick access
CREATE TABLE public.user_passcodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  passcode_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_passcodes ENABLE ROW LEVEL SECURITY;

-- Passkeys policies
CREATE POLICY "Users can view their own passkeys"
ON public.user_passkeys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own passkeys"
ON public.user_passkeys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passkeys"
ON public.user_passkeys FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own passkeys"
ON public.user_passkeys FOR UPDATE
USING (auth.uid() = user_id);

-- Passcode policies
CREATE POLICY "Users can view their own passcode"
ON public.user_passcodes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own passcode"
ON public.user_passcodes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passcode"
ON public.user_passcodes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passcode"
ON public.user_passcodes FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_passcodes_updated_at
BEFORE UPDATE ON public.user_passcodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();