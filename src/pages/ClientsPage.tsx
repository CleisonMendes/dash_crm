
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Edit, Phone, MapPin, User, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  cpf_cnpj?: string;
  endereco?: string;
  possui_whatsapp: boolean;
  created_at: string;
}

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    possui_whatsapp: false,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar clientes',
          variant: 'destructive',
        });
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf_cnpj?.includes(searchTerm) ||
    client.telefone?.includes(searchTerm)
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

    if (!formData.telefone.trim()) {
      toast({
        title: 'Erro',
        description: 'Telefone é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      if (editingClient) {
        // Atualizar cliente
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id);

        if (error) {
          console.error('Error updating client:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao atualizar cliente',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Cliente atualizado!',
          description: 'Os dados do cliente foram atualizados com sucesso.',
        });
      } else {
        // Criar novo cliente
        const { error } = await supabase
          .from('clients')
          .insert([formData]);

        if (error) {
          console.error('Error creating client:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao cadastrar cliente',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Cliente cadastrado!',
          description: 'Novo cliente foi adicionado com sucesso.',
        });
      }

      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error submitting client:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao salvar cliente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      cpf_cnpj: '',
      endereco: '',
      possui_whatsapp: false,
    });
    setEditingClient(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setFormData({
      nome: client.nome,
      telefone: client.telefone,
      cpf_cnpj: client.cpf_cnpj || '',
      endereco: client.endereco || '',
      possui_whatsapp: client.possui_whatsapp,
    });
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cadastro de Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes da loja</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold-primary hover:bg-gold-secondary text-burgundy-primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
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
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    telefone: formatPhone(e.target.value) 
                  }))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="possui_whatsapp"
                  checked={formData.possui_whatsapp}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    possui_whatsapp: checked as boolean 
                  }))}
                />
                <Label htmlFor="possui_whatsapp" className="text-sm font-medium">
                  Possui WhatsApp
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cpf_cnpj: formatCpfCnpj(e.target.value) 
                  }))}
                  placeholder="000.000.000-00"
                  maxLength={18}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gold-primary hover:bg-gold-secondary text-burgundy-primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : (editingClient ? 'Atualizar' : 'Cadastrar')}
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
            Buscar Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>
            Clientes Cadastrados ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gold-primary rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-burgundy-primary" />
                          </div>
                          <span className="font-medium">{client.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{client.telefone}</span>
                          </div>
                          {client.possui_whatsapp && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              WhatsApp
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.cpf_cnpj ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {client.cpf_cnpj}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.endereco ? (
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm truncate">{client.endereco}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(client.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredClients.length === 0 && !loading && (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
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
