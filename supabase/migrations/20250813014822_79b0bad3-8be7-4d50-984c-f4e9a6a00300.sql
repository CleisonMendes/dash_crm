
-- Verificar se existe tabela users, se não existir, criar
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas o próprio usuário acesse seus dados
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Política para permitir inserção de novos usuários (para cadastro)
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- Função para autenticar usuário
CREATE OR REPLACE FUNCTION public.authenticate_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(user_id UUID, user_nome TEXT, user_role TEXT, user_email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Buscar usuário pelo email
  SELECT id, nome, role, email, password_hash
  INTO user_record
  FROM public.users
  WHERE email = user_email;

  -- Se usuário não encontrado, retornar vazio
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Verificar senha (assumindo que a senha já está hasheada)
  -- Em produção, usar crypt() para verificar hash bcrypt
  IF user_record.password_hash = crypt(user_password, user_record.password_hash) THEN
    -- Retornar dados do usuário se senha correta
    user_id := user_record.id;
    user_nome := user_record.nome;
    user_role := user_record.role;
    user_email := user_record.email;
    RETURN NEXT;
  END IF;

  -- Se senha incorreta, não retorna nada
  RETURN;
END;
$$;

-- Inserir usuários de exemplo com senhas hasheadas
-- Admin: admin@teste.com / senha: 123456
-- Vendedor: vendedor@teste.com / senha: 123456
INSERT INTO public.users (email, password_hash, nome, role) 
VALUES 
  ('admin@teste.com', crypt('123456', gen_salt('bf')), 'Administrador', 'admin'),
  ('vendedor@teste.com', crypt('123456', gen_salt('bf')), 'Vendedor Teste', 'vendedor')
ON CONFLICT (email) DO NOTHING;

-- Função para redefinir senha (para funcionalidade "esqueci minha senha")
CREATE OR REPLACE FUNCTION public.reset_password(user_email TEXT, new_password TEXT, reset_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Verificar se usuário existe
  SELECT EXISTS(SELECT 1 FROM public.users WHERE email = user_email) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN FALSE;
  END IF;

  -- Atualizar senha (em produção, verificar token de reset também)
  UPDATE public.users 
  SET password_hash = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE email = user_email;

  RETURN TRUE;
END;
$$;
