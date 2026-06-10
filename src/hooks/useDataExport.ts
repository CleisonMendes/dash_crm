
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sale, Product, Client, Installment } from '@/types/financial';

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
  clientId?: string;
  productId?: string;
}

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const fetchExportData = async (filters: ExportFilters = {}) => {
    if (!user) return null;

    try {
      // Base query para vendas
      let salesQuery = supabase
        .from('sales')
        .select('*');

      // Aplicar filtros baseados no papel do usuário
      if (user.role === 'vendedor') {
        salesQuery = salesQuery.eq('vendedor_id', user.id);
      } else if (filters.vendorId) {
        salesQuery = salesQuery.eq('vendedor_id', filters.vendorId);
      }

      if (filters.clientId) {
        salesQuery = salesQuery.eq('client_id', filters.clientId);
      }

      if (filters.productId) {
        salesQuery = salesQuery.eq('product_id', filters.productId);
      }

      if (filters.startDate) {
        salesQuery = salesQuery.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        salesQuery = salesQuery.lte('created_at', filters.endDate);
      }

      const { data: sales, error: salesError } = await salesQuery;

      if (salesError) {
        console.error('Erro ao buscar vendas:', salesError);
        return null;
      }

      // Buscar outros dados apenas se necessário
      const { data: products } = await supabase.from('products').select('*');
      const { data: clients } = await supabase.from('clients').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');
      
      let installmentsQuery = supabase.from('installments').select('*');
      if (sales && sales.length > 0) {
        const saleIds = sales.map(s => s.id);
        installmentsQuery = installmentsQuery.in('sale_id', saleIds);
      }
      
      const { data: installments } = await installmentsQuery;

      // Enriquecer vendas com dados relacionados
      const enrichedSales = sales?.map(sale => ({
        ...sale,
        product: products?.find(p => p.id === sale.product_id),
        client: clients?.find(c => c.id === sale.client_id),
        vendedor: profiles?.find(p => p.id === sale.vendedor_id)
      })) || [];

      return {
        sales: enrichedSales,
        products: products || [],
        clients: clients || [],
        installments: installments || []
      };
    } catch (error) {
      console.error('Erro ao buscar dados para exportação:', error);
      return null;
    }
  };

  const exportToCSV = async (filters: ExportFilters = {}) => {
    setIsExporting(true);
    try {
      const data = await fetchExportData(filters);
      if (!data) return;

      // Converter vendas para CSV
      const csvContent = [
        // Cabeçalho
        [
          'Data',
          'Produto',
          'Cliente',
          'Vendedor',
          'Tipo Venda',
          'Quantidade',
          'Preço Venda',
          'Preço Custo',
          'Lucro Total',
          'Status'
        ].join(','),
        // Dados
        ...data.sales.map(sale => [
          new Date(sale.created_at).toLocaleDateString('pt-BR'),
          `"${sale.product?.nome || ''}"`,
          `"${sale.client?.nome || ''}"`,
          `"${sale.vendedor?.nome || ''}"`,
          sale.tipo_venda,
          sale.quantidade,
          sale.preco_venda,
          sale.preco_custo,
          sale.lucro_total,
          sale.status
        ].join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vendas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async (filters: ExportFilters = {}) => {
    setIsExporting(true);
    try {
      const data = await fetchExportData(filters);
      if (!data) return;

      // Criar conteúdo Excel simples (TSV)
      const excelContent = [
        // Cabeçalho
        [
          'Data',
          'Produto',
          'Cliente', 
          'Vendedor',
          'Tipo Venda',
          'Quantidade',
          'Preço Venda',
          'Preço Custo',
          'Lucro Total',
          'Status'
        ].join('\t'),
        // Dados
        ...data.sales.map(sale => [
          new Date(sale.created_at).toLocaleDateString('pt-BR'),
          sale.product?.nome || '',
          sale.client?.nome || '',
          sale.vendedor?.nome || '',
          sale.tipo_venda,
          sale.quantidade,
          sale.preco_venda,
          sale.preco_custo,
          sale.lucro_total,
          sale.status
        ].join('\t'))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vendas_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportToCSV,
    exportToExcel,
    fetchExportData
  };
};
