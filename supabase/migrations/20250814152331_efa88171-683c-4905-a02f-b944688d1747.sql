
-- Criar tabela users se não existir
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Política para permitir inserção (cadastro)
CREATE POLICY "Enable insert for registration" ON public.users
    FOR INSERT WITH CHECK (true);

-- Função para verificar se email existe
CREATE OR REPLACE FUNCTION check_user_exists(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM public.users WHERE email = user_email);
END;
$$;

-- Função para criar usuário
CREATE OR REPLACE FUNCTION create_user(user_email TEXT, user_password_hash TEXT, user_name TEXT)
RETURNS TABLE(user_id UUID, user_email TEXT, user_nome TEXT, created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    new_created_at TIMESTAMP WITH TIME ZONE;
BEGIN
    INSERT INTO public.users (email, password_hash, name)
    VALUES (user_email, user_password_hash, user_name)
    RETURNING id, created_at INTO new_user_id, new_created_at;
    
    RETURN QUERY SELECT new_user_id, user_email, user_name, new_created_at;
END;
$$;

-- Função para autenticar usuário
CREATE OR REPLACE FUNCTION authenticate_user(user_email TEXT)
RETURNS TABLE(user_id UUID, user_email TEXT, user_nome TEXT, password_hash TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT id, email, name, password_hash 
    INTO user_record
    FROM public.users 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    RETURN QUERY SELECT user_record.id, user_record.email, user_record.name, user_record.password_hash;
END;
$$;

-- Inserir usuário de teste se não existir
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM public.users WHERE email = 'teste@teste.com') THEN
        INSERT INTO public.users (name, email, password_hash)
        VALUES ('Usuário Teste', 'teste@teste.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
    END IF;
END $$;
