import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Pedido, CardapioItem, Categoria, ConfigEntrega, ConfigAgente, PedidoStatus } from '@/types'
import * as api from '@/lib/api'

interface AppState {
  // dados
  pedidos:         Pedido[]
  cardapio:        CardapioItem[]
  categorias:      Categoria[]
  configEntrega:   ConfigEntrega | null
  configAgente:    ConfigAgente | null
  restauranteId:   string | null
  restauranteNome: string
  avatarUrl:       string | null

  // estados de carregamento
  loadingPedidos:  boolean
  loadingCardapio: boolean

  // subscriptions internas (não expor ao UI)
  _channels: RealtimeChannel[]

  // inicializacao
  init: (restauranteId: string) => Promise<void>

  // pedidos
  atualizarStatusPedido: (id: string, novoStatus: PedidoStatus) => Promise<void>
  removerPedido:         (id: string) => Promise<void>
  _setPedidoStatus: (id: string, novoStatus: PedidoStatus) => void
  _addPedido: (pedido: Pedido) => void

  // cardapio
  adicionarItemCardapio:  (item: Omit<CardapioItem, 'id' | 'restaurante_id' | 'created_at'>) => Promise<void>
  atualizarItemCardapio:  (id: string, updates: Partial<CardapioItem>) => Promise<void>
  removerItemCardapio:    (id: string) => Promise<void>

  // categorias
  criarCategoria:     (nome: string, corDisplay?: string) => Promise<Categoria>
  atualizarCategoria: (id: string, nome: string, corDisplay?: string | null) => Promise<void>
  removerCategoria:   (id: string) => Promise<{ ok: boolean; motivo?: string }>

  // configuracoes
  setConfigEntrega: (config: Omit<ConfigEntrega, 'id' | 'restaurante_id'>) => Promise<void>
  setConfigAgente:  (config: ConfigAgente) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  pedidos:         [],
  cardapio:        [],
  categorias:      [],
  configEntrega:   null,
  configAgente:    null,
  restauranteId:   null,
  restauranteNome: '',
  avatarUrl:       null,
  loadingPedidos:  false,
  loadingCardapio: false,
  _channels:       [],

  // INIT -- chamado pelo AuthContext apos login
  init: async (restauranteId: string) => {
    // Limpa subscriptions anteriores para evitar acumulação
    get()._channels.forEach((ch) => ch.unsubscribe())
    set({ restauranteId, loadingPedidos: true, loadingCardapio: true, _channels: [] })

    const [pedidos, cardapio, categorias, configEntrega, configAgente, avatarUrl] = await Promise.all([
      api.fetchPedidos(restauranteId),
      api.fetchCardapio(restauranteId),
      api.fetchCategorias(restauranteId),
      api.fetchConfigEntrega(restauranteId),
      api.fetchConfigAgente(restauranteId),
      api.fetchAvatarUrl(),
    ])

    const nome = configAgente?.nome_restaurante ?? 'Restaurante'

    set({
      pedidos, cardapio, categorias,
      configEntrega, configAgente,
      restauranteNome: nome,
      avatarUrl,
      loadingPedidos: false,
      loadingCardapio: false,
    })

    // Realtime: novos pedidos
    const chNovo = api.subscribeNovoPedido(restauranteId, (novoPedido) => {
      set((s) => ({ pedidos: [novoPedido, ...s.pedidos] }))
    })

    // Realtime: mudancas de status vindas de fora (bot/outro usuario)
    const chStatus = api.subscribeStatusPedido(restauranteId, (id, novoStatus) => {
      get()._setPedidoStatus(id, novoStatus)
    })

    set({ _channels: [chNovo, chStatus] })
  },

  // PEDIDOS
  atualizarStatusPedido: async (id, novoStatus) => {
    get()._setPedidoStatus(id, novoStatus)
    await api.atualizarStatusPedido(id, novoStatus)
  },

  removerPedido: async (id) => {
    await api.removerPedido(id)
    set((s) => ({ pedidos: s.pedidos.filter((p) => p.id !== id) }))
  },

  _setPedidoStatus: (id, novoStatus) => {
    set((s) => ({
      pedidos: s.pedidos.map((p) =>
        p.id === id
          ? {
              ...p,
              status: novoStatus,
              finalizado_em: novoStatus === 'Finalizado' ? new Date().toISOString() : p.finalizado_em,
            }
          : p
      ),
    }))
  },

  _addPedido: (pedido) => {
    set((s) => ({ pedidos: [pedido, ...s.pedidos] }))
  },

  // CARDAPIO
  adicionarItemCardapio: async (item) => {
    const { restauranteId, categorias } = get()
    if (!restauranteId) return

    const criado = await api.criarItemCardapio(restauranteId, item as any, categorias)

    const catJaExiste = categorias.some((c) => c.nome === criado.categoria)
    if (!catJaExiste) {
      const cats = await api.fetchCategorias(restauranteId)
      set({ categorias: cats })
    }

    set((s) => ({ cardapio: [...s.cardapio, criado] }))
  },

  atualizarItemCardapio: async (id, updates) => {
    const { restauranteId, categorias } = get()
    if (!restauranteId) return

    set((s) => ({
      cardapio: s.cardapio.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))

    await api.atualizarItemCardapio(id, updates, categorias, restauranteId)

    if (updates.categoria) {
      const cats = await api.fetchCategorias(restauranteId)
      set({ categorias: cats })
    }
  },

  removerItemCardapio: async (id) => {
    set((s) => ({ cardapio: s.cardapio.filter((item) => item.id !== id) }))
    await api.removerItemCardapio(id)
  },

  // CATEGORIAS
  criarCategoria: async (nome, corDisplay) => {
    const { restauranteId } = get()
    if (!restauranteId) throw new Error('Restaurante nao identificado')

    const nova = await api.criarCategoria(restauranteId, nome, corDisplay)
    set((s) => ({
      categorias: [...s.categorias, nova].sort((a, b) => a.nome.localeCompare(b.nome)),
    }))
    return nova
  },

  atualizarCategoria: async (id, nome, corDisplay) => {
    await api.atualizarCategoria(id, nome, corDisplay)
    set((s) => ({
      categorias: s.categorias.map((c) =>
        c.id === id ? { ...c, nome, cor_display: corDisplay ?? null } : c
      ),
      cardapio: s.cardapio.map((item) =>
        item.categoria_id === id ? { ...item, categoria: nome } : item
      ),
    }))
  },

  removerCategoria: async (id) => {
    const resultado = await api.removerCategoria(id)
    if (resultado.ok) {
      set((s) => ({
        categorias: s.categorias.filter((c) => c.id !== id),
      }))
    }
    return resultado
  },

  // CONFIGURACOES
  setConfigEntrega: async (config) => {
    const { restauranteId } = get()
    if (!restauranteId) return
    await api.salvarConfigEntrega(restauranteId, config)
    set((s) => ({
      configEntrega: s.configEntrega
        ? { ...s.configEntrega, ...config }
        : { id: '', restaurante_id: restauranteId, ...config },
    }))
  },

  setConfigAgente: async (config) => {
    const { restauranteId } = get()
    if (!restauranteId) return
    await api.salvarConfigAgente(restauranteId, config)
    set({ configAgente: config, restauranteNome: config.nome_restaurante })
  },
}))
