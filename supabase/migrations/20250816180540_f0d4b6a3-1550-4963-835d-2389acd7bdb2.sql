
-- Adicionar role na tabela users se não existir
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor'));

-- Atualizar clientes para incluir whatsapp
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS possui_whatsapp BOOLEAN DEFAULT false;

-- Tornar telefone obrigatório na tabela clientes
ALTER TABLE public.clients 
ALTER COLUMN telefone SET NOT NULL;

-- Criar tabela de pagamentos parciais se não existir
CREATE TABLE IF NOT EXISTS public.partial_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  valor_pago NUMERIC NOT NULL CHECK (valor_pago > 0),
  data_pagamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para pagamentos parciais
ALTER TABLE public.partial_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pagamentos parciais
CREATE POLICY "Users can view partial payments" 
  ON public.partial_payments 
  FOR SELECT 
  USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert partial payments" 
  ON public.partial_payments 
  FOR INSERT 
  WITH CHECK (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update partial payments" 
  ON public.partial_payments 
  FOR UPDATE 
  USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Atualizar políticas RLS da tabela users para incluir role
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data and admins can view all" 
  ON public.users 
  FOR SELECT 
  USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Criar usuário admin padrão se não existir
INSERT INTO public.users (email, name, password_hash, role, created_at)
SELECT 'admin@admin.com', 'Administrador', '$2a$10$8K1p/a0dL2LkkmxWIDgJjuI1.HLbVKNvD6t8skwRZY7nDTZdf.KjG', 'admin', now()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@admin.com');
