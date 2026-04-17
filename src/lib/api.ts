/**
 * api.ts — Camada de acesso ao Supabase.
 * Todas as operações de leitura/escrita do banco passam por aqui.
 * As páginas nunca importam o supabase client diretamente.
 */

import { supabase } from '@/lib/supabase'
import { notificarCliente } from '@/lib/notificacoes'
import type {
  Pedido, PedidoItem, PedidoStatus,
  CardapioItem, Categoria,
  ConfigEntrega, ConfigAgente,
} from '@/types'

// -----------------------------------------------------------------
// HELPER: busca restaurante_id do usuário logado
// -----------------------------------------------------------------
export async function getRestauranteId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('usuarios')
    .select('restaurante_id')
    .eq('id', user.id)
    .single()

  if (error || !data) throw new Error('Perfil do usuário não encontrado')
  return data.restaurante_id
}

// -----------------------------------------------------------------
// CATEGORIAS
// -----------------------------------------------------------------
export async function fetchCategorias(restauranteId: string): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('restaurante_id', restauranteId)
    .order('nome')

  if (error) throw error
  return data ?? []
}

export async function criarCategoria(restauranteId: string, nome: string, corDisplay?: string): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .insert({ restaurante_id: restauranteId, nome, cor_display: corDisplay ?? null })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function atualizarCategoria(id: string, nome: string, corDisplay?: string | null): Promise<void> {
  const { error } = await supabase
    .from('categorias')
    .update({ nome, cor_display: corDisplay ?? null })
    .eq('id', id)

  if (error) throw error
}

export async function removerCategoria(id: string): Promise<{ ok: boolean; motivo?: string }> {
  const { count } = await supabase
    .from('cardapio_itens')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', id)

  if ((count ?? 0) > 0) {
    return { ok: false, motivo: `Esta categoria possui ${count} item(ns). Reatribua-os antes de excluir.` }
  }

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)

  if (error) throw error
  return { ok: true }
}

// -----------------------------------------------------------------
// CARDAPIO
// -----------------------------------------------------------------
export async function fetchCardapio(restauranteId: string): Promise<CardapioItem[]> {
  const { data, error } = await supabase
    .from('cardapio_itens')
    .select(`
      id, restaurante_id, categoria_id,
      nome, descricao, preco, disponivel, foto_url,
      created_at, updated_at,
      categorias ( nome )
    `)
    .eq('restaurante_id', restauranteId)
    .order('nome')

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...row,
    categoria: row.categorias?.nome ?? 'Sem categoria',
    categorias: undefined,
  }))
}

export async function criarItemCardapio(
  restauranteId: string,
  item: Omit<CardapioItem, 'id' | 'restaurante_id' | 'created_at' | 'updated_at'>,
  categorias: Categoria[]
): Promise<CardapioItem> {
  let categoriaId = item.categoria_id
  if (!categoriaId) {
    const cat = categorias.find(c => c.nome === item.categoria)
    if (cat) {
      categoriaId = cat.id
    } else {
      const nova = await criarCategoria(restauranteId, item.categoria)
      categoriaId = nova.id
    }
  }

  const { data, error } = await supabase
    .from('cardapio_itens')
    .insert({
      restaurante_id: restauranteId,
      categoria_id: categoriaId,
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco,
      disponivel: item.disponivel,
      foto_url: item.foto_url ?? null,
    })
    .select(`*, categorias(nome)`)
    .single()

  if (error) throw error
  return { ...data, categoria: data.categorias?.nome ?? item.categoria, categorias: undefined }
}

