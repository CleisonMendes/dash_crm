
-- Criar tabela para notificações
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'overdue_payment', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  related_id UUID -- ID relacionado (produto, venda, etc)
);

-- Adicionar RLS para notificações
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Atualizar tabela de produtos para controle de estoque
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS alert_minimum INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS vendas_count INTEGER DEFAULT 0;

-- Atualizar tabela de usuários para novos perfis
ALTER TABLE public.users 
ALTER COLUMN role TYPE TEXT,
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'vendedor', 'gerente_vendas', 'financeiro'));

-- Atualizar tabela de profiles também
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE TEXT,
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'vendedor', 'gerente_vendas', 'financeiro'));

-- Criar função para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Reduzir estoque do produto
  UPDATE public.products 
  SET estoque = estoque - NEW.quantidade,
      vendas_count = vendas_count + NEW.quantidade
  WHERE id = NEW.product_id;
  
  -- Verificar se estoque ficou baixo e criar notificação para admins
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  SELECT 
    p.id,
    'low_stock',
    'Estoque Baixo',
    'O produto ' || prod.nome || ' está com apenas ' || prod.estoque || ' unidades em estoque.',
    prod.id
  FROM public.profiles p
  CROSS JOIN public.products prod
  WHERE p.role = 'admin' 
    AND prod.id = NEW.product_id 
    AND prod.estoque <= prod.alert_minimum;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar estoque
DROP TRIGGER IF EXISTS trigger_update_stock ON public.sales;
CREATE TRIGGER trigger_update_stock
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- Criar função para notificar sobre pagamentos em atraso
CREATE OR REPLACE FUNCTION check_overdue_payments()
RETURNS void AS $$
BEGIN
  -- Inserir notificações para vendedores sobre parcelas em atraso
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  SELECT DISTINCT
    s.vendedor_id,
    'overdue_payment',
    'Pagamento em Atraso',
    'O cliente ' || c.nome || ' possui parcelas em atraso.',
    i.sale_id
  FROM public.installments i
  JOIN public.sales s ON s.id = i.sale_id
  JOIN public.clients c ON c.id = s.client_id
  WHERE i.status = 'pendente' 
    AND i.due_date < CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = s.vendedor_id 
        AND n.type = 'overdue_payment' 
        AND n.related_id = i.sale_id 
        AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_products_estoque ON public.products(estoque);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON public.installments(due_date);
