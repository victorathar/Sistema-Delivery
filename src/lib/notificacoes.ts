const WEBHOOKS: Record<string, string> = {
  'Em Preparação': import.meta.env.VITE_WEBHOOK_PREPARANDO ?? '',
  'Em Processo de Entrega': import.meta.env.VITE_WEBHOOK_ENTREGA ?? '',
  'Finalizado': import.meta.env.VITE_WEBHOOK_FINALIZADO ?? '',
}

export async function notificarCliente(novoStatus: string, pedidoId: string): Promise<void> {
  const url = WEBHOOKS[novoStatus]
  if (!url) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pedido_id: pedidoId }),
  })
}