export async function atualizarItemCardapio(
  id: string,
  updates: Partial<CardapioItem>,
  categorias: Categoria[],
  restauranteId: string
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (updates.nome        !== undefined) patch.nome        = updates.nome
  if (updates.descricao   !== undefined) patch.descricao   = updates.descricao
  if (updates.preco       !== undefined) patch.preco       = updates.preco
  if (updates.disponivel  !== undefined) patch.disponivel  = updates.disponivel
  if (updates.foto_url    !== undefined) patch.foto_url    = updates.foto_url

  if (updates.categoria !== undefined) {
    const cat = categorias.find(c => c.nome === updates.categoria)
    if (cat) {
      patch.categoria_id = cat.id
    } else {
      const nova = await criarCategoria(restauranteId, updates.categoria)
      patch.categoria_id = nova.id
    }
  }
  if (updates.categoria_id !== undefined) patch.categoria_id = updates.categoria_id

  const { error } = await supabase
    .from('cardapio_itens')
    .update(patch)
    .eq('id', id)

  if (error) throw error
}

export async function removerItemCardapio(id: string): Promise<void> {
  const { error } = await supabase
    .from('cardapio_itens')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// -----------------------------------------------------------------
// PEDIDOS
// -----------------------------------------------------------------
export async function fetchPedidos(restauranteId: string): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      itens_pedido (
        id, nome, quantidade, preco_unitario, preco_total, cardapio_item_id
      )
    `)
    .eq('restaurante_id', restauranteId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...row,
    origem: row.origem ?? 'WhatsApp',
    itens: (row.itens_pedido ?? []).map((i: any) => ({
      id: i.id,
      nome: i.nome,
      quantidade: i.quantidade,
      preco_unitario: i.preco_unitario,
      preco: i.preco_unitario,
      preco_total: i.preco_total,
      cardapio_item_id: i.cardapio_item_id,
    })),
    itens_pedido: undefined,
  }))
}

export async function atualizarStatusPedido(id: string, novoStatus: PedidoStatus): Promise<void> {
  const { error } = await supabase
    .from('pedidos')
    .update({ status: novoStatus })
    .eq('id', id)

  if (error) throw error

  // Notificar cliente via WhatsApp (fire-and-forget)
  notificarCliente(novoStatus, id).catch(() => {})
}

export async function removerPedido(id: string): Promise<void> {
  const { error } = await supabase
    .from('pedidos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function fetchHistoricoPedido(pedidoId: string) {
  const { data, error } = await supabase
    .from('historico_status_pedido')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

// -----------------------------------------------------------------
// CONFIGURACOES DE ENTREGA
// -----------------------------------------------------------------
export async function fetchConfigEntrega(restauranteId: string): Promise<ConfigEntrega | null> {
  const { data, error } = await supabase
    .from('configuracoes_entrega')
    .select('*')
    .eq('restaurante_id', restauranteId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function salvarConfigEntrega(restauranteId: string, config: Omit<ConfigEntrega, 'id' | 'restaurante_id'>): Promise<void> {
  const { error } = await supabase
    .from('configuracoes_entrega')
    .upsert({ restaurante_id: restauranteId, ...config }, { onConflict: 'restaurante_id' })

  if (error) throw error
}

// -----------------------------------------------------------------
// CONFIGURACOES DO AGENTE
// -----------------------------------------------------------------
export async function fetchConfigAgente(restauranteId: string): Promise<ConfigAgente | null> {
  const { data, error } = await supabase
    .from('configuracoes_agente')
    .select('*')
    .eq('restaurante_id', restauranteId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null

  return {
    nome_restaurante:     data.nome_restaurante,
    tom:                  data.tom,
    mensagem_boas_vindas: data.mensagem_boas_vindas,
    horario_abertura:     data.horario_abertura,
    horario_fechamento:   data.horario_fechamento,
    aberto:               data.aberto,
  }
}

export async function salvarConfigAgente(restauranteId: string, config: ConfigAgente): Promise<void> {
  const { error } = await supabase
    .from('configuracoes_agente')
    .upsert({ restaurante_id: restauranteId, ...config }, { onConflict: 'restaurante_id' })

  if (error) throw error
}

// -----------------------------------------------------------------
// PERFIL DO USUÁRIO
// -----------------------------------------------------------------
export interface PerfilUsuario {
  id: string
  username: string
  role: 'admin' | 'staff'
  email: string
  ultimo_acesso: string | null
  usuario_criado_em: string
  restaurante_id: string
  restaurante_nome: string
  restaurante_whatsapp: string
  horario_abertura: string
  horario_fechamento: string
  restaurante_criado_em: string
  avatar_url: string | null
}

export async function updateUsernameField(newUsername: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { error } = await supabase
    .from('usuarios')
    .update({ username: newUsername })
    .eq('id', user.id)
  if (error) throw error
}

export async function updateEmailField(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw error
}

export async function updateRestauranteNome(restauranteId: string, nome: string): Promise<void> {
  const { error } = await supabase
    .from('restaurantes')
    .update({ nome })
    .eq('id', restauranteId)
  if (error) throw error
}

export async function updateRestauranteWhatsapp(restauranteId: string, whatsapp: string): Promise<void> {
  const { error } = await supabase
    .from('restaurantes')
    .update({ whatsapp })
    .eq('id', restauranteId)
  if (error) throw error
}

export async function fetchPerfil(): Promise<PerfilUsuario> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data: usuario, error: errU } = await supabase
    .from('usuarios')
    .select('id, username, role, created_at, restaurante_id, avatar_url')
    .eq('id', user.id)
    .single()

  if (errU || !usuario) throw new Error('Perfil não encontrado')

  const { data: restaurante, error: errR } = await supabase
    .from('restaurantes')
    .select('nome, whatsapp, horario_abertura, horario_fechamento, created_at')
    .eq('id', usuario.restaurante_id)
    .single()

  if (errR || !restaurante) throw new Error('Restaurante não encontrado')

  return {
    id:                    usuario.id,
    username:              usuario.username,
    role:                  usuario.role,
    email:                 user.email ?? '',
    ultimo_acesso:         user.last_sign_in_at ?? null,
    usuario_criado_em:     usuario.created_at,
    restaurante_id:        usuario.restaurante_id,
    restaurante_nome:      restaurante.nome,
    restaurante_whatsapp:  restaurante.whatsapp,
    horario_abertura:      restaurante.horario_abertura,
    horario_fechamento:    restaurante.horario_fechamento,
    restaurante_criado_em: restaurante.created_at,
    avatar_url:            usuario.avatar_url ?? null,
  }
}

export async function fetchAvatarUrl(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('usuarios')
    .select('avatar_url')
    .eq('id', user.id)
    .single()
  return data?.avatar_url ?? null
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)

  const urlWithBust = `${publicUrl}?t=${Date.now()}`

  const { error: dbError } = await supabase
    .from('usuarios')
    .update({ avatar_url: urlWithBust })
    .eq('id', user.id)

  if (dbError) throw dbError

  return urlWithBust
}

// -----------------------------------------------------------------
// REALTIME
// -----------------------------------------------------------------
export function subscribeNovoPedido(
  restauranteId: string,
  onNovo: (pedido: Pedido) => void
) {
  return supabase
    .channel(`pedidos:${restauranteId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'pedidos',
        filter: `restaurante_id=eq.${restauranteId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from('pedidos')
          .select(`*, itens_pedido(*)`)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          onNovo({
            ...data,
            origem: data.origem ?? 'WhatsApp',
            itens: (data.itens_pedido ?? []).map((i: any) => ({
              ...i,
              preco: i.preco_unitario,
            })),
            itens_pedido: undefined,
          })
        }
      }
    )
    .subscribe()
}

export function subscribeStatusPedido(
  restauranteId: string,
  onChange: (id: string, status: PedidoStatus) => void
) {
  return supabase
    .channel(`status:${restauranteId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'pedidos',
        filter: `restaurante_id=eq.${restauranteId}`,
      },
      (payload) => {
        onChange(payload.new.id, payload.new.status as PedidoStatus)
      }
    )
    .subscribe()
}
