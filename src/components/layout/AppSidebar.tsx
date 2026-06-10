
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
  Receipt,
  CheckCircle,
  ShoppingBag,
  CreditCard,
  Settings,
  Crown,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Cadastro de Cliente',
    url: '/clientes',
    icon: Users,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Cadastro de Vendedores',
    url: '/vendedores',
    icon: UserPlus,
    roles: ['admin'],
  },
  {
    title: 'Cadastro de Produtos',
    url: '/produtos',
    icon: Package,
    roles: ['admin'],
  },
  {
    title: 'Cobrança',
    url: '/cobrancas',
    icon: Receipt,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Cobranças Finalizadas',
    url: '/cobrancas-finalizadas',
    icon: CheckCircle,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Retirada na Loja',
    url: '/retirada-loja',
    icon: ShoppingBag,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Crediário',
    url: '/crediario',
    icon: CreditCard,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Painel Administrativo',
    url: '/painel-admin',
    icon: Settings,
    roles: ['admin'],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const filteredItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const isActive = (url: string) => {
    if (url === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(url);
  };

  return (
    <Sidebar className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-sidebar border-r border-sidebar-border`}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-primary rounded-lg flex items-center justify-center">
            <Crown className="w-5 h-5 text-burgundy-primary" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">FinanceControl</h2>
              <p className="text-xs text-sidebar-foreground/70">Sistema de Gestão</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? 'hidden' : 'block'} text-sidebar-foreground/70 text-xs uppercase tracking-wide mb-2`}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`sidebar-nav-item ${isActive(item.url) ? 'active' : ''}`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
