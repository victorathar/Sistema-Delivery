import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, MapPin, Phone, Package, ArrowUpDown, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { OrigemBadge } from '@/components/shared/OrderCard';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Pedido, OrigemPedido } from '@/types';

const PLATAFORMAS: OrigemPedido[] = ['WhatsApp', 'iFood', '99Food', 'Keeta'];

export default function PedidosAnteriores() {
  const pedidos       = useStore((s) => s.pedidos);
  const removerPedido = useStore((s) => s.removerPedido);

  const finalizados = pedidos.filter((p) => p.status === 'Finalizado');

  const [search, setSearch]           = useState('');
  const [sortOrder, setSortOrder]     = useState<'newest' | 'oldest'>('newest');
  const [plataformaFiltro, setPlataformaFiltro] = useState<OrigemPedido | ''>('');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [pedidoParaDeletar, setPedidoParaDeletar] = useState<Pedido | null>(null);
  const [deletando, setDeletando]     = useState(false);

  const filtered = useMemo(() => {
    let list = [...finalizados];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.cliente_nome.toLowerCase().includes(q) ||
          p.id.slice(-4).toLowerCase().includes(q) ||
          p.endereco.toLowerCase().includes(q)
      );
    }

    if (plataformaFiltro) {
      list = list.filter((p) => (p.origem ?? 'WhatsApp') === plataformaFiltro);
    }

    list.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? -diff : diff;
    });

    return list;
  }, [finalizados, search, plataformaFiltro, sortOrder]);

  const totalReceita = finalizados.reduce((acc, p) => acc + p.total, 0);

  const handleConfirmarDelete = async () => {
    if (!pedidoParaDeletar) return;
    setDeletando(true);
    try {
      await removerPedido(pedidoParaDeletar.id);
      toast.success(`Pedido #${pedidoParaDeletar.id.slice(-4).toUpperCase()} removido.`);
      setPedidoParaDeletar(null);
      if (expandedId === pedidoParaDeletar.id) setExpandedId(null);
    } catch {
      toast.error('Erro ao excluir pedido.');
    } finally {
      setDeletando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-violet-50 to-purple-100/50 border border-violet-200 rounded-card px-4 py-3 dark:from-violet-900/20 dark:to-purple-900/20 dark:border-violet-700">
          <p className="text-xs text-violet-600 font-semibold dark:text-violet-400">Pedidos finalizados</p>
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{finalizados.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 border border-green-200 rounded-card px-4 py-3 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
          <p className="text-xs text-green-600 font-semibold dark:text-green-400">Receita total</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">R$ {totalReceita.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 border border-amber-200 rounded-card px-4 py-3 col-span-2 sm:col-span-1 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700">
          <p className="text-xs text-amber-600 font-semibold dark:text-amber-400">Ticket médio</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            R$ {finalizados.length > 0 ? (totalReceita / finalizados.length).toFixed(2).replace('.', ',') : '0,00'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Buscar por cliente, ID, endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={plataformaFiltro}
            onChange={(e) => setPlataformaFiltro(e.target.value as OrigemPedido | '')}
            className="pl-9 pr-8 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
          >
            <option value="">Todas plataformas</option>
            {PLATAFORMAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-2 px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors"
        >
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium">{sortOrder === 'newest' ? 'Mais recentes' : 'Mais antigos'}</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhum pedido encontrado</p>
          <p className="text-sm mt-1">
            {search || plataformaFiltro ? 'Tente ajustar os filtros' : 'Os pedidos finalizados aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="bg-background rounded-card border border-border shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">#ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Origem</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Itens</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Data</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <>
                  <tr
                    key={p.id}
                    className={`border-b border-border cursor-pointer transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-900/10 ${
                      expandedId === p.id ? 'bg-violet-50/30 dark:bg-violet-900/10' : idx % 2 === 0 ? '' : 'bg-muted/20'
                    }`}
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary">#{p.id.slice(-4).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{p.cliente_nome}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <OrigemBadge origem={p.origem ?? 'WhatsApp'} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium dark:bg-blue-900/40 dark:text-blue-300">
                        {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-green-600 dark:text-green-400">R$ {p.total.toFixed(2).replace('.', ',')}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPedidoParaDeletar(p)}
                          className="p-1 rounded-input hover:bg-destructive/10 transition-colors"
                          title="Excluir pedido"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive/50 hover:text-destructive" />
                        </button>
                        {expandedId === p.id
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        }
                      </div>
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr key={`${p.id}-detail`}>
                      <td colSpan={7} className="px-4 py-4 bg-violet-50/40 dark:bg-violet-900/10 border-b border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Dados do cliente</p>
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                              <span>{p.endereco}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <Phone className="w-3.5 h-3.5 text-green-500 shrink-0" />
                              <span>{p.cliente_whatsapp}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Itens</p>
                            <ul className="space-y-1">
                              {p.itens.map((item, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                  <span className="text-foreground">{item.quantidade}x {item.nome}</span>
                                  <span className="text-green-600 font-medium dark:text-green-400">
                                    R$ {((item.preco ?? item.preco_unitario) * item.quantidade).toFixed(2).replace('.', ',')}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex gap-4 text-xs text-muted-foreground border-t border-border pt-2 mt-1">
                              <span>Subtotal: R$ {p.subtotal.toFixed(2).replace('.', ',')}</span>
                              <span>Frete: R$ {p.frete.toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <StatusBadge status={p.status} />
                          <OrigemBadge origem={p.origem ?? 'WhatsApp'} />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmacao de delete */}
      {pedidoParaDeletar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPedidoParaDeletar(null)}>
          <div
            className="bg-background rounded-card shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Excluir pedido?</h3>
                <p className="text-sm text-muted-foreground">
                  Pedido #{pedidoParaDeletar.id.slice(-4).toUpperCase()} de {pedidoParaDeletar.cliente_nome}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. O pedido será permanentemente removido.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPedidoParaDeletar(null)}
                disabled={deletando}
                className="flex-1 py-2 rounded-input border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDelete}
                disabled={deletando}
                className="flex-1 py-2 rounded-input bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/85 transition-colors disabled:opacity-50"
              >
                {deletando ? 'Excluindo...' : 'Sim, quero deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
