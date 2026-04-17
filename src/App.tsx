import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import PedidosAtivos from "@/pages/PedidosAtivos";
import Cardapio from "@/pages/Cardapio";
import Delivery from "@/pages/Delivery";
import ConfigurarAgente from "@/pages/ConfigurarAgente";
import PedidosAnteriores from "@/pages/PedidosAnteriores";
import Relatorios from "@/pages/Relatorios";
import Perfil from "@/pages/Perfil";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<PedidosAtivos />} />
                <Route path="/cardapio" element={<Cardapio />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/agente" element={<ConfigurarAgente />} />
                <Route path="/anteriores" element={<PedidosAnteriores />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/perfil" element={<Perfil />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
