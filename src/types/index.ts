export type PedidoStatus = 'Pendente' | 'Em Preparação' | 'Em Processo de Entrega' | 'Finalizado';
export type TipoFrete   = 'fixo' | 'por_bairro' | 'por_km';
export type TomComunicacao = 'formal' | 'informal' | 'descontrado';
export type UserRole    = 'admin' | 'staff';
export type OrigemPedido = 'WhatsApp' | 'iFood' | '99Food' | 'Keeta';

// ── Alinhado com a tabela itens_pedido (snapshot do pedido) ──
export interface PedidoItem {
  id?:              string;
  nome:             string;
  quantidade:       number;
  preco_unitario:   number;   // campo real no DB
  preco?:           number;   // alias legado aceito no frontend
  preco_total?:     number;   // coluna gerada no DB
  cardapio_item_id?: string | null;
}

export interface Pedido {
  id:               string;
  restaurante_id:   string;
  cliente_nome:     string;
  cliente_whatsapp: string;
  endereco:         string;
  itens:            PedidoItem[];
  subtotal:         number;
  frete:            number;
  total:            number;
  status:           PedidoStatus;
  origem:           OrigemPedido;
  finalizado_em?:   string | null;
  created_at:       string;
  updated_at?:      string;
}

export interface Categoria {
  id:             string;
  restaurante_id: string;
  nome:           string;
  cor_display?:   string | null;
  created_at:     string;
}

// ── Alinhado com cardapio_itens JOIN categorias ──
export interface CardapioItem {
  id:             string;
  restaurante_id: string;
  categoria_id?:  string | null;
  categoria:      string;         // nome da categoria (do JOIN)
  nome:           string;
  descricao:      string;
  preco:          number;
  foto_url?:      string | null;
  disponivel:     boolean;
  created_at:     string;
  updated_at?:    string;
}

export interface ConfigEntrega {
  id:             string;
  restaurante_id: string;
  tipo_frete:     TipoFrete;
  valor_frete:    number;
  pedido_minimo:  number;
  raio_km:        number;
  detalhes?:      Record<string, unknown> | null;
}

export interface ConfigAgente {
  nome_restaurante:     string;
  tom:                  TomComunicacao;
  mensagem_boas_vindas: string;
  horario_abertura:     string;
  horario_fechamento:   string;
  aberto:               boolean;
}

export interface Restaurante {
  id:               string;
  nome:             string;
  whatsapp:         string;
  horario_abertura: string;
  horario_fechamento: string;
  created_at:       string;
}

export interface HistoricoStatus {
  id:              string;
  pedido_id:       string;
  status_anterior: PedidoStatus | null;
  status_novo:     PedidoStatus;
  usuario_id?:     string | null;
  created_at:      string;
}
