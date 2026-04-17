import { useState } from 'react';
import { Truck, DollarSign, MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ConfigEntrega } from '@/types';
import { toast } from 'sonner';

const tipoLabels = {
  fixo: { label: 'Fixo', desc: 'Valor único para todas as entregas' },
  por_bairro: { label: 'Por Bairro', desc: 'Valor varia por bairro' },
  por_km: { label: 'Por Km', desc: 'Valor por quilômetro rodado' },
} as const;

const DEFAULT_CONFIG: Omit<ConfigEntrega, 'id' | 'restaurante_id'> = {
  tipo_frete: 'fixo', valor_frete: 6, pedido_minimo: 25, raio_km: 10,
};

export default function Entrega() {
  const config = useStore((s) => s.configEntrega);
  const setConfig = useStore((s) => s.setConfigEntrega);
  const [form, setForm] = useState<Omit<ConfigEntrega, 'id' | 'restaurante_id'>>({ ...(config ?? DEFAULT_CONFIG) });

  const handleSave = async () => {
    await setConfig(form);
    toast.success('Configurações de entrega salvas!');
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Tipo de frete */}
      <div className="bg-card rounded-card border border-border shadow-soft p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Tipo de Frete</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(Object.keys(tipoLabels) as Array<keyof typeof tipoLabels>).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setForm({ ...form, tipo_frete: tipo })}
              className={`flex flex-col items-start p-3 rounded-card border-2 text-left transition-all ${
                form.tipo_frete === tipo
                  ? 'border-primary bg-primary/5 text-primary'
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
      <div className="bg-card rounded-card border border-border shadow-soft p-6 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Valores</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Valor do frete (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.valor_frete}
              onChange={(e) => setForm({ ...form, valor_frete: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Pedido mínimo (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.pedido_minimo}
              onChange={(e) => setForm({ ...form, pedido_minimo: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
        </div>
      </div>

      {/* Raio */}
      <div className="bg-card rounded-card border border-border shadow-soft p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Área de Cobertura</h2>
        </div>
        <div className="space-y-1.5 max-w-xs">
          <label className="text-xs font-medium text-muted-foreground">Raio máximo (km)</label>
          <input
            type="number"
            step="0.1"
            value={form.raio_km}
            onChange={(e) => setForm({ ...form, raio_km: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-input bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
