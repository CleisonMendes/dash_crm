
export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf_cnpj?: string;
  role: 'admin' | 'vendedor' | 'gerente_vendas' | 'financeiro';
  created_at: string;
}

export interface Product {
  id: string;
  nome: string;
  sku?: string;
  preco_custo: number;
  preco_venda_retirada: number;
  preco_venda_crediario: number;
  estoque: number;
  categoria?: string;
  descricao?: string;
  alert_minimum: number;
  vendas_count: number;
  created_at: string;
}

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  cpf_cnpj?: string;
  endereco?: string;
  possui_whatsapp: boolean;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  vendedor_id: string;
  client_id: string;
  tipo_venda: 'retirada' | 'crediario';
  preco_venda: number;
  preco_custo: number;
  quantidade: number;
  lucro_total: number;
  lucro_vendedor: number;
  lucro_dono: number;
  reserva_gastos: number;
  reserva_dizimo: number;
  saldo_livre: number;
  status: 'pendente' | 'pago' | 'parcial';
  referencia_mensal?: string;
  created_at: string;
  product?: Product;
  vendedor?: User;
  client?: Client;
}

export interface Installment {
  id: string;
  sale_id: string;
  valor: number;
  due_date: string;
  paid_amount: number;
  paid_at?: string;
  status: 'pendente' | 'pago' | 'parcial';
  numero_parcela?: number;
  total_parcelas?: number;
  created_at: string;
}

export interface PartialPayment {
  id: string;
  client_id: string;
  sale_id?: string;
  valor_pago: number;
  data_pagamento: string;
  observacoes?: string;
  created_by: string;
  created_at: string;
}

export interface FinancialConfig {
  id: string;
  retirada_markup: number;
  crediario_markup: number;
  pct_vendedor: number;
  pct_dono: number;
  pct_gastos: number;
  pct_dizimo: number;
  updated_at: string;
  updated_by?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

export interface DashboardMetrics {
  receita_total: number;
  valor_aberto: number;
  lucro_total: number;
  lucro_vendedor: number;
  lucro_dono: number;
  reserva_gastos: number;
  reserva_dizimo: number;
  saldo_livre: number;
  vendedores_ativos: number;
  vendas_periodo: number;
}

// Novas interfaces para as funcionalidades
export interface Notification {
  id: string;
  user_id: string;
  type: 'low_stock' | 'overdue_payment' | 'general';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_id?: string;
}

export interface VendorRanking {
  vendedor_id: string;
  vendedor_nome: string;
  total_vendas: number;
  posicao: number;
  medal?: '🥇' | '🥈' | '🥉';
}

export interface ExportData {
  sales: Sale[];
  clients: Client[];
  products: Product[];
  installments: Installment[];
}

export interface FutureProjection {
  mes: string;
  parcelas_pendentes: number;
  estoque_potencial: number;
  projecao_total: number;
}

// Novas interfaces para importação Excel
export interface ImportStats {
  totalProcessed: number;
  clientsCreated: number;
  clientsUpdated: number;
  productsCreated: number;
  productsUpdated: number;
  salesCreated: number;
  installmentsCreated: number;
  errors: string[];
  warnings: string[];
}

export interface MonthlyData {
  month: string;
  sales: Sale[];
  clients: Client[];
  products: Product[];
  installments: Installment[];
}
