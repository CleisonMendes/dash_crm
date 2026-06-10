
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Search, Calendar, User, Package, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/financial';

// Mock data
const mockCompletedBillings = [
  {
    id: '1',
    sale_id: '1',
    product: { nome: 'Lençol Premium' },
    client: { nome: 'Maria Silva', telefone: '(11) 99999-9999' },
    vendedor: { nome: 'João Vendedor' },
    tipo_venda: 'retirada' as const,
    preco_venda: 200.00,
    lucro_total: 120.00,
    paid_at: '2024-01-15T10:30:00Z',
    payment_method: 'Dinheiro',
  },
  {
    id: '2',
    sale_id: '2',
    product: { nome: 'Toalha de Banho' },
    client: { nome: 'Carlos Oliveira', telefone: '(11) 77777-7777' },
    vendedor: { nome: 'Maria Vendedora' },
    tipo_venda: 'crediario' as const,
    preco_venda: 240.00,
    lucro_total: 180.00,
    paid_at: '2024-01-14T16:45:00Z',
    payment_method: 'PIX',
    installments_info: '10x de R$ 24,00',
  },
];

export default function CompletedBillingsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBillings = mockCompletedBillings.filter(billing =>
    billing.client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    billing.product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    billing.client.telefone?.includes(searchTerm)
  );

  const getTotalReceived = () => {
    return filteredBillings.reduce((total, billing) => total + billing.preco_venda, 0);
  };

  const getTotalProfit = () => {
    return filteredBillings.reduce((total, billing) => total + billing.lucro_total, 0);
  };

  const getTipoVendaBadge = (tipo: 'retirada' | 'crediario') => {
    return (
      <Badge variant={tipo === 'retirada' ? 'default' : 'secondary'}>
        {tipo === 'retirada' ? 'Retirada' : 'Crediário'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cobranças Finalizadas</h1>
        <p className="text-muted-foreground">Histórico de vendas pagas e quitadas</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(getTotalReceived())}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredBillings.length} vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <CheckCircle className="h-4 w-4 text-gold-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-primary">
              {formatCurrency(getTotalProfit())}
            </div>
            <p className="text-xs text-muted-foreground">
              Lucro realizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredBillings.length > 0 ? getTotalReceived() / filteredBillings.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por venda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Cobranças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por cliente, produto ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Lista de cobranças finalizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Vendas Finalizadas ({filteredBillings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Lucro</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBillings.map((billing) => (
                  <TableRow key={billing.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{billing.client.nome}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {billing.client.telefone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gold-primary" />
                        <span>{billing.product.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{billing.vendedor.nome}</TableCell>
                    <TableCell>
                      {getTipoVendaBadge(billing.tipo_venda)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-success">
                            {formatCurrency(billing.preco_venda)}
                          </span>
                        </div>
                        {billing.installments_info && (
                          <p className="text-xs text-muted-foreground">
                            {billing.installments_info}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gold-primary">
                        {formatCurrency(billing.lucro_total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        {billing.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(billing.paid_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredBillings.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhuma cobrança encontrada.' : 'Nenhuma venda finalizada ainda.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas detalhadas */}
      {filteredBillings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  filteredBillings.reduce((acc, billing) => {
                    acc[billing.payment_method] = (acc[billing.payment_method] || 0) + billing.preco_venda;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([method, total]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{method}</span>
                    <span className="text-sm font-bold text-gold-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por Tipo de Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  filteredBillings.reduce((acc, billing) => {
                    const tipo = billing.tipo_venda === 'retirada' ? 'Retirada' : 'Crediário';
                    acc[tipo] = (acc[tipo] || 0) + billing.preco_venda;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([tipo, total]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tipo}</span>
                    <span className="text-sm font-bold text-gold-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
