
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, Package, User, DollarSign, Calculator, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/financial';

interface InstallmentSaleForm {
  product_id: string;
  client_id: string;
  quantidade: number;
  entrada: number;
  num_parcelas: number;
}

// Mock data
const mockProducts = [
  { id: '1', nome: 'Lençol Premium', preco_venda_crediario: 320.00, preco_custo: 80.00, estoque: 15 },
  { id: '2', nome: 'Toalha de Banho', preco_venda_crediario: 240.00, preco_custo: 60.00, estoque: 8 },
];

const mockClients = [
  { id: '1', nome: 'Maria Silva' },
  { id: '2', nome: 'João Santos' },
];

const mockInstallmentSales = [
  {
    id: '1',
    product: { nome: 'Lençol Premium' },
    client: { nome: 'João Santos' },
    vendedor: { nome: 'Maria Vendedora' },
    quantidade: 1,
    preco_venda: 320.00,
    entrada: 100.00,
    valor_financiado: 220.00,
    num_parcelas: 10,
    valor_parcela: 22.00,
    parcelas_pagas: 3,
    status: 'parcial',
    created_at: '2024-01-14T14:15:00Z',
  },
];

export default function InstallmentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InstallmentSaleForm>({
    product_id: '',
    client_id: '',
    quantidade: 1,
    entrada: 0,
    num_parcelas: 10,
  });

  const selectedProduct = mockProducts.find(p => p.id === formData.product_id);
  const selectedClient = mockClients.find(c => c.id === formData.client_id);

  const calculateInstallmentValues = () => {
    if (!selectedProduct) return null;

    const preco_total = selectedProduct.preco_venda_crediario * formData.quantidade;
    const valor_financiado = preco_total - formData.entrada;
    const valor_parcela = valor_financiado / formData.num_parcelas;
    
    const preco_custo = selectedProduct.preco_custo * formData.quantidade;
    const lucro_total = preco_total - preco_custo;
    
    // Distribuição dos lucros (conforme regras)
    const lucro_vendedor = lucro_total * 0.1; // 10%
    const lucro_dono = lucro_total * 0.1; // 10%
    const reserva_gastos = lucro_total * 0.3; // 30%
    const reserva_dizimo = lucro_total * 0.1; // 10%
    const saldo_livre = lucro_total * 0.4; // 40%

    return {
      preco_total,
      valor_financiado,
      valor_parcela,
      preco_custo,
      lucro_total,
      lucro_vendedor,
      lucro_dono,
      reserva_gastos,
      reserva_dizimo,
      saldo_livre,
    };
  };

  const installmentValues = calculateInstallmentValues();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id || !formData.client_id) {
      toast({
        title: 'Erro',
        description: 'Selecione um produto e um cliente.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedProduct) {
      toast({
        title: 'Erro',
        description: 'Produto selecionado inválido.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.quantidade > selectedProduct.estoque) {
      toast({
        title: 'Erro',
        description: 'Quantidade solicitada maior que o estoque disponível.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.num_parcelas < 1 || formData.num_parcelas > 24) {
      toast({
        title: 'Erro',
        description: 'Número de parcelas deve ser entre 1 e 24.',
        variant: 'destructive',
      });
      return;
    }

    // Aqui você integraria com o backend para salvar a venda
    toast({
      title: 'Venda a crediário registrada!',
      description: `${formData.quantidade}x ${selectedProduct.nome} para ${selectedClient?.nome} em ${formData.num_parcelas}x`,
    });

    // Reset form
    setFormData({
      product_id: '',
      client_id: '',
      quantidade: 1,
      entrada: 0,
      num_parcelas: 10,
    });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string, parcelas_pagas: number, num_parcelas: number) => {
    if (status === 'pago' || parcelas_pagas >= num_parcelas) {
      return <Badge variant="default" className="bg-success text-success-foreground">Quitado</Badge>;
    }
    if (parcelas_pagas > 0) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Parcial</Badge>;
    }
    return <Badge variant="destructive">Pendente</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crediário</h1>
          <p className="text-muted-foreground">Vendas parceladas e controle de pagamentos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold-primary hover:bg-gold-secondary text-burgundy-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Venda - Crediário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produto *</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{product.nome}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatCurrency(product.preco_venda_crediario)} | Est: {product.estoque}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    max={selectedProduct?.estoque || 1}
                    value={formData.quantidade}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      quantidade: parseInt(e.target.value) || 1 
                    }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num_parcelas">Parcelas *</Label>
                  <Select
                    value={formData.num_parcelas.toString()}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      num_parcelas: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entrada">Entrada (R$)</Label>
                <Input
                  id="entrada"
                  type="number"
                  step="0.01"
                  min="0"
                  max={installmentValues?.preco_total || 0}
                  value={formData.entrada}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    entrada: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              {/* Resumo da venda */}
              {installmentValues && selectedProduct && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Resumo da Venda
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor Total:</span>
                      <p className="font-semibold text-lg text-green-600">
                        {formatCurrency(installmentValues.preco_total)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Entrada:</span>
                      <p className="font-semibold">
                        {formatCurrency(formData.entrada)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">A Financiar:</span>
                      <p className="font-semibold text-warning">
                        {formatCurrency(installmentValues.valor_financiado)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Parcela:</span>
                      <p className="font-semibold text-gold-primary">
                        {formatCurrency(installmentValues.valor_parcela)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <h5 className="font-medium text-sm">Distribuição do Lucro Total:</h5>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Lucro Total: </span>
                      <span className="font-semibold text-gold-primary">
                        {formatCurrency(installmentValues.lucro_total)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Vendedor (10%):</span>
                        <span className="font-medium">{formatCurrency(installmentValues.lucro_vendedor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dono (10%):</span>
                        <span className="font-medium">{formatCurrency(installmentValues.lucro_dono)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gastos (30%):</span>
                        <span className="font-medium">{formatCurrency(installmentValues.reserva_gastos)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dízimo (10%):</span>
                        <span className="font-medium">{formatCurrency(installmentValues.reserva_dizimo)}</span>
                      </div>
                      <div className="flex justify-between col-span-2 pt-1 border-t">
                        <span>Saldo Livre (40%):</span>
                        <span className="font-semibold text-gold-primary">
                          {formatCurrency(installmentValues.saldo_livre)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gold-primary hover:bg-gold-secondary text-burgundy-primary">
                  Registrar Venda
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendas em crediário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Vendas em Crediário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInstallmentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gold-primary" />
                        <span className="font-medium">{sale.product.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{sale.client.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{sale.vendedor.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(sale.preco_venda)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(sale.entrada)}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium">{sale.num_parcelas}x</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(sale.valor_parcela)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {sale.parcelas_pagas}/{sale.num_parcelas}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gold-primary h-2 rounded-full transition-all" 
                            style={{ 
                              width: `${(sale.parcelas_pagas / sale.num_parcelas) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sale.status, sale.parcelas_pagas, sale.num_parcelas)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {mockInstallmentSales.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma venda em crediário registrada.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
