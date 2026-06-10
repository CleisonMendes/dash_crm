
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthPage } from "@/components/auth/AuthPage";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/ClientsPage";
import VendorsPage from "./pages/VendorsPage";
import ProductsPage from "./pages/ProductsPage";
import BillingsPage from "./pages/BillingsPage";
import CompletedBillingsPage from "./pages/CompletedBillingsPage";
import StorePickupPage from "./pages/StorePickupPage";
import InstallmentPage from "./pages/InstallmentPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/vendedores" element={<VendorsPage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/cobrancas" element={<BillingsPage />} />
              <Route path="/cobrancas-finalizadas" element={<CompletedBillingsPage />} />
              <Route path="/retirada-loja" element={<StorePickupPage />} />
              <Route path="/crediario" element={<InstallmentPage />} />
              <Route path="/painel-admin" element={<AdminPanelPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="finance-control-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
