import { Info } from 'lucide-react';

// ─── Dados de exemplo por plataforma ─────────────────────────────
const PLATAFORMAS = [
  {
    id: 'ifood',
    nome: 'iFood',
    descricao: 'Maior plataforma de delivery do Brasil',
    headerBg: 'bg-[#EA1D2C]',
    headerText: 'text-white',
    accentBg: 'bg-red-50 dark:bg-red-950/20',
    accentBorder: 'border-red-200 dark:border-red-900',
    badgeBg: 'bg-[#EA1D2C] text-white',
    tagBg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <rect width="40" height="40" rx="8" fill="#EA1D2C" />
        <path d="M10 20c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10S10 25.52 10 20z" fill="white" opacity="0.9"/>
        <path d="M17 16h6v8h-6z" fill="#EA1D2C"/>
        <path d="M16 20h8" stroke="#EA1D2C" strokeWidth="2"/>
      </svg>
    ),
    itens: [
      { nome: 'X-Burguer Especial', preco: 28.90, desc: 'Hambúrguer artesanal 180g, queijo cheddar, bacon crocante, alface e tomate', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80', categoria: 'Hambúrgueres', avaliacao: 4.8 },
      { nome: 'Pizza Margherita', preco: 45.00, desc: 'Massa artesanal, molho de tomate, mussarela de búfala e manjericão fresco', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80', categoria: 'Pizzas', avaliacao: 4.9 },
      { nome: 'Combo Família', preco: 89.90, desc: '2 hambúrgueres + 2 batatas fritas grandes + 2 refrigerantes 600ml', img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&q=80', categoria: 'Combos', avaliacao: 4.7 },
      { nome: 'Açaí 500ml', preco: 22.00, desc: 'Açaí cremoso com granola, banana, leite condensado e mel', img: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&q=80', categoria: 'Sobremesas', avaliacao: 4.6 },
      { nome: 'Refrigerante 2L', preco: 12.00, desc: 'Coca-Cola, Guaraná Antarctica ou Fanta laranja — gelado', img: 'https://images.unsplash.com/photo-1554236064-bef6e67e4e4e?w=300&q=80', categoria: 'Bebidas', avaliacao: 4.5 },
    ],
  },
  {
    id: '99food',
    nome: '99Food',
    descricao: 'Delivery integrado ao app 99 — passageiros e pedidos',
    headerBg: 'bg-[#1A1A1A]',
    headerText: 'text-white',
    accentBg: 'bg-yellow-50 dark:bg-yellow-950/20',
    accentBorder: 'border-yellow-200 dark:border-yellow-900',
    badgeBg: 'bg-[#FFDB0A] text-black',
    tagBg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <rect width="40" height="40" rx="8" fill="#1A1A1A"/>
        <text x="8" y="26" fontSize="16" fontWeight="bold" fill="#FFDB0A">99</text>
      </svg>
    ),
    itens: [
      { nome: 'Double Smash Burguer', preco: 34.90, desc: 'Dois smash patties, queijo americano, cebola caramelizada e molho especial da casa', img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=300&q=80', categoria: 'Hambúrgueres', avaliacao: 4.7 },
      { nome: 'Pizza Quatro Queijos', preco: 52.00, desc: 'Mussarela, provolone, gorgonzola e parmesão em massa fina e crocante', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80', categoria: 'Pizzas', avaliacao: 4.8 },
      { nome: 'Batata Frita Grande', preco: 18.90, desc: 'Batata frita crocante temperada com ervas e servida com molho cheddar', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80', categoria: 'Acompanhamentos', avaliacao: 4.6 },
      { nome: 'Milkshake 400ml', preco: 19.90, desc: 'Milkshake cremoso nos sabores chocolate, morango ou baunilha com chantilly', img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80', categoria: 'Bebidas', avaliacao: 4.9 },
      { nome: 'Combo Casal', preco: 64.90, desc: '2 hambúrgueres à escolha + 1 batata grande + 2 milkshakes pequenos', img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&q=80', categoria: 'Combos', avaliacao: 4.7 },
    ],
  },
  {
    id: 'keeta',
    nome: 'Keeta',
    descricao: 'Plataforma de delivery do grupo ByteDance',
    headerBg: 'bg-gradient-to-r from-[#FF5A00] to-[#FF8C00]',
    headerText: 'text-white',
    accentBg: 'bg-orange-50 dark:bg-orange-950/20',
    accentBorder: 'border-orange-200 dark:border-orange-900',
    badgeBg: 'bg-[#FF5A00] text-white',
    tagBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <rect width="40" height="40" rx="8" fill="#FF5A00"/>
        <path d="M12 12h6l-2 8h8l2-8h6l-4 16H14L12 12z" fill="white" opacity="0.95"/>
      </svg>
    ),
    itens: [
      { nome: 'Frango Grelhado Fit', preco: 32.90, desc: 'Peito de frango grelhado com legumes salteados, arroz integral e salada verde', img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&q=80', categoria: 'Pratos', avaliacao: 4.6 },
      { nome: 'Pizza Pepperoni Premium', preco: 55.00, desc: 'Generosa cobertura de pepperoni importado com queijo mussarela e orégano', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&q=80', categoria: 'Pizzas', avaliacao: 4.8 },
      { nome: 'Burguer Black', preco: 38.90, desc: 'Pão preto, blend angus 200g, queijo brie, rúcula e geleia de pimenta', img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300&q=80', categoria: 'Hambúrgueres', avaliacao: 4.9 },
      { nome: 'Petit Gateau', preco: 24.90, desc: 'Bolinho de chocolate quente com sorvete de baunilha e calda de frutas vermelhas', img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80', categoria: 'Sobremesas', avaliacao: 4.9 },
      { nome: 'Suco Natural 500ml', preco: 14.90, desc: 'Suco natural feito na hora: laranja, limão, maracujá, abacaxi com hortelã', img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&q=80', categoria: 'Bebidas', avaliacao: 4.7 },
    ],
  },
  {
    id: 'whatsapp',
    nome: 'WhatsApp Direto',
    descricao: 'Pedidos recebidos diretamente via WhatsApp / Bot',
    headerBg: 'bg-[#25D366]',
    headerText: 'text-white',
    accentBg: 'bg-green-50 dark:bg-green-950/20',
    accentBorder: 'border-green-200 dark:border-green-900',
    badgeBg: 'bg-[#25D366] text-white',
    tagBg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <rect width="40" height="40" rx="8" fill="#25D366"/>
        <path d="M20 8C13.37 8 8 13.37 8 20c0 2.13.54 4.12 1.49 5.86L8 32l6.28-1.46A11.93 11.93 0 0020 32c6.63 0 12-5.37 12-12S26.63 8 20 8zm5.98 16.42c-.25.7-1.47 1.34-2.02 1.42-.55.08-1.26.12-2.04-.13a19.13 19.13 0 01-1.84-.68c-3.24-1.4-5.35-4.68-5.51-4.9-.16-.21-1.3-1.73-1.3-3.3 0-1.57.82-2.35 1.12-2.67.29-.32.64-.4.85-.4l.6.01c.19 0 .46-.07.72.55.26.63.89 2.2.97 2.36.08.16.13.35.03.56-.1.21-.15.34-.3.52l-.44.5c-.15.16-.3.34-.13.66.17.32.76 1.26 1.63 2.04 1.12 1 2.06 1.3 2.38 1.46.32.16.5.13.69-.08.19-.21.82-.96 1.04-1.28.22-.32.43-.27.73-.16.3.11 1.87.88 2.19 1.04.32.16.53.24.61.37.08.13.08.76-.17 1.45z" fill="white"/>
      </svg>
    ),
    itens: [
      { nome: 'X-Burguer Especial', preco: 28.90, desc: 'Hambúrguer artesanal 180g com todos os acompanhamentos — peça via chat!', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80', categoria: 'Hambúrgueres', avaliacao: 5.0 },
      { nome: 'Pizza Margherita', preco: 45.00, desc: 'Pizza artesanal direto do forno — entrega rápida para o seu bairro', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80', categoria: 'Pizzas', avaliacao: 5.0 },
      { nome: 'Combo Família', preco: 89.90, desc: 'Combo completo para a família inteira — peça agora e ganhe 10% off', img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&q=80', categoria: 'Combos', avaliacao: 5.0 },
      { nome: 'Batata Frita Grande', preco: 18.90, desc: 'Batata crocante + molho da casa — peça junto com seu hambúrguer!', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80', categoria: 'Acompanhamentos', avaliacao: 5.0 },
      { nome: 'Refrigerante 2L', preco: 12.00, desc: 'Gelado e direto na sua porta — Coca, Guaraná ou Fanta', img: 'https://images.unsplash.com/photo-1554236064-bef6e67e4e4e?w=300&q=80', categoria: 'Bebidas', avaliacao: 5.0 },
    ],
  },
];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3 h-3 ${value >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-muted-foreground ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

export default function Delivery() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Delivery — Visão por Plataforma</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Como seus itens aparecem em cada plataforma de delivery.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-card px-3 py-2 sm:shrink-0">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Dados ilustrativos — apenas para exemplificação</span>
        </div>
      </div>

      {/* Plataformas */}
      {PLATAFORMAS.map((plataforma) => (
        <div key={plataforma.id} className={`rounded-card border ${plataforma.accentBorder} overflow-hidden`}>
          {/* Header da plataforma */}
          <div className={`${plataforma.headerBg} px-4 sm:px-6 py-4`}>
            <div className="flex items-center gap-3">
              <div className="shrink-0">{plataforma.logo}</div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-base font-bold ${plataforma.headerText}`}>{plataforma.nome}</h2>
                <p className={`text-xs ${plataforma.headerText} opacity-80 truncate`}>{plataforma.descricao}</p>
              </div>
              <span className={`shrink-0 text-xs px-3 py-1 rounded-full font-bold ${plataforma.badgeBg}`}>
                {plataforma.itens.length} itens
              </span>
            </div>
          </div>

          {/* Grid de itens */}
          <div className={`${plataforma.accentBg} p-4`}>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {plataforma.itens.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-background rounded-card border border-border shadow-soft overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  {/* Imagem */}
                  <div className="relative h-28 sm:h-36 overflow-hidden bg-muted">
                    <img
                      src={item.img}
                      alt={item.nome}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/300x144/f3f4f6/9ca3af?text=${encodeURIComponent(item.nome)}`;
                      }}
                    />
                    <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold ${plataforma.tagBg}`}>
                      {item.categoria}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <h3 className="text-sm font-bold text-foreground leading-tight">{item.nome}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1 hidden sm:block">{item.desc}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base font-bold text-green-600 dark:text-green-400">
                        R$ {item.preco.toFixed(2).replace('.', ',')}
                      </span>
                      <StarRating value={item.avaliacao} />
                    </div>
                    <button
                      disabled
                      className={`w-full mt-1 py-1.5 rounded-input text-xs font-bold ${plataforma.badgeBg} opacity-70 cursor-not-allowed`}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Nota de rodapé */}
      <div className="text-center py-4 text-xs text-muted-foreground">
        Esta aba é apenas ilustrativa. A integração real com as plataformas é feita diretamente nos portais de cada serviço.
      </div>
    </div>
  );
}
