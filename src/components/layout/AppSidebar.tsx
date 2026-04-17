import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, UtensilsCrossed, Bot, Archive, BarChart3, Bike, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import logoVipper from '@/assets/logo-vipper.jpg';

const menuItems = [
  {
    title: 'Pedidos Ativos',
    path: '/',
    icon: ShoppingBag,
    iconColor: 'text-orange-400',
    activeBg: 'bg-orange-500/15',
    activeText: 'text-orange-300',
    activeBorder: 'border-orange-400',
    hoverBg: 'hover:bg-orange-500/10',
  },
  {
    title: 'Cardápio',
    path: '/cardapio',
    icon: UtensilsCrossed,
    iconColor: 'text-green-400',
    activeBg: 'bg-green-500/15',
    activeText: 'text-green-300',
    activeBorder: 'border-green-400',
    hoverBg: 'hover:bg-green-500/10',
  },
  {
    title: 'Delivery',
    path: '/delivery',
    icon: Bike,
    iconColor: 'text-cyan-400',
    activeBg: 'bg-cyan-500/15',
    activeText: 'text-cyan-300',
    activeBorder: 'border-cyan-400',
    hoverBg: 'hover:bg-cyan-500/10',
  },
  {
    title: 'Configurar Agente',
    path: '/agente',
    icon: Bot,
    iconColor: 'text-violet-400',
    activeBg: 'bg-violet-500/15',
    activeText: 'text-violet-300',
    activeBorder: 'border-violet-400',
    hoverBg: 'hover:bg-violet-500/10',
  },
  {
    title: 'Pedidos Anteriores',
    path: '/anteriores',
    icon: Archive,
    iconColor: 'text-amber-400',
    activeBg: 'bg-amber-500/15',
    activeText: 'text-amber-300',
    activeBorder: 'border-amber-400',
    hoverBg: 'hover:bg-amber-500/10',
  },
  {
    title: 'Relatórios',
    path: '/relatorios',
    icon: BarChart3,
    iconColor: 'text-sky-400',
    activeBg: 'bg-sky-500/15',
    activeText: 'text-sky-300',
    activeBorder: 'border-sky-400',
    hoverBg: 'hover:bg-sky-500/10',
  },
];

export function AppSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const pedidos = useStore((s) => s.pedidos);
  const pedidosAtivos = pedidos.filter((p) => p.status !== 'Finalizado').length;

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={onToggle} />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-60 border-r border-sidebar-border bg-sidebar flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <img src={logoVipper} alt="Vipper Food" className="w-9 h-9 rounded-lg object-cover ring-2 ring-violet-500/40" />
          <div>
            <span className="text-base font-bold text-white">Vipper Food</span>
            <p className="text-[10px] text-sidebar-foreground">Painel do Restaurante</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-all relative ${
                  isActive
                    ? `${item.activeBg} ${item.activeText} border-l-[3px] ${item.activeBorder} pl-2.5`
                    : `text-sidebar-foreground ${item.hoverBg} hover:text-white border-l-[3px] border-transparent pl-2.5`
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? item.activeText : item.iconColor}`} />
                <span>{item.title}</span>
                {item.path === '/' && pedidosAtivos > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pedidosAtivos}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-sidebar-border space-y-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 border-l-[3px] border-transparent pl-2.5 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sair</span>
          </button>
          <p className="text-[11px] text-sidebar-foreground text-center">Vipper Dev © 2026</p>
        </div>
      </aside>
    </>
  );
}
