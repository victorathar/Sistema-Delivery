import type { PedidoStatus } from '@/types';

const statusConfig: Record<PedidoStatus, { className: string; dot: string }> = {
  Pendente: {
    className: 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
    dot: 'bg-amber-500',
  },
  'Em Preparação': {
    className: 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
    dot: 'bg-blue-500',
  },
  'Em Processo de Entrega': {
    className: 'bg-teal-100 text-teal-700 border border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700',
    dot: 'bg-teal-500',
  },
  Finalizado: {
    className: 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
    dot: 'bg-green-500',
  },
};

export function StatusBadge({ status }: { status: PedidoStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {status}
    </span>
  );
}
