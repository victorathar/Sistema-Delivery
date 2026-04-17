import { Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useStore } from '@/store/useStore';

const pageTitles: Record<string, string> = {
  '/': 'Pedidos Ativos',
  '/cardapio': 'Cardápio',
  '/entrega': 'Entrega',
  '/agente': 'Configurar Agente',
  '/anteriores': 'Pedidos Anteriores',
  '/relatorios': 'Relatórios',
};

export function AppHeader({ pathname, onMenuToggle }: { pathname: string; onMenuToggle: () => void }) {
  const restauranteNome = useStore((s) => s.restauranteNome);
  const avatarUrl = useStore((s) => s.avatarUrl);
  const { theme, setTheme } = useTheme();
  const initials = restauranteNome
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-input hover:bg-secondary">
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{pageTitles[pathname] || 'Vipper Food'}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-input border border-border hover:bg-secondary transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <span className="text-sm text-muted-foreground hidden sm:block">{restauranteNome}</span>
        <Link
          to="/perfil"
          title="Meu perfil"
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold hover:opacity-85 transition-opacity ring-2 ring-transparent hover:ring-primary/40 overflow-hidden shrink-0"
        >
          {avatarUrl
            ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            : initials}
        </Link>
      </div>
    </header>
  );
}
