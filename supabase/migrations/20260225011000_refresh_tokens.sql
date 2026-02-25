-- Refresh Token Revocation Table
CREATE TABLE public.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS (Row Level Security)
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own refresh tokens" ON public.refresh_tokens FOR
SELECT TO authenticated USING (auth.uid() = user_id);
-- This policy allows the service role or backend functions to manage tokens
-- In a real app, you'd restrict this further.
-- Index for better performance
CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);