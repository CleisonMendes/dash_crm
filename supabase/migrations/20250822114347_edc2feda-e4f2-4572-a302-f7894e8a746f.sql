
-- Adicionar campos necessários para suportar importação complexa
ALTER TABLE sales ADD COLUMN IF NOT EXISTS referencia_mensal TEXT;

-- Adicionar campos para controle de parcelas
ALTER TABLE installments ADD COLUMN IF NOT EXISTS numero_parcela INTEGER DEFAULT 1;
ALTER TABLE installments ADD COLUMN IF NOT EXISTS total_parcelas INTEGER DEFAULT 1;

-- Melhorar a função clear_all_data para ser mais robusta
CREATE OR REPLACE FUNCTION clear_all_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all sales-related data
  DELETE FROM installments;
  DELETE FROM partial_payments;
  DELETE FROM sales;
  
  -- Delete all products
  DELETE FROM products;
  
  -- Delete all clients
  DELETE FROM clients;
  
  -- Keep financial_config but reset to default values
  DELETE FROM financial_config;
  INSERT INTO financial_config (retirada_markup, crediario_markup, pct_vendedor, pct_dono, pct_gastos, pct_dizimo)
  VALUES (1.5, 3.0, 0.1, 0.1, 0.3, 0.1);
  
  -- Clear audit logs except the current action
  DELETE FROM audit_logs WHERE action != 'CLEAR_DATA';
  
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but continue
    RAISE NOTICE 'Error during clear_all_data: %', SQLERRM;
    -- Re-raise if it's a critical error
    IF SQLSTATE != '00000' THEN
      RAISE;
    END IF;
END;
$$;

-- Adicionar índices para melhorar performance nas consultas de importação
CREATE INDEX IF NOT EXISTS idx_clients_telefone ON clients(telefone);
CREATE INDEX IF NOT EXISTS idx_products_nome ON products(nome);
CREATE INDEX IF NOT EXISTS idx_sales_referencia_mensal ON sales(referencia_mensal);
CREATE INDEX IF NOT EXISTS idx_installments_sale_parcela ON installments(sale_id, numero_parcela);
