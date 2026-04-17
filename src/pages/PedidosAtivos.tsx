import { useState, useMemo } from 'react';
import { X, MapPin, Phone, Clock, Package, Receipt, Search, ArrowUpDown, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { OrderCard, OrigemBadge } from '@/components/shared/OrderCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import type { Pedido, PedidoStatus, OrigemPedido } from '@/types';

const PLATAFORMAS: OrigemPedido[] = ['WhatsApp', 'iFood', '99Food', 'Keeta'];

export default function PedidosAtivos() {
  const pedidos         = useStore((s) => s.pedidos);
  const atualizarStatus = useStore((s) => s.atualizarStatusPedido);
  const removerPedido   = useStore((s) => s.removerPedido);

  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [pedidoParaDeletar, setPedidoParaDeletar] = useState<Pedido | null>(null);
  const [deletando, setDeletando] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filtros
  const [search, setSearch]           = useState('');
  const [sortOrder, setSortOrder]     = useState<'newest' | 'oldest'>('newest');
  const [plataformaFiltro, setPlataformaFiltro] = useState<OrigemPedido | ''>('');

  const ativos = useMemo(() => {
    let list = pedidos.filter((p) => p.status !== 'Finalizado');

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

    list = [...list].sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? -diff : diff;
    });

    return list;
  }, [pedidos, search, plataformaFiltro, sortOrder]);

  const handleStatusChange = async (id: string, novoStatus: PedidoStatus) => {
    setUpdatingId(id);
    try {
      await atualizarStatus(id, novoStatus);
      toast.success('Status atualizado! Notificação enviada ao cliente.');
      if (selectedPedido?.id === id) {
        setSelectedPedido({ ...selectedPedido, status: novoStatus });
      }
    } catch {
      toast.error('Erro ao atualizar status do pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmarDelete = async () => {
    if (!pedidoParaDeletar) return;
    setDeletando(true);
    try {
      await removerPedido(pedidoParaDeletar.id);
      toast.success(`Pedido #${pedidoParaDeletar.id.slice(-4).toUpperCase()} removido.`);
      setPedidoParaDeletar(null);
      if (selectedPedido?.id === pedidoParaDeletar.id) setSelectedPedido(null);
    } catch {
      toast.error('Erro ao excluir pedido.');
    } finally {
      setDeletando(false);
    }
  };

  const totalAtivos = pedidos.filter((p) => p.status !== 'Finalizado').length;

  return (
    <div className="space-y-5">
      {/* Barra de status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {(['Pendente', 'Em Preparação', 'Em Processo de Entrega'] as const).map((status) => {
            const count = pedidos.filter((p) => p.status === status).length;
            const styles = {
              'Pendente': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
              'Em Preparação': 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
              'Em Processo de Entrega': 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300',
            };
            return (
              <span key={status} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[status]}`}>
                {count} {status}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-live" />
          <span>Ao vivo · {totalAtivos} ativos</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente, ID, endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Filtro de plataforma */}
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

        {/* Ordenacao */}
        <button
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-2 px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors"
          title={sortOrder === 'newest' ? 'Mostrando mais recentes primeiro' : 'Mostrando mais antigos primeiro'}
        >
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium">{sortOrder === 'newest' ? 'Mais recentes' : 'Mais antigos'}</span>
        </button>
      </div>

      {ativos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhum pedido ativo encontrado</p>
          <p className="text-sm mt-1">
            {search || plataformaFiltro ? 'Tente ajustar os filtros' : 'Novos pedidos aparecerão aqui automaticamente'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ativos.map((pedido) => (
            <OrderCard
              key={pedido.id}
              pedido={pedido}
              onStatusChange={handleStatusChange}
              onVerDetalhes={setSelectedPedido}
              onDelete={setPedidoParaDeletar}
              isUpdating={updatingId === pedido.id}
            />
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      {selectedPedido && (
        <DetalhesPedidoModal
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
          onStatusChange={handleStatusChange}
          onDelete={(p) => { setSelectedPedido(null); setPedidoParaDeletar(p); }}
        />
      )}

      {/* Modal de confirmacao de delete */}
      {pedidoParaDeletar && (
        <ConfirmarDeleteModal
          pedido={pedidoParaDeletar}
          loading={deletando}
          onConfirm={handleConfirmarDelete}
          onCancel={() => setPedidoParaDeletar(null)}
        />
      )}
    </div>
  );
}

// ─── Modal de confirmacao de exclusao ────────────────────────────
function ConfirmarDeleteModal({
  pedido,
  loading,
  onConfirm,
  onCancel,
}: {
  pedido: Pedido;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
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
              Pedido #{pedido.id.slice(-4).toUpperCase()} de {pedido.cliente_nome}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Esta ação não pode ser desfeita. O pedido será permanentemente removido.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-input border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-input bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/85 transition-colors disabled:opacity-50"
          >
            {loading ? 'Excluindo...' : 'Sim, quero deletar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de detalhes do pedido ─────────────────────────────────
function DetalhesPedidoModal({
  pedido,
  onClose,
  onStatusChange,
  onDelete,
}: {
  pedido: Pedido;
  onClose: () => void;
  onStatusChange: (id: string, status: PedidoStatus) => void;
  onDelete: (p: Pedido) => void;
}) {
  const shortId = pedido.id.slice(-4).toUpperCase();

  const nextStatusMap: Partial<Record<PedidoStatus, { label: string; next: PedidoStatus; color: string }>> = {
    Pendente: { label: 'Iniciar Preparo', next: 'Em Preparação', color: 'bg-info hover:bg-info/90 text-info-foreground' },
    'Em Preparação': { label: 'Enviar para Entrega', next: 'Em Processo de Entrega', color: 'bg-warm hover:bg-warm/90 text-warm-foreground' },
    'Em Processo de Entrega': { label: 'Marcar como Entregue', next: 'Finalizado', color: 'bg-teal hover:bg-teal/90 text-teal-foreground' },
  };

  const action = nextStatusMap[pedido.status];
  const createdAt = new Date(pedido.created_at);
  const timeStr = createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = createdAt.toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-background rounded-card shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-bold text-foreground">Pedido #{shortId}</span>
            <StatusBadge status={pedido.status} />
            <OrigemBadge origem={pedido.origem ?? 'WhatsApp'} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(pedido)}
              className="p-1.5 rounded-input hover:bg-destructive/10 transition-colors"
              title="Excluir pedido"
            >
              <Trash2 className="w-4 h-4 text-destructive/60 hover:text-destructive" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-input hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Cliente</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">{pedido.cliente_nome.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-semibold">{pedido.cliente_nome}</span>
              </div>
              {pedido.cliente_whatsapp && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{pedido.cliente_whatsapp}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{pedido.endereco}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{dateStr} às {timeStr}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Package className="w-3.5 h-3.5" /> Itens do pedido
            </h3>
            <div className="bg-muted/40 rounded-card overflow-hidden">
              {pedido.itens.map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i !== 0 ? 'border-t border-border' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-warm/15 text-warm text-xs font-bold flex items-center justify-center shrink-0">
                      {item.quantidade}
                    </span>
                    <span className="text-foreground">{item.nome}</span>
                  </div>
                  {item.preco_unitario !== undefined && (
                    <span className="text-muted-foreground">
                      R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5" /> Resumo financeiro
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>R$ {pedido.subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span className={pedido.frete === 0 ? 'text-success font-medium' : ''}>
                  {pedido.frete === 0 ? 'Grátis' : `R$ ${pedido.frete.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span>R$ {pedido.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </section>
        </div>

        {action && (
          <div className="px-6 py-4 border-t border-border">
            <button
              onClick={() => { onStatusChange(pedido.id, action.next); onClose(); }}
              className={`w-full py-2.5 rounded-input text-sm font-semibold transition-colors ${action.color}`}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
