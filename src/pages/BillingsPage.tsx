
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, Search, DollarSign, Calendar, User, Package, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/financial';

interface Payment {
  installment_id: string;
  amount: number;
  date: string;
}

// Mock data
const mockPendingInstallments = [
  {
    id: '1',
    sale_id: '1',
    valor: 22.00,
    due_date: '2024-01-20',
    paid_amount: 0,
    status: 'pendente',
    sale: {
      product: { nome: 'Lençol Premium' },
      client: { nome: 'João Santos', telefone: '(11) 88888-8888' },
      vendedor: { nome: 'Maria Vendedora' },
    },
    overdue_days: 5,
  },
  {
    id: '2',
    sale_id: '1',
    valor: 22.00,
    due_date: '2024-02-20',
    paid_amount: 0,
    status: 'pendente',
    sale: {
      product: { nome: 'Lençol Premium' },
      client: { nome: 'João Santos', telefone: '(11) 88888-8888' },
      vendedor: { nome: 'Maria Vendedora' },
    },
    overdue_days: 0,
  },
];

export default function BillingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const filteredInstallments = mockPendingInstallments.filter(installment =>
    installment.sale.client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installment.sale.product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installment.sale.client.telefone?.includes(searchTerm)
  );

  const handlePayment = () => {
    if (!selectedInstallment || !paymentAmount) {
      toast({
        title: 'Erro',
        description: 'Informe o valor do pagamento.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedInstallment.valor) {
      toast({
        title: 'Erro',
        description: 'Valor inválido. Deve ser maior que zero e menor ou igual ao valor da parcela.',
        variant: 'destructive',
      });
      return;
    }

    // Aqui você integraria com o backend para registrar o pagamento
    toast({
      title: 'Pagamento registrado!',
      description: `Pagamento de ${formatCurrency(amount)} registrado para ${selectedInstallment.sale.client.nome}`,
    });

    setIsPaymentDialogOpen(false);
    setSelectedInstallment(null);
    setPaymentAmount('');
  };

  const openPaymentDialog = (installment: any) => {
    setSelectedInstallment(installment);
    setPaymentAmount(installment.valor.toString());
    setIsPaymentDialogOpen(true);
  };

  const getStatusBadge = (status: string, overdue_days: number) => {
    if (status === 'pago') {
      return <Badge variant="default" className="bg-success text-success-foreground">Pago</Badge>;
    }
    if (overdue_days > 0) {
      return <Badge variant="destructive">Vencida ({overdue_days}d)</Badge>;
    }
    return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pendente</Badge>;
  };

  const getTotalPending = () => {
    return filteredInstallments.reduce((total, installment) => total + installment.valor, 0);
  };

  const getOverdueTotal = () => {
    return filteredInstallments
      .filter(installment => installment.overdue_days > 0)
      .reduce((total, installment) => total + installment.valor, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cobrança</h1>
          <p className="text-muted-foreground">Gerencie parcelas pendentes e registre pagamentos</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-primary">
              {formatCurrency(getTotalPending())}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredInstallments.length} parcelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(getOverdueTotal())}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredInstallments.filter(i => i.overdue_days > 0).length} parcelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Prazo</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(getTotalPending() - getOverdueTotal())}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredInstallments.filter(i => i.overdue_days === 0).length} parcelas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Cobrança
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

      {/* Lista de parcelas pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Parcelas Pendentes ({filteredInstallments.length})
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
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{installment.sale.client.nome}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {installment.sale.client.telefone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gold-primary" />
                        <span>{installment.sale.product.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{installment.sale.vendedor.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={`text-sm ${installment.overdue_days > 0 ? 'text-destructive font-medium' : ''}`}>
                          {new Date(installment.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {formatCurrency(installment.valor)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(installment.status, installment.overdue_days)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-gold-primary hover:bg-gold-secondary text-burgundy-primary"
                        onClick={() => openPaymentDialog(installment)}
                      >
                        Receber
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredInstallments.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhuma cobrança encontrada.' : 'Nenhuma parcela pendente.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          {selectedInstallment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Detalhes da Parcela</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Cliente:</strong> {selectedInstallment.sale.client.nome}</p>
                  <p><strong>Produto:</strong> {selectedInstallment.sale.product.nome}</p>
                  <p><strong>Vencimento:</strong> {new Date(selectedInstallment.due_date).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Valor:</strong> {formatCurrency(selectedInstallment.valor)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="payment-amount" className="text-sm font-medium">
                  Valor Recebido (R$)
                </label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInstallment.valor}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0,00"
                />
                <p className="text-xs text-muted-foreground">
                  Valor máximo: {formatCurrency(selectedInstallment.valor)}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handlePayment}
                  className="flex-1 bg-gold-primary hover:bg-gold-secondary text-burgundy-primary"
                >
                  Confirmar Pagamento
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
