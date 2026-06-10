
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingBag, Package, User, DollarSign, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/financial';

interface SaleForm {
  product_id: string;
  client_id: string;
  quantidade: number;
  observacoes?: string;
}

// Mock data
const mockProducts = [
  { id: '1', nome: 'Lençol Premium', preco_venda_retirada: 200.00, preco_custo: 80.00, estoque: 15 },
  { id: '2', nome: 'Toalha de Banho', preco_venda_retirada: 150.00, preco_custo: 60.00, estoque: 8 },
];

const mockClients = [
  { id: '1', nome: 'Maria Silva' },
  { id: '2', nome: 'João Santos' },
];

const mockSales = [
  {
    id: '1',
    product: { nome: 'Lençol Premium' },
    client: { nome: 'Maria Silva' },
    vendedor: { nome: 'João Vendedor' },
    quantidade: 1,
    preco_venda: 200.00,
    lucro_total: 120.00,
    status: 'pago',
    created_at: '2024-01-15T10:30:00Z',
  },
];

export default function StorePickupPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SaleForm>({
    product_id: '',
    client_id: '',
    quantidade: 1,
    observacoes: '',
  });

  const selectedProduct = mockProducts.find(p => p.id === formData.product_id);
  const selectedClient = mockClients.find(c => c.id === formData.client_id);

  const calculateSaleValues = () => {
    if (!selectedProduct) return null;

    const preco_venda = selectedProduct.preco_venda_retirada * formData.quantidade;
    const preco_custo = selectedProduct.preco_custo * formData.quantidade;
    const lucro_total = preco_venda - preco_custo;
    
    // Distribuição dos lucros (conforme regras)
    const lucro_vendedor = lucro_total * 0.1; // 10%
    const lucro_dono = lucro_total * 0.1; // 10%
    const reserva_gastos = lucro_total * 0.3; // 30%
    const reserva_dizimo = lucro_total * 0.1; // 10%
    const saldo_livre = lucro_total * 0.4; // 40%

    return {
      preco_venda,
      preco_custo,
      lucro_total,
      lucro_vendedor,
      lucro_dono,
      reserva_gastos,
      reserva_dizimo,
      saldo_livre,
    };
  };

  const saleValues = calculateSaleValues();

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

    // Aqui você integraria com o backend para salvar a venda
    toast({
      title: 'Venda registrada com sucesso!',
      description: `Venda de ${formData.quantidade}x ${selectedProduct.nome} para ${selectedClient?.nome}`,
    });

    // Reset form
    setFormData({
      product_id: '',
      client_id: '',
      quantidade: 1,
      observacoes: '',
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Retirada na Loja</h1>
          <p className="text-muted-foreground">Registrar vendas com retirada imediata</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold-primary hover:bg-gold-secondary text-burgundy-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Venda - Retirada na Loja</DialogTitle>
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
                            {formatCurrency(product.preco_venda_retirada)} | Est: {product.estoque}
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
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">
                    Estoque disponível: {selectedProduct.estoque} unidades
                  </p>
                )}
              </div>

              {/* Resumo da venda */}
              {saleValues && selectedProduct && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Resumo da Venda
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor Total:</span>
                      <p className="font-semibold text-lg text-green-600">
                        {formatCurrency(saleValues.preco_venda)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lucro Total:</span>
                      <p className="font-semibold text-gold-primary">
                        {formatCurrency(saleValues.lucro_total)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <h5 className="font-medium text-sm">Distribuição do Lucro:</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Vendedor (10%):</span>
                        <span className="font-medium">{formatCurrency(saleValues.lucro_vendedor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dono (10%):</span>
                        <span className="font-medium">{formatCurrency(saleValues.lucro_dono)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gastos (30%):</span>
                        <span className="font-medium">{formatCurrency(saleValues.reserva_gastos)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dízimo (10%):</span>
                        <span className="font-medium">{formatCurrency(saleValues.reserva_dizimo)}</span>
                      </div>
                      <div className="flex justify-between col-span-2 pt-1 border-t">
                        <span>Saldo Livre (40%):</span>
                        <span className="font-semibold text-gold-primary">
                          {formatCurrency(saleValues.saldo_livre)}
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

      {/* Vendas do dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Vendas de Hoje
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
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Lucro</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSales.map((sale) => (
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
                    <TableCell>{sale.quantidade}x</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(sale.preco_venda)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gold-primary">
                        {formatCurrency(sale.lucro_total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        Pago
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {mockSales.length === 0 && (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma venda registrada hoje.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
