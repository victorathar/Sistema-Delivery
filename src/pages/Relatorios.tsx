import { useStore } from '@/store/useStore';
import { ShoppingBag, DollarSign, TrendingUp, Star, Award, Percent } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const PIE_COLORS = [
  '#7c3aed', '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#8b5cf6',
];

const BAR_GRADIENT_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];

export default function Relatorios() {
  const pedidos = useStore((s) => s.pedidos);
  const cardapio = useStore((s) => s.cardapio);

  const totalPedidos = pedidos.length;
  const receitaTotal = pedidos.reduce((acc, p) => acc + p.total, 0);
  const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;
  const freteTotal = pedidos.reduce((acc, p) => acc + p.frete, 0);
  const pedidosFinalizados = pedidos.filter((p) => p.status === 'Finalizado').length;
  const taxaConclusao = totalPedidos > 0 ? (pedidosFinalizados / totalPedidos) * 100 : 0;

  // Item mais pedido
  const itemCount: Record<string, number> = {};
  pedidos.forEach((p) => p.itens.forEach((i) => { itemCount[i.nome] = (itemCount[i.nome] || 0) + i.quantidade; }));
  const topItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];

  // Bar chart mock (last 7 days)
  const barData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dia: `${d.getDate()}/${d.getMonth() + 1}`,
      pedidos: Math.floor(Math.random() * 15) + 3,
      receita: Math.floor(Math.random() * 800) + 200,
    };
  });

  // Pie chart by category
  const catCount: Record<string, number> = {};
  pedidos.forEach((p) =>
    p.itens.forEach((item) => {
      const cat = cardapio.find((c) => c.nome === item.nome)?.categoria || 'Outros';
      catCount[cat] = (catCount[cat] || 0) + item.quantidade;
    })
  );
  const pieData = Object.entries(catCount).map(([name, value]) => ({ name, value }));

  const metrics = [
    {
      label: 'Pedidos hoje',
      value: totalPedidos.toString(),
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-600 dark:text-blue-300',
    },
    {
      label: 'Receita hoje',
      value: `R$ ${receitaTotal.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-600 dark:text-green-300',
    },
    {
      label: 'Ticket médio',
      value: `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`,
      icon: TrendingUp,
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      border: 'border-violet-200 dark:border-violet-700',
      text: 'text-violet-600 dark:text-violet-300',
    },
    {
      label: 'Item mais pedido',
      value: topItem ? topItem[0] : '—',
      icon: Star,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-600 dark:text-amber-300',
    },
    {
      label: 'Frete arrecadado',
      value: `R$ ${freteTotal.toFixed(2).replace('.', ',')}`,
      icon: Award,
      gradient: 'from-teal-500 to-cyan-500',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      border: 'border-teal-200 dark:border-teal-700',
      text: 'text-teal-600 dark:text-teal-300',
    },
    {
      label: 'Taxa de conclusão',
      value: `${taxaConclusao.toFixed(0)}%`,
      icon: Percent,
      gradient: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-700',
      text: 'text-rose-600 dark:text-rose-300',
    },
  ];

  const topItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const rankColors = [
    'bg-amber-400 text-amber-900',
    'bg-slate-300 text-slate-800',
    'bg-orange-400 text-orange-900',
    'bg-blue-200 text-blue-800',
    'bg-violet-200 text-violet-800',
  ];

  return (
    <div className="space-y-6">
      {/* Metrics grid — 3 col on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className={`rounded-card border shadow-soft p-4 flex items-center gap-4 ${m.bg} ${m.border}`}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-md`}>
              <m.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
              <p className={`text-xl font-bold ${m.text}`}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-background rounded-card border border-border shadow-soft p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <h3 className="text-sm font-bold text-foreground">Pedidos por dia — últimos 7 dias</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="hsl(220,9%,60%)" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,9%,60%)" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 12 }}
              />
              <Bar dataKey="pedidos" radius={[6, 6, 0, 0]} name="Pedidos">
                {barData.map((_, i) => (
                  <Cell key={i} fill={BAR_GRADIENT_COLORS[i % BAR_GRADIENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-background rounded-card border border-border shadow-soft p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Distribuição por categoria</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={40}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
              Sem dados suficientes
            </div>
          )}
        </div>

        {/* Line chart — receita */}
        <div className="bg-background rounded-card border border-border shadow-soft p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <h3 className="text-sm font-bold text-foreground">Receita diária — últimos 7 dias</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="hsl(220,9%,60%)" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,9%,60%)" axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`R$ ${v.toFixed(2).replace('.', ',')}`, 'Receita']}
                contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="receita"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Receita"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top items */}
      <div className="bg-background rounded-card border border-border shadow-soft p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <h3 className="text-sm font-bold text-foreground">Top 5 itens mais pedidos</h3>
        </div>
        {topItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum dado disponível</p>
        ) : (
          <div className="space-y-2">
            {topItems.map(([name, count], i) => {
              const pct = Math.round((count / (topItems[0][1] || 1)) * 100);
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankColors[i] || 'bg-muted text-muted-foreground'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate">{name}</span>
                      <span className="text-sm font-bold text-foreground ml-2 shrink-0">{count}x</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
