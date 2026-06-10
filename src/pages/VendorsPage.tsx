
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, UserPlus, Phone, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/financial';

const mockVendors: User[] = [
  {
    id: '2',
    nome: 'João Vendedor',
    email: 'joao@loja.com',
    telefone: '(11) 88888-8888',
    cpf_cnpj: '111.111.111-11',
    role: 'vendedor',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    nome: 'Maria Vendedora',
    email: 'maria@loja.com',
    telefone: '(11) 77777-7777',
    cpf_cnpj: '222.222.222-22',
    role: 'vendedor',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export default function VendorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<User[]>(mockVendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    password: '',
  });

  // Verificar se o usuário é admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const filteredVendors = vendors.filter(vendor =>
    vendor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.cpf_cnpj?.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email) {
      toast({
        title: 'Erro',
        description: 'Nome e email são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (!editingVendor && !formData.password) {
      toast({
        title: 'Erro',
        description: 'Senha é obrigatória para novos vendedores.',
        variant: 'destructive',
      });
      return;
    }

    // Verificar se email já existe
    const emailExists = vendors.some(vendor => 
      vendor.email === formData.email && 
      (!editingVendor || vendor.id !== editingVendor.id)
    );

    if (emailExists) {
      toast({
        title: 'Erro',
        description: 'Este email já está cadastrado.',
        variant: 'destructive',
      });
      return;
    }

    if (editingVendor) {
      // Atualizar vendedor
      setVendors(prev => prev.map(vendor => 
        vendor.id === editingVendor.id 
          ? { 
              ...vendor, 
              nome: formData.nome,
              email: formData.email,
              telefone: formData.telefone,
              cpf_cnpj: formData.cpf_cnpj,
            }
          : vendor
      ));
      toast({
        title: 'Vendedor atualizado!',
        description: 'Os dados do vendedor foram atualizados com sucesso.',
      });
    } else {
      // Criar novo vendedor
      const newVendor: User = {
        id: Date.now().toString(),
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cpf_cnpj: formData.cpf_cnpj,
        role: 'vendedor',
        created_at: new Date().toISOString(),
      };
      setVendors(prev => [newVendor, ...prev]);
      toast({
        title: 'Vendedor cadastrado!',
        description: 'Novo vendedor foi adicionado com sucesso.',
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf_cnpj: '',
      password: '',
    });
    setEditingVendor(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (vendor: User) => {
    setFormData({
      nome: vendor.nome,
      email: vendor.email,
      telefone: vendor.telefone || '',
      cpf_cnpj: vendor.cpf_cnpj || '',
      password: '',
    });
    setEditingVendor(vendor);
    setIsDialogOpen(true);
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cadastro de Vendedores</h1>
          <p className="text-muted-foreground">Gerencie a equipe de vendas</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold-primary hover:bg-gold-secondary text-burgundy-primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Vendedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingVendor ? 'Editar Vendedor' : 'Novo Vendedor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="vendedor@loja.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    telefone: formatPhone(e.target.value) 
                  }))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cpf_cnpj: formatCpfCnpj(e.target.value) 
                  }))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingVendor ? 'Nova Senha (opcional)' : 'Senha *'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  required={!editingVendor}
                  minLength={6}
                />
                {editingVendor && (
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para manter a senha atual
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gold-primary hover:bg-gold-secondary text-burgundy-primary">
                  {editingVendor ? 'Atualizar' : 'Cadastrar'}
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
            Buscar Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Lista de vendedores */}
      <Card>
        <CardHeader>
          <CardTitle>
            Vendedores Cadastrados ({filteredVendors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-primary rounded-full flex items-center justify-center">
                          <span className="text-burgundy-primary font-semibold text-sm">
                            {getUserInitials(vendor.nome)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{vendor.nome}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {vendor.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vendor.telefone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{vendor.telefone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vendor.cpf_cnpj ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {vendor.cpf_cnpj}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(vendor.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(vendor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredVendors.length === 0 && (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum vendedor encontrado.' : 'Nenhum vendedor cadastrado ainda.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
