import { FinancialConfig } from '@/types/financial';

// Default financial configuration
export const DEFAULT_CONFIG: Partial<FinancialConfig> = {
  retirada_markup: 1.5, // 150%
  crediario_markup: 3.0, // 300%
  pct_vendedor: 0.1, // 10%
  pct_dono: 0.1, // 10%
  pct_gastos: 0.3, // 30%
  pct_dizimo: 0.1, // 10%
};

/**
 * Calculate sale prices based on cost and markup
 */
export function calculateSalePrices(preco_custo: number, config: Partial<FinancialConfig> = DEFAULT_CONFIG) {
  const preco_venda_retirada = Number((preco_custo * (1 + (config.retirada_markup || 1.5))).toFixed(2));
  const preco_venda_crediario = Number((preco_custo * (1 + (config.crediario_markup || 3.0))).toFixed(2));
  
  return {
    preco_venda_retirada,
    preco_venda_crediario,
  };
}

/**
 * Calculate profit distribution for a sale
 */
export function calculateProfitDistribution(
  preco_venda: number,
  preco_custo: number,
  config: Partial<FinancialConfig> = DEFAULT_CONFIG
) {
  const lucro_total = Number((preco_venda - preco_custo).toFixed(2));
  
  const lucro_vendedor = Number((lucro_total * (config.pct_vendedor || 0.1)).toFixed(2));
  const lucro_dono = Number((lucro_total * (config.pct_dono || 0.1)).toFixed(2));
  const reserva_gastos = Number((lucro_total * (config.pct_gastos || 0.3)).toFixed(2));
  const reserva_dizimo = Number((lucro_total * (config.pct_dizimo || 0.1)).toFixed(2));
  
  const saldo_livre = Number((lucro_total - (lucro_vendedor + lucro_dono + reserva_gastos + reserva_dizimo)).toFixed(2));
  
  return {
    lucro_total,
    lucro_vendedor,
    lucro_dono,
    reserva_gastos,
    reserva_dizimo,
    saldo_livre,
  };
}

/**
 * Format currency to Brazilian Real
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Validate financial calculations
 * Used for testing the exact examples from requirements
 */
export function validateExampleCalculations() {
  const preco_custo = 80.00;
  
  // Test case 1: Retirada
  const { preco_venda_retirada } = calculateSalePrices(preco_custo);
  const retirada_distribution = calculateProfitDistribution(preco_venda_retirada, preco_custo);
  
  console.log('=== TESTE RETIRADA ===');
  console.log(`Custo: ${formatCurrency(preco_custo)}`);
  console.log(`Venda: ${formatCurrency(preco_venda_retirada)} (esperado: R$ 200,00)`);
  console.log(`Lucro Total: ${formatCurrency(retirada_distribution.lucro_total)} (esperado: R$ 120,00)`);
  console.log(`Lucro Vendedor: ${formatCurrency(retirada_distribution.lucro_vendedor)} (esperado: R$ 12,00)`);
  console.log(`Lucro Dono: ${formatCurrency(retirada_distribution.lucro_dono)} (esperado: R$ 12,00)`);
  console.log(`Reserva Gastos: ${formatCurrency(retirada_distribution.reserva_gastos)} (esperado: R$ 36,00)`);
  console.log(`Reserva Dízimo: ${formatCurrency(retirada_distribution.reserva_dizimo)} (esperado: R$ 12,00)`);
  console.log(`Saldo Livre: ${formatCurrency(retirada_distribution.saldo_livre)} (esperado: R$ 48,00)`);
  
  // Test case 2: Crediário
  const { preco_venda_crediario } = calculateSalePrices(preco_custo);
  const crediario_distribution = calculateProfitDistribution(preco_venda_crediario, preco_custo);
  
  console.log('\n=== TESTE CREDIÁRIO ===');
  console.log(`Custo: ${formatCurrency(preco_custo)}`);
  console.log(`Venda: ${formatCurrency(preco_venda_crediario)} (esperado: R$ 320,00)`);
  console.log(`Lucro Total: ${formatCurrency(crediario_distribution.lucro_total)} (esperado: R$ 240,00)`);
  console.log(`Lucro Vendedor: ${formatCurrency(crediario_distribution.lucro_vendedor)} (esperado: R$ 24,00)`);
  console.log(`Lucro Dono: ${formatCurrency(crediario_distribution.lucro_dono)} (esperado: R$ 24,00)`);
  console.log(`Reserva Gastos: ${formatCurrency(crediario_distribution.reserva_gastos)} (esperado: R$ 72,00)`);
  console.log(`Reserva Dízimo: ${formatCurrency(crediario_distribution.reserva_dizimo)} (esperado: R$ 24,00)`);
  console.log(`Saldo Livre: ${formatCurrency(crediario_distribution.saldo_livre)} (esperado: R$ 96,00)`);
  
  return {
    retirada: {
      preco_venda: preco_venda_retirada,
      ...retirada_distribution,
    },
    crediario: {
      preco_venda: preco_venda_crediario,
      ...crediario_distribution,
    },
  };
}
