import { MapPin, Eye, Clock, Trash2 } from 'lucide-react';
import type { Pedido, PedidoStatus, OrigemPedido } from '@/types';
import { StatusBadge } from './StatusBadge';

const nextStatus: Partial<Record<PedidoStatus, { label: string; next: PedidoStatus; color: string }>> = {
  Pendente: {
    label: 'Iniciar Preparo',
    next: 'Em Preparação',
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  'Em Preparação': {
    label: 'Enviar para Entrega',
    next: 'Em Processo de Entrega',
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  'Em Processo de Entrega': {
    label: 'Marcar como Entregue',
    next: 'Finalizado',
    color: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
};

const statusBorder: Record<PedidoStatus, string> = {
  Pendente: 'border-l-amber-400',
  'Em Preparação': 'border-l-blue-500',
  'Em Processo de Entrega': 'border-l-teal-500',
  Finalizado: 'border-l-green-500',
};

const origemConfig: Record<OrigemPedido, { label: string; style: string; dot: string }> = {
  WhatsApp: {
    label: 'WhatsApp',
    style: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
    dot: 'bg-green-500',
  },
  iFood: {
    label: 'iFood',
    style: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
    dot: 'bg-red-500',
  },
  '99Food': {
    label: '99Food',
    style: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-700 dark:border-yellow-700',
    dot: 'bg-yellow-500',
  },
  Keeta: {
    label: 'Keeta',
    style: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
  },
};

function getElapsedTime(created_at: string): string {
  const mins = Math.floor((Date.now() - new Date(created_at).getTime()) / 60000);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  return `${h}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}`;
}

export function OrigemBadge({ origem }: { origem: OrigemPedido }) {
  const cfg = origemConfig[origem] ?? origemConfig.WhatsApp;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function OrderCard({
  pedido,
  onStatusChange,
  onVerDetalhes,
  onDelete,
  isUpdating = false,
}: {
  pedido: Pedido;
  onStatusChange: (id: string, status: PedidoStatus) => void;
  onVerDetalhes: (pedido: Pedido) => void;
  onDelete?: (pedido: Pedido) => void;
  isUpdating?: boolean;
}) {
  const action = nextStatus[pedido.status];
  const shortId = pedido.id.slice(-4).toUpperCase();

  return (
    <div className={`bg-background rounded-card border border-border border-l-4 ${statusBorder[pedido.status]} shadow-soft p-4 flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground">#{shortId}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{getElapsedTime(pedido.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={pedido.status} />
          {onDelete && (
            <button
              onClick={() => onDelete(pedido)}
              className="p-1 rounded-input hover:bg-destructive/10 transition-colors"
              title="Excluir pedido"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive/60 hover:text-destructive" />
            </button>
          )}
        </div>
      </div>

      {/* Cliente + origem */}
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-foreground">{pedido.cliente_nome}</p>
        <OrigemBadge origem={pedido.origem ?? 'WhatsApp'} />
      </div>

      <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-violet-400" />
        <span className="line-clamp-1">{pedido.endereco}</span>
      </div>

      <ul className="space-y-0.5 text-sm text-foreground bg-muted/30 rounded-input px-3 py-2">
        {pedido.itens.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>
              <span className="text-orange-500 font-bold">{item.quantidade}x</span>
              {' '}{item.nome}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-border" />

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-green-600 dark:text-green-400">
          R$ {pedido.total.toFixed(2).replace('.', ',')}
        </span>
        {action && (
          <button
            onClick={() => onStatusChange(pedido.id, action.next)}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-input text-xs font-bold transition-colors ${action.color} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isUpdating ? 'Atualizando...' : action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onVerDetalhes(pedido)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-input border border-border text-xs font-semibold text-muted-foreground hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 dark:hover:bg-violet-900/20 dark:hover:text-violet-300 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        Ver Detalhes
      </button>
    </div>
  );
}
