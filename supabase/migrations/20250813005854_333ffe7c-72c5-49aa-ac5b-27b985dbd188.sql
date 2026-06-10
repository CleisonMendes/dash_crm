
-- Create users table (profiles for Supabase auth)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  cpf_cnpj TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendedor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  sku TEXT UNIQUE,
  preco_custo DECIMAL(10,2) NOT NULL CHECK (preco_custo > 0),
  preco_venda_retirada DECIMAL(10,2) NOT NULL,
  preco_venda_crediario DECIMAL(10,2) NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  categoria TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_config table
CREATE TABLE public.financial_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retirada_markup DECIMAL(5,3) NOT NULL DEFAULT 1.5,
  crediario_markup DECIMAL(5,3) NOT NULL DEFAULT 3.0,
  pct_vendedor DECIMAL(5,3) NOT NULL DEFAULT 0.1,
  pct_dono DECIMAL(5,3) NOT NULL DEFAULT 0.1,
  pct_gastos DECIMAL(5,3) NOT NULL DEFAULT 0.3,
  pct_dizimo DECIMAL(5,3) NOT NULL DEFAULT 0.1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  vendedor_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  tipo_venda TEXT NOT NULL CHECK (tipo_venda IN ('retirada', 'crediario')),
  preco_venda DECIMAL(10,2) NOT NULL,
  preco_custo DECIMAL(10,2) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  lucro_total DECIMAL(10,2) NOT NULL,
  lucro_vendedor DECIMAL(10,2) NOT NULL,
  lucro_dono DECIMAL(10,2) NOT NULL,
  reserva_gastos DECIMAL(10,2) NOT NULL,
  reserva_dizimo DECIMAL(10,2) NOT NULL,
  saldo_livre DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create installments table
CREATE TABLE public.installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  description TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for products (admin only)
CREATE POLICY "Users can view all products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only admins can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for clients
CREATE POLICY "Users can view all clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Users can insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update clients" ON public.clients FOR UPDATE USING (true);

-- RLS Policies for financial_config (admin only)
CREATE POLICY "Users can view financial config" ON public.financial_config FOR SELECT USING (true);
CREATE POLICY "Only admins can manage financial config" ON public.financial_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for sales
CREATE POLICY "Admins can view all sales" ON public.sales FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Vendedores can view their own sales" ON public.sales FOR SELECT USING (
  vendedor_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert sales" ON public.sales FOR INSERT WITH CHECK (
  vendedor_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update sales" ON public.sales FOR UPDATE USING (
  vendedor_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for installments
CREATE POLICY "Users can view installments of their sales" ON public.installments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sales WHERE id = sale_id AND (vendedor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')))
);
CREATE POLICY "Users can manage installments of their sales" ON public.installments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sales WHERE id = sale_id AND (vendedor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')))
);

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default financial configuration
INSERT INTO public.financial_config (retirada_markup, crediario_markup, pct_vendedor, pct_dono, pct_gastos, pct_dizimo)
VALUES (1.5, 3.0, 0.1, 0.1, 0.3, 0.1);

-- Function to calculate sale prices
CREATE OR REPLACE FUNCTION public.calculate_sale_prices(custo DECIMAL)
RETURNS TABLE(preco_retirada DECIMAL, preco_crediario DECIMAL) AS $$
DECLARE
  config RECORD;
BEGIN
  SELECT * INTO config FROM public.financial_config ORDER BY updated_at DESC LIMIT 1;
  
  RETURN QUERY SELECT 
    ROUND(custo * (1 + config.retirada_markup), 2) as preco_retirada,
    ROUND(custo * (1 + config.crediario_markup), 2) as preco_crediario;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate profit distribution
CREATE OR REPLACE FUNCTION public.calculate_profit_distribution(
  preco_venda DECIMAL, 
  preco_custo DECIMAL
)
RETURNS TABLE(
  lucro_total DECIMAL,
  lucro_vendedor DECIMAL,
  lucro_dono DECIMAL,
  reserva_gastos DECIMAL,
  reserva_dizimo DECIMAL,
  saldo_livre DECIMAL
) AS $$
DECLARE
  config RECORD;
  lucro DECIMAL;
BEGIN
  SELECT * INTO config FROM public.financial_config ORDER BY updated_at DESC LIMIT 1;
  
  lucro := preco_venda - preco_custo;
  
  RETURN QUERY SELECT 
    ROUND(lucro, 2) as lucro_total,
    ROUND(lucro * config.pct_vendedor, 2) as lucro_vendedor,
    ROUND(lucro * config.pct_dono, 2) as lucro_dono,
    ROUND(lucro * config.pct_gastos, 2) as reserva_gastos,
    ROUND(lucro * config.pct_dizimo, 2) as reserva_dizimo,
    ROUND(lucro * (1 - config.pct_vendedor - config.pct_dono - config.pct_gastos - config.pct_dizimo), 2) as saldo_livre;
END;
$$ LANGUAGE plpgsql;
