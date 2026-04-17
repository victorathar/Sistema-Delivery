# Vipper Food — Sistema de Delivery

Plataforma completa de gestão de delivery para restaurantes, integrada a um agente de atendimento autônomo via WhatsApp. O sistema permite que o dono do restaurante gerencie toda a operação — pedidos, cardápio, entrega e relatórios — em um único painel administrativo, enquanto o agente de IA atende os clientes automaticamente no WhatsApp.

---

## Funcionalidades

### Pedidos Ativos
- Visualização em tempo real de todos os pedidos em andamento
- Cards com nome do cliente, endereço, itens, valor total e status
- Atualização manual de status com notificação automática ao cliente
- Status: `Pendente` → `Em Preparação` → `Em Processo de Entrega` → `Finalizado`

### Cardápio
- Cadastro completo de pratos e produtos
- Campos: nome, descrição, preço, categoria, foto e disponibilidade
- CRUD completo com sincronização automática ao agente de IA

### Entrega
- Configuração de regras de frete
- Modalidades: frete fixo, frete por bairro ou frete por distância (km)
- Definição de valor mínimo de pedido e raio de entrega

### Configuração do Agente
- Personalização do tom de comunicação (formal, informal, descontraído)
- Mensagem de boas-vindas e mensagem de promoção
- Horário de funcionamento
- Nome do restaurante utilizado pelo agente

### Histórico de Pedidos
- Registro completo de todos os pedidos finalizados
- Filtros por data, cliente e valor
- Visualização detalhada de cada pedido

### Relatórios
- Pratos mais e menos pedidos por semana/mês
- Ticket médio e receita total por período
- Mapa de calor por localização de entrega

---

## 🛠️ Stack Técnica

### Frontend
| Tecnologia | Versão | Função |
|------------|--------|--------|
| React | 18.3+ | Biblioteca UI principal |
| TypeScript | 5.8+ | Tipagem estática |
| Vite | 5.4+ | Bundler e dev server |
| Tailwind CSS | 3.4+ | Estilização utility-first |
| Zustand | 5.0+ | Estado global |
| React Router | 6.30+ | Roteamento SPA |
| Recharts | 2.15+ | Gráficos e dashboards |
| Lucide React | 0.462+ | Biblioteca de ícones |
| date-fns | 3.6+ | Manipulação de datas |
| Sonner | 1.7+ | Notificações toast |

### Backend
| Tecnologia | Função |
|------------|--------|
| NestJS + TypeScript | API REST e lógica de negócio |
| Supabase JS Client | Conexão com banco PostgreSQL |
| Supabase Realtime | Websockets para pedidos ao vivo |

### Agente de IA
| Tecnologia | Função |
|------------|--------|
| N8N | Automações e orquestração de fluxos |
| Evolution API | Integração com WhatsApp |
| Typebot | Interface conversacional do agente |

---

## 🎨 Identidade Visual

| Atributo | Valor |
|----------|-------|
| Cores | Branco `#FFFFFF` e Roxo `#6B21A8` |
| Tema | Minimalista Moderno |

---

## Configuração do Ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Variáveis necessárias:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_N8N_WEBHOOK_STATUS=
VITE_WEBHOOK_PREPARANDO=
VITE_WEBHOOK_ENTREGA=
VITE_WEBHOOK_FINALIZADO=
```

---

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

---

## Status do Projeto

🟡 Em desenvolvimento ativo
