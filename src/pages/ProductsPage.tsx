
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  nome: string;
  sku?: string;
  categoria?: string;
  descricao?: string;
  preco_custo: number;
  preco_venda_retirada: number;
  preco_venda_crediario: number;
  estoque: number;
  created_at: string;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    sku: '',
    categoria: '',
    descricao: '',
    preco_custo: '',
    preco_venda_retirada: '',
    preco_venda_crediario: '',
    estoque: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar produtos',
          variant: 'destructive',
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.preco_custo) {
      toast({
        title: 'Erro',
        description: 'Preço de custo é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const productData = {
        nome: formData.nome,
        sku: formData.sku || null,
        categoria: formData.categoria || null,
        descricao: formData.descricao || null,
        preco_custo: parseFloat(formData.preco_custo),
        preco_venda_retirada: parseFloat(formData.preco_venda_retirada) || 0,
        preco_venda_crediario: parseFloat(formData.preco_venda_crediario) || 0,
        estoque: parseInt(formData.estoque) || 0,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          console.error('Error updating product:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao atualizar produto',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Produto atualizado!',
          description: 'Os dados do produto foram atualizados com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          console.error('Error creating product:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao cadastrar produto',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Produto cadastrado!',
          description: 'Novo produto foi adicionado com sucesso.',
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao salvar produto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      sku: '',
      categoria: '',
      descricao: '',
      preco_custo: '',
      preco_venda_retirada: '',
      preco_venda_crediario: '',
      estoque: '',
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      nome: product.nome,
      sku: product.sku || '',
      categoria: product.categoria || '',
      descricao: product.descricao || '',
      preco_custo: product.preco_custo.toString(),
      preco_venda_retirada: product.preco_venda_retirada.toString(),
      preco_venda_crediario: product.preco_venda_crediario.toString(),
      estoque: product.estoque.toString(),
    });
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cadastro de Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold-primary hover:bg-gold-secondary text-burgundy-primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do produto"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Código do produto"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  placeholder="Categoria do produto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do produto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_custo">Preço de Custo *</Label>
                  <Input
                    id="preco_custo"
                    type="number"
                    step="0.01"
                    value={formData.preco_custo}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco_custo: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoque">Estoque</Label>
                  <Input
                    id="estoque"
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => setFormData(prev => ({ ...prev, estoque: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_venda_retirada">Preço Retirada</Label>
                  <Input
                    id="preco_venda_retirada"
                    type="number"
                    step="0.01"
                    value={formData.preco_venda_retirada}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco_venda_retirada: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_venda_crediario">Preço Crediário</Label>
                  <Input
                    id="preco_venda_crediario"
                    type="number"
                    step="0.01"
                    value={formData.preco_venda_crediario}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco_venda_crediario: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gold-primary hover:bg-gold-secondary text-burgundy-primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Cadastrar')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, SKU ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Lista de produtos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Produtos Cadastrados ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Preços</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gold-primary rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-burgundy-primary" />
                          </div>
                          <div>
                            <span className="font-medium">{product.nome}</span>
                            {product.descricao && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {product.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.sku ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {product.sku}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.categoria ? (
                          <Badge variant="secondary">
                            {product.categoria}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          R$ {product.preco_custo.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div>Retirada: R$ {product.preco_venda_retirada.toFixed(2)}</div>
                          <div>Crediário: R$ {product.preco_venda_crediario.toFixed(2)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{product.estoque}</span>
                          {product.estoque <= 5 && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
