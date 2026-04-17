import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

const PAGE_TITLES: Record<string, string> = {
  '/':           'Pedidos Ativos',
  '/cardapio':   'Cardápio',
  '/delivery':   'Delivery',
  '/agente':     'Configurar Agente',
  '/anteriores': 'Pedidos Anteriores',
  '/relatorios': 'Relatórios',
  '/perfil':     'Meu Perfil',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const pageName = PAGE_TITLES[location.pathname] ?? 'Painel';
    document.title = `🐍 Vipper Food - ${pageName}`;
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        <AppHeader pathname={location.pathname} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 lg:p-6 bg-background overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
