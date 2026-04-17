import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, Tag, Check, FolderOpen, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import type { CardapioItem, Categoria } from '@/types';

// ─── Paleta de cores disponíveis para categorias ───────────────────────────
const COLOR_SWATCHES = [
  { hex: '#f59e0b', label: 'Âmbar' },
  { hex: '#ef4444', label: 'Vermelho' },
  { hex: '#f97316', label: 'Laranja' },
  { hex: '#84cc16', label: 'Lima' },
  { hex: '#10b981', label: 'Verde' },
  { hex: '#14b8a6', label: 'Teal' },
  { hex: '#06b6d4', label: 'Ciano' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#6366f1', label: 'Índigo' },
  { hex: '#8b5cf6', label: 'Violeta' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#f43f5e', label: 'Carmesim' },
  { hex: '#a16207', label: 'Marrom' },
  { hex: '#64748b', label: 'Slate' },
];

// Retorna classe Tailwind de badge para categoria (baseada em cor hex do DB ou fallbacks)
const KNOWN_CATEGORY_COLORS: Record<string, string> = {
  'Hambúrgueres':   'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
  'Pizzas':         'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
  'Acompanhamentos':'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
  'Sobremesas':     'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700',
  'Combos':         'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700',
  'Bebidas':        'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700',
  'Lanches':        'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700',
  'Saladas':        'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
  'Massas':         'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700',
  'Frutos do Mar':  'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700',
  'Carnes':         'bg-red-200 text-red-900 border-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-600',
  'Vegano':         'bg-lime-100 text-lime-700 border-lime-300 dark:bg-lime-900/40 dark:text-lime-300 dark:border-lime-700',
};
const FALLBACK_PALETTE = [
  'bg-indigo-100 text-indigo-700 border-indigo-300',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
  'bg-emerald-100 text-emerald-700 border-emerald-300',
  'bg-sky-100 text-sky-700 border-sky-300',
  'bg-pink-100 text-pink-700 border-pink-300',
];
function getCategoryStyle(categoria: string, unknownCats: string[]): string {
  if (KNOWN_CATEGORY_COLORS[categoria]) return KNOWN_CATEGORY_COLORS[categoria];
  const idx = unknownCats.indexOf(categoria);
  return FALLBACK_PALETTE[Math.max(0, idx) % FALLBACK_PALETTE.length];
}

const KNOWN_DOT_COLORS: Record<string, string> = {
  'Hambúrgueres': 'bg-amber-500', 'Pizzas': 'bg-red-500',
  'Acompanhamentos': 'bg-blue-500', 'Sobremesas': 'bg-rose-500',
  'Combos': 'bg-violet-500', 'Bebidas': 'bg-cyan-500',
  'Lanches': 'bg-orange-500', 'Saladas': 'bg-green-500',
  'Massas': 'bg-yellow-500', 'Frutos do Mar': 'bg-teal-500',
  'Carnes': 'bg-red-700', 'Vegano': 'bg-lime-500',
};
const FALLBACK_DOTS = ['bg-indigo-500', 'bg-fuchsia-500', 'bg-emerald-500', 'bg-sky-500', 'bg-pink-500'];
function getDotColor(categoria: string, unknownCats: string[]): string {
  if (KNOWN_DOT_COLORS[categoria]) return KNOWN_DOT_COLORS[categoria];
  const idx = unknownCats.indexOf(categoria);
  return FALLBACK_DOTS[Math.max(0, idx) % FALLBACK_DOTS.length];
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function Cardapio() {
  const cardapio        = useStore((s) => s.cardapio);
  const categoriasStore = useStore((s) => s.categorias);
  const adicionarItem   = useStore((s) => s.adicionarItemCardapio);
  const atualizarItem   = useStore((s) => s.atualizarItemCardapio);
  const removerItem     = useStore((s) => s.removerItemCardapio);

  const [search, setSearch]             = useState('');
  const [catFilter, setCatFilter]       = useState('');
  const [itemModalOpen, setItemModalOpen]   = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editItem, setEditItem]         = useState<CardapioItem | null>(null);

  const categorias   = categoriasStore.length > 0
    ? categoriasStore.map((c) => c.nome)
    : [...new Set(cardapio.map((i) => i.categoria))];
  const unknownCats  = categorias.filter((c) => !KNOWN_CATEGORY_COLORS[c]);

  // Retorna o hex de cor definido pelo usuário para uma categoria, ou undefined se não houver
  const getCatHex = (nome: string): string | undefined =>
    categoriasStore.find((c) => c.nome === nome)?.cor_display ?? undefined;

  const filtered = cardapio.filter((item) => {
    const matchSearch = item.nome.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !catFilter || item.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setEditItem(null); setItemModalOpen(true); };
  const openEdit   = (item: CardapioItem) => { setEditItem(item); setItemModalOpen(true); };

  const displayedCats = catFilter ? [catFilter] : categorias;
  const byCategory    = displayedCats.reduce<Record<string, CardapioItem[]>>((acc, cat) => {
    acc[cat] = filtered.filter((i) => i.categoria === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {/* Linha 1 (mobile): busca + filtro lado a lado */}
        <div className="flex gap-2 sm:flex-1 sm:contents">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="shrink-0 px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm"
          >
            <option value="">Todas</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Linha 2 (mobile): botões lado a lado */}
        <div className="flex gap-2">
          <button
            onClick={() => setCatModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-input border border-border bg-background text-foreground text-sm font-semibold hover:bg-secondary transition-colors whitespace-nowrap"
          >
            <FolderOpen className="w-4 h-4 text-primary shrink-0" />
            <span>Categorias</span>
            {categoriasStore.length > 0 && (
              <span className="ml-1 bg-primary/15 text-primary text-xs font-bold rounded-full px-1.5 py-0.5">
                {categoriasStore.length}
              </span>
            )}
          </button>

          <button
            onClick={openCreate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-input bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/85 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" /> Novo Item
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-primary/10 to-violet-100/60 border border-primary/25 rounded-card px-4 py-3 dark:from-primary/20 dark:to-violet-900/20">
          <p className="text-xs text-primary font-semibold">Total de itens</p>
          <p className="text-2xl font-bold text-primary">{cardapio.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-100/60 border border-green-200 rounded-card px-4 py-3 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
          <p className="text-xs text-green-700 font-semibold dark:text-green-400">Disponíveis</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{cardapio.filter((i) => i.disponivel).length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100/60 border border-amber-200 rounded-card px-4 py-3 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700">
          <p className="text-xs text-amber-700 font-semibold dark:text-amber-400">Indisponíveis</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{cardapio.filter((i) => !i.disponivel).length}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-sky-100/60 border border-cyan-200 rounded-card px-4 py-3 dark:from-cyan-900/20 dark:to-sky-900/20 dark:border-cyan-700">
          <p className="text-xs text-cyan-700 font-semibold dark:text-cyan-400">Categorias</p>
          <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">{categorias.length}</p>
        </div>
      </div>

      {/* Lista por categoria */}
      {Object.entries(byCategory).map(([categoria, itens]) => {
        const hex = getCatHex(categoria);
        return itens.length === 0 ? null : (
        <div key={categoria} className="space-y-2">
          <div className="flex items-center gap-2">
            {hex
              ? <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: hex }} />
              : <div className={`w-3 h-3 rounded-full shrink-0 ${getDotColor(categoria, unknownCats)}`} />
            }
            <h3 className="text-sm font-bold text-foreground">{categoria}</h3>
            {hex
              ? <span className="text-xs px-2 py-0.5 rounded-full border font-medium" style={{ backgroundColor: hex + '22', color: hex, borderColor: hex + '55' }}>
                  {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                </span>
              : <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getCategoryStyle(categoria, unknownCats)}`}>
                  {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                </span>
            }
          </div>
          <div className="bg-background rounded-card border border-border shadow-soft overflow-hidden">
            {itens.map((item, idx) => (
              <div
                key={item.id}
                className={`group px-4 py-3 transition-colors hover:bg-muted/30 ${!item.disponivel ? 'opacity-50' : ''} ${idx !== 0 ? 'border-t border-border' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-[5px] ${item.disponivel ? 'bg-green-500' : 'bg-muted-foreground'}`} />

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{item.nome}</span>
                      {(() => { const h = getCatHex(item.categoria); return h
                        ? <span className="text-xs px-2 py-0.5 rounded-full border font-medium" style={{ backgroundColor: h + '22', color: h, borderColor: h + '55' }}>{item.categoria}</span>
                        : <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getCategoryStyle(item.categoria, unknownCats)}`}>{item.categoria}</span>;
                      })()}
                    </div>
                    {item.descricao && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.descricao}</p>
                    )}

                    {/* Mobile: preço + ações + toggle (sempre visível) */}
                    <div className="flex items-center justify-between gap-2 mt-2 sm:hidden">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        R$ {item.preco.toFixed(2).replace('.', ',')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-input hover:bg-info/15 transition-colors">
                          <Pencil className="w-4 h-4 text-info" />
                        </button>
                        <button onClick={() => removerItem(item.id)} className="p-1.5 rounded-input hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={item.disponivel} onChange={() => atualizarItem(item.id, { disponivel: !item.disponivel })} className="sr-only peer" />
                          <div className="w-9 h-5 bg-muted peer-checked:bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: preço + toggle + ações no hover */}
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <span className="text-base font-bold text-green-600 dark:text-green-400">
                      R$ {item.preco.toFixed(2).replace('.', ',')}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" checked={item.disponivel} onChange={() => atualizarItem(item.id, { disponivel: !item.disponivel })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-muted peer-checked:bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-input hover:bg-info/15 transition-colors">
                        <Pencil className="w-4 h-4 text-info" />
                      </button>
                      <button onClick={() => removerItem(item.id)} className="p-1.5 rounded-input hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhum item encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo item</p>
        </div>
      )}

      {/* Modal: Novo/Editar Item */}
      {itemModalOpen && (
        <ItemModal
          item={editItem}
          categorias={categorias}
          unknownCats={unknownCats}
          onClose={() => setItemModalOpen(false)}
          onSave={(data) => {
            if (editItem) {
              atualizarItem(editItem.id, data);
            } else {
              adicionarItem(data as any);
            }
            setItemModalOpen(false);
          }}
        />
      )}

      {/* Modal: Gerenciar Categorias */}
      {catModalOpen && (
        <CategoriaManagerModal
          categorias={categoriasStore}
          cardapio={cardapio}
          unknownCats={unknownCats}
          onClose={() => setCatModalOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Modal: Gerenciar Categorias ─────────────────────────────────────────────
function CategoriaManagerModal({
  categorias,
  cardapio,
  unknownCats,
  onClose,
}: {
  categorias:  Categoria[];
  cardapio:    CardapioItem[];
  unknownCats: string[];
  onClose:     () => void;
}) {
  const criarCategoria     = useStore((s) => s.criarCategoria);
  const atualizarCategoria = useStore((s) => s.atualizarCategoria);
  const removerCategoria   = useStore((s) => s.removerCategoria);

  const [novoNome, setNovoNome]     = useState('');
  const [novaCor, setNovaCor]       = useState(COLOR_SWATCHES[0].hex);
  const [salvando, setSalvando]     = useState(false);

  // Estado de edição inline por categoria
  const [editId, setEditId]         = useState<string | null>(null);
  const [editNome, setEditNome]     = useState('');
  const [editCor, setEditCor]       = useState('');

  const contarItens = (catNome: string) =>
    cardapio.filter((i) => i.categoria === catNome).length;

  const handleCriar = async () => {
    const nome = novoNome.trim();
    if (!nome) return;
    if (categorias.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) {
      toast.error('Já existe uma categoria com este nome.');
      return;
    }
    setSalvando(true);
    try {
      await criarCategoria(nome, novaCor);
      toast.success(`Categoria "${nome}" criada!`);
      setNovoNome('');
      setNovaCor(COLOR_SWATCHES[0].hex);
    } catch {
      toast.error('Erro ao criar categoria.');
    } finally {
      setSalvando(false);
    }
  };

  const startEdit = (cat: Categoria) => {
    setEditId(cat.id);
    setEditNome(cat.nome);
    setEditCor(cat.cor_display ?? COLOR_SWATCHES[0].hex);
  };

  const handleSalvarEdit = async () => {
    if (!editId || !editNome.trim()) return;
    try {
      await atualizarCategoria(editId, editNome.trim(), editCor || null);
      toast.success('Categoria atualizada!');
      setEditId(null);
    } catch {
      toast.error('Erro ao atualizar categoria.');
    }
  };

  const handleRemover = async (cat: Categoria) => {
    const qtd = contarItens(cat.nome);
    if (qtd > 0) {
      toast.error(`"${cat.nome}" possui ${qtd} item(ns). Reatribua-os antes de excluir.`);
      return;
    }
    const { ok, motivo } = await removerCategoria(cat.id);
    if (ok) {
      toast.success(`Categoria "${cat.nome}" removida.`);
    } else {
      toast.error(motivo ?? 'Não foi possível remover.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-background rounded-card shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Gerenciar Categorias</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-input hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Lista de categorias existentes */}
        <div className="flex-1 overflow-y-auto">
          {categorias.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              Nenhuma categoria cadastrada ainda.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {categorias.map((cat) => {
                const qtd = contarItens(cat.nome);
                const isEditing = editId === cat.id;

                return (
                  <li key={cat.id} className="px-5 py-3">
                    {isEditing ? (
                      /* Modo edição inline */
                      <div className="space-y-3">
                        <input
                          autoFocus
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSalvarEdit()}
                          className="w-full px-3 py-2 rounded-input border border-primary/40 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <ColorSwatchPicker selected={editCor} onChange={setEditCor} />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditId(null)}
                            className="px-3 py-1.5 rounded-input border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSalvarEdit}
                            className="px-4 py-1.5 rounded-input bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Modo visualização */
                      <div className="flex items-center gap-3">
                        {/* Dot de cor */}
                        <div
                          className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                          style={{ backgroundColor: cat.cor_display ?? undefined }}
                        />
                        {/* Nome + badge de itens */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-foreground">{cat.nome}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {qtd} {qtd === 1 ? 'item' : 'itens'}
                          </span>
                        </div>
                        {/* Aviso se não pode ser deletada */}
                        {qtd > 0 && (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" title={`${qtd} item(ns) nesta categoria`} />
                        )}
                        {/* Ações */}
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-input hover:bg-info/15 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 text-info" />
                        </button>
                        <button
                          onClick={() => handleRemover(cat)}
                          className="p-1.5 rounded-input hover:bg-destructive/10 transition-colors"
                          title={qtd > 0 ? 'Reatribua os itens antes de excluir' : 'Excluir'}
                          disabled={qtd > 0}
                        >
                          <Trash2 className={`w-4 h-4 ${qtd > 0 ? 'text-muted-foreground/40' : 'text-destructive'}`} />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer: criar nova categoria */}
        <div className="border-t border-border px-5 py-4 space-y-3 bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nova categoria</p>
          <div className="flex gap-2">
            <input
              placeholder="Ex: Massas, Vegano, Frutos do Mar..."
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCriar()}
              className="flex-1 px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleCriar}
              disabled={salvando || !novoNome.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-input bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {salvando ? 'Criando...' : 'Criar'}
            </button>
          </div>
          {/* Paleta de cores */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Cor da categoria:</p>
            <ColorSwatchPicker selected={novaCor} onChange={setNovaCor} />
          </div>
          {/* Preview do badge */}
          {novoNome.trim() && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <span
                className="text-xs px-2.5 py-1 rounded-full border font-semibold"
                style={{
                  backgroundColor: novaCor + '22',
                  color: novaCor,
                  borderColor: novaCor + '55',
                }}
              >
                {novoNome.trim()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Seletor de cor com swatches ─────────────────────────────────────────────
function ColorSwatchPicker({ selected, onChange }: { selected: string; onChange: (hex: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_SWATCHES.map((swatch) => (
        <button
          key={swatch.hex}
          type="button"
          title={swatch.label}
          onClick={() => onChange(swatch.hex)}
          className={`w-6 h-6 rounded-full ring-offset-1 transition-all ${
            selected === swatch.hex ? 'ring-2 ring-foreground scale-110' : 'hover:scale-110 ring-1 ring-black/10'
          }`}
          style={{ backgroundColor: swatch.hex }}
        />
      ))}
    </div>
  );
}

// ─── Modal: Novo / Editar Item ────────────────────────────────────────────────
function ItemModal({
  item,
  categorias,
  unknownCats,
  onClose,
  onSave,
}: {
  item:        CardapioItem | null;
  categorias:  string[];
  unknownCats: string[];
  onClose:     () => void;
  onSave:      (data: Partial<CardapioItem>) => void;
}) {
  const [form, setForm] = useState({
    nome:       item?.nome      || '',
    descricao:  item?.descricao || '',
    preco:      item?.preco?.toString() || '',
    categoria:  item?.categoria || '',
    disponivel: item?.disponivel ?? true,
  });
  const [addingCat, setAddingCat]   = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, preco: parseFloat(form.preco) || 0 });
  };

  const confirmNewCat = () => {
    const trimmed = newCatInput.trim();
    if (trimmed) {
      setForm({ ...form, categoria: trimmed });
      setAddingCat(false);
      setNewCatInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-background rounded-card shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary/10 to-violet-100/50 border-b border-border dark:from-primary/20 dark:to-violet-900/20">
          <h2 className="text-lg font-bold text-primary">{item ? 'Editar Item' : 'Novo Item'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-input transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome do item *</label>
            <input
              placeholder="Ex: X-Burguer Especial"
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descrição</label>
            <textarea
              placeholder="Descreva o item..."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preço (R$) *</label>
            <input
              placeholder="0,00"
              required
              type="number"
              step="0.01"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
              className="w-full px-3 py-2 rounded-input border border-green-300 bg-green-50/50 text-green-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 dark:bg-green-900/10 dark:text-green-300 dark:border-green-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria *</label>
            {addingCat ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  placeholder="Nome da nova categoria"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmNewCat(); } }}
                  className="flex-1 px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button type="button" onClick={confirmNewCat} className="px-3 py-2 rounded-input bg-green-500 text-white hover:bg-green-600 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => { setAddingCat(false); setNewCatInput(''); }} className="px-3 py-2 rounded-input border border-border hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <select
                  required
                  value={form.categoria}
                  onChange={(e) => {
                    if (e.target.value === '__new__') { setAddingCat(true); }
                    else { setForm({ ...form, categoria: e.target.value }); }
                  }}
                  className="flex-1 px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Selecionar categoria...</option>
                  {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__new__">+ Adicionar nova categoria</option>
                </select>
                {form.categoria && (
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${getCategoryStyle(form.categoria, unknownCats)}`}>
                    {form.categoria}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-input border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 rounded-input bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
