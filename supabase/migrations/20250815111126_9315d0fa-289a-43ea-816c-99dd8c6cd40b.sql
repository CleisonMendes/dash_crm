
-- Ensure the users table has all required columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ensure other required columns exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Drop the old password column if it exists (since we're using password_hash now)
ALTER TABLE public.users 
DROP COLUMN IF EXISTS password;
