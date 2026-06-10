
-- Create RPC function to check if user exists
CREATE OR REPLACE FUNCTION check_user_exists(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM public.users WHERE email = user_email);
END;
$$;

-- Create RPC function to create a new user
CREATE OR REPLACE FUNCTION create_user(user_email TEXT, user_password TEXT, user_name TEXT)
RETURNS TABLE(user_id UUID, user_email TEXT, user_nome TEXT, created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    new_created_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Insert new user
    INSERT INTO public.users (email, password_hash, name)
    VALUES (user_email, user_password, user_name)
    RETURNING id, created_at INTO new_user_id, new_created_at;
    
    -- Return user data
    RETURN QUERY SELECT new_user_id, user_email, user_name, new_created_at;
END;
$$;

-- Create RPC function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(user_id UUID, user_email TEXT, user_nome TEXT, password_hash TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get user by email
    SELECT id, email, name, password_hash 
    INTO user_record
    FROM public.users 
    WHERE email = user_email;
    
    -- If user not found, return empty result
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Return user data (password comparison will be done in the application)
    RETURN QUERY SELECT user_record.id, user_record.email, user_record.name, user_record.password_hash;
END;
$$;
