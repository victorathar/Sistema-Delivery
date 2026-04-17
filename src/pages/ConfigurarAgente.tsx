import { useState } from 'react';
import { Bot, Clock, MessageSquare, Truck, DollarSign, MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import type { ConfigEntrega } from '@/types';

const DEFAULT_AGENTE = {
  nome_restaurante: '',
  tom: 'informal' as const,
  mensagem_boas_vindas: 'Olá! Bem-vindo! Como posso te ajudar?',
  horario_abertura: '11:00',
  horario_fechamento: '23:00',
  aberto: true,
};

const DEFAULT_ENTREGA: Omit<ConfigEntrega, 'id' | 'restaurante_id'> = {
  tipo_frete: 'fixo',
  valor_frete: 6,
  pedido_minimo: 25,
  raio_km: 10,
};

const tipoLabels = {
  fixo: { label: 'Fixo', desc: 'Valor único para todas as entregas' },
  por_bairro: { label: 'Por Bairro', desc: 'Valor varia por bairro' },
  por_km: { label: 'Por Km', desc: 'Valor por quilômetro rodado' },
} as const;

export default function ConfigurarAgente() {
  const configAgente  = useStore((s) => s.configAgente);
  const configEntrega = useStore((s) => s.configEntrega);
  const setConfigAgente  = useStore((s) => s.setConfigAgente);
  const setConfigEntrega = useStore((s) => s.setConfigEntrega);

  const [form, setForm]         = useState({ ...(configAgente ?? DEFAULT_AGENTE) });
  const [entrega, setEntrega]   = useState<Omit<ConfigEntrega, 'id' | 'restaurante_id'>>({
    ...(configEntrega ?? DEFAULT_ENTREGA),
  });

  const handleSaveAgente = async () => {
    await setConfigAgente(form);
    toast.success('Configurações do agente salvas!');
  };

  const handleSaveEntrega = async () => {
    await setConfigEntrega(entrega);
    toast.success('Configurações de entrega salvas!');
  };

  const tomLabels = {
    formal: { label: 'Formal', color: 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
    informal: { label: 'Informal', color: 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300' },
    descontrado: { label: 'Descontraído', color: 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
  } as const;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Coluna esquerda: configurações ── */}
        <div className="space-y-5">

          {/* Identidade */}
          <div className="bg-background rounded-card border border-border shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-violet-50 to-purple-50/50 dark:from-violet-900/20 dark:to-purple-900/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h2 className="text-base font-bold text-foreground">Identidade do Agente</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome do restaurante</label>
                <input
                  value={form.nome_restaurante}
                  onChange={(e) => setForm({ ...form, nome_restaurante: e.target.value })}
                  className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tom de comunicação</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(tomLabels) as Array<keyof typeof tomLabels>).map((tom) => (
                    <button
                      key={tom}
                      type="button"
                      onClick={() => setForm({ ...form, tom })}
                      className={`py-2 rounded-input border-2 text-sm font-semibold transition-all ${
                        form.tom === tom ? tomLabels[tom].color : 'border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {tomLabels[tom].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="bg-background rounded-card border border-border shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-cyan-50 to-sky-50/50 dark:from-cyan-900/20 dark:to-sky-900/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-base font-bold text-foreground">Mensagens</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mensagem de boas-vindas</label>
                <textarea
                  value={form.mensagem_boas_vindas}
                  onChange={(e) => setForm({ ...form, mensagem_boas_vindas: e.target.value })}
                  className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-28"
                />
                <p className="text-xs text-muted-foreground text-right">{form.mensagem_boas_vindas.length} caracteres</p>
              </div>
            </div>
          </div>

          {/* Horário */}
          <div className="bg-background rounded-card border border-border shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/10">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-bold text-foreground">Horário de Funcionamento</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.aberto}
                    onChange={() => setForm({ ...form, aberto: !form.aberto })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-checked:bg-green-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <span className={`text-sm font-semibold ${form.aberto ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {form.aberto ? 'Aberto agora' : 'Fechado'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Abertura</label>
                  <input
                    type="time"
                    value={form.horario_abertura}
                    onChange={(e) => setForm({ ...form, horario_abertura: e.target.value })}
                    className="w-full px-3 py-2 rounded-input border border-amber-300 bg-amber-50/50 text-amber-800 text-sm dark:bg-amber-900/10 dark:text-amber-300 dark:border-amber-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">Fechamento</label>
                  <input
                    type="time"
                    value={form.horario_fechamento}
                    onChange={(e) => setForm({ ...form, horario_fechamento: e.target.value })}
                    className="w-full px-3 py-2 rounded-input border border-orange-300 bg-orange-50/50 text-orange-800 text-sm dark:bg-orange-900/10 dark:text-orange-300 dark:border-orange-700"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveAgente}
                  className="px-6 py-2 rounded-input bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Coluna direita: Preview WhatsApp ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <h2 className="text-sm font-bold text-foreground">Preview WhatsApp</h2>
          </div>
          <div className="bg-[hsl(140,20%,88%)] dark:bg-[hsl(140,15%,18%)] rounded-card p-4 space-y-3 min-h-[300px]">
            <div className="bg-background rounded-lg rounded-tl-none p-3 shadow-soft max-w-[85%]">
              <p className="text-sm text-foreground">{form.mensagem_boas_vindas || 'Sua mensagem de boas-vindas aparecerá aqui...'}</p>
              <p className="text-[10px] text-muted-foreground text-right mt-1">{form.horario_abertura}</p>
            </div>
            <div className="ml-auto bg-green-100 dark:bg-green-900/40 rounded-lg rounded-tr-none p-3 shadow-soft max-w-[85%]">
              <p className="text-sm text-green-800 dark:text-green-300">Olá! Quero fazer um pedido 🍕</p>
              <p className="text-[10px] text-green-600 dark:text-green-500 text-right mt-1">agora</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Seção de Entrega (full width) ── */}
      <div className="bg-background rounded-card border border-border shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-cyan-50 to-teal-50/50 dark:from-cyan-900/20 dark:to-teal-900/10">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-foreground">Entrega</h2>
            <span className="text-xs text-muted-foreground ml-1">Configurações de frete e área de cobertura</span>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Tipo de frete */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Tipo de Frete</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(tipoLabels) as Array<keyof typeof tipoLabels>).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setEntrega({ ...entrega, tipo_frete: tipo })}
                    className={`flex flex-col items-start p-3 rounded-card border-2 text-left transition-all ${
                      entrega.tipo_frete === tipo
                        ? 'border-cyan-500 bg-cyan-50/50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-600'
                        : 'border-border hover:border-border/60 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <span className="text-sm font-semibold">{tipoLabels[tipo].label}</span>
                    <span className="text-xs mt-0.5 opacity-70">{tipoLabels[tipo].desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Valores */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Valores</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Valor do frete (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entrega.valor_frete}
                    onChange={(e) => setEntrega({ ...entrega, valor_frete: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Pedido mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entrega.pedido_minimo}
                    onChange={(e) => setEntrega({ ...entrega, pedido_minimo: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>
            </div>

            {/* Área de cobertura */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Área de Cobertura</h3>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Raio máximo (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={entrega.raio_km}
                  onChange={(e) => setEntrega({ ...entrega, raio_km: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </div>
              <div className="rounded-card bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 p-3 space-y-1 text-xs text-cyan-700 dark:text-cyan-300">
                <p className="font-semibold">Resumo atual</p>
                <p>Frete: R$ {entrega.valor_frete.toFixed(2).replace('.', ',')}</p>
                <p>Mínimo: R$ {entrega.pedido_minimo.toFixed(2).replace('.', ',')}</p>
                <p>Raio: {entrega.raio_km} km</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <button
              onClick={handleSaveEntrega}
              className="px-6 py-2 rounded-input bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors"
            >
              Salvar Entrega
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
