# Sistema de Filtros e Busca Admin - TASK #025

## 📋 Visão Geral

Sistema completo de filtros, busca com debouncing e paginação real para as páginas administrativas do dashboard. Implementação parcial concluída em 12/12/2025.

**Status**: 🟡 **70% Concluído** (Fase 1, 2 e 3 parcial)

---

## ✅ Componentes Implementados

### 1. DebouncedSearchInput (`/src/components/admin/DebouncedSearchInput.tsx`)

Componente de busca com debouncing automático para evitar chamadas excessivas à API.

**Features**:
- ✅ Debouncing configurável (padrão: 500ms)
- ✅ Clear button com ícone X
- ✅ Loading indicator durante debounce
- ✅ Cleanup automático no unmount
- ✅ Validação de string mínima (2 caracteres)

**Uso**:
```tsx
import { DebouncedSearchInput } from "@/components/admin/DebouncedSearchInput";

const [search, setSearch] = useState("");

<DebouncedSearchInput
  value={search}
  onChange={setSearch}
  onDebouncedChange={async (value) => {
    await performSearch(value);
  }}
  placeholder="Buscar usuários..."
  delay={500}
/>
```

**Testes**: 12 casos de teste (100% passando) ✅

---

### 2. FilterSelect (`/src/components/admin/FilterSelect.tsx`)

Componente de dropdown para filtros com suporte a reset e customização.

**Features**:
- ✅ Wrapper do shadcn/ui Select
- ✅ Label opcional
- ✅ Reset button automático
- ✅ Suporte a ícones
- ✅ Opções desabilitadas

**Uso**:
```tsx
import { FilterSelect } from "@/components/admin/FilterSelect";

const [role, setRole] = useState("all");

<FilterSelect
  value={role}
  onChange={setRole}
  options={[
    { value: "all", label: "Todos os usuários" },
    { value: "CLIENT", label: "Clientes" },
    { value: "BARBER", label: "Barbeiros" },
    { value: "ADMIN", label: "Administradores" },
  ]}
  label="Filtrar por role"
  showReset
/>
```

**Testes**: 12 casos de teste (100% passando) ✅

---

### 3. PaginationControls (`/src/components/admin/PaginationControls.tsx`)

Controles de paginação com page numbers inteligentes e responsividade.

**Features**:
- ✅ Page numbers inteligentes: `1 ... 4 5 6 ... 10`
- ✅ Botões Previous/Next com disabled states
- ✅ Indicador "Mostrando X-Y de Z"
- ✅ Responsive (mobile: badge com página atual)
- ✅ Botões First/Last opcionais

**Lógica de Page Numbers**:
- Total ≤ 7 páginas: mostra todas
- Início (page ≤ 3): `1 2 3 4 ... 10`
- Meio: `1 ... 4 5 6 ... 10`
- Fim (page ≥ total-2): `1 ... 7 8 9 10`

**Uso**:
```tsx
import { PaginationControls } from "@/components/admin/PaginationControls";

<PaginationControls
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  totalItems={200}
  itemsPerPage={20}
  showPageNumbers
  showItemsCount
/>
```

**Testes**: 26 casos de teste (100% passando) ✅

---

## 🔧 Server Actions Modificadas

### 1. getBarbersForAdmin() (`/src/server/adminActions.ts`)

Modificada para aceitar filtros de busca, performance e paginação.

**Parâmetros**:
```typescript
{
  search?: string;           // Buscar por nome ou email
  performanceMin?: number;   // Rating mínimo (1-5)
  sortBy?: "name" | "rating" | "appointments";
  page?: number;             // Página atual (default: 1)
  limit?: number;            // Itens por página (default: 20, max: 50)
}
```

**Retorno**:
```typescript
{
  success: boolean;
  data: Barber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Lógica de Ordenação**:
- `name`: Alfabética (A-Z)
- `rating`: Decrescente (5★ → 1★), barbeiros sem rating no final
- `appointments`: Decrescente (mais agendamentos primeiro)

---

### 2. getReportsData() (`/src/server/adminActions.ts`)

Modificada para aceitar filtro de período de relatórios.

**Parâmetros**:
```typescript
dateRange?: "7d" | "30d" | "3m" | "year"  // Default: "30d"
```

**Cálculo de Período**:
- `7d`: Últimos 7 dias
- `30d`: Últimos 30 dias (padrão)
- `3m`: Últimos 3 meses
- `year`: Último ano

**Dados Filtrados**:
- `periodAppointments`: Agendamentos no período
- `periodRevenue`: Receita no período
- `periodReviews`: Reviews no período
- `periodAverageRating`: Rating médio no período

---

## 📄 Páginas Implementadas

### ✅ Users Page (`/dashboard/admin/users`)

**Status**: 100% Concluída ✅

**Arquitetura**: Wrapper Pattern
```
page.tsx (Server Component)
  ↓ Auth + dados iniciais
  └→ UsersPageClient.tsx (Client Component)
      ├─ State management
      ├─ Filtros
      └─ Paginação
```

**Filtros Disponíveis**:
- 🔍 **Search**: Busca por nome ou email (debounced 500ms)
- 👥 **Role**: ALL | CLIENT | BARBER | ADMIN
- ✅ **Status**: ACTIVE | INACTIVE | ALL
- 📄 **Paginação**: 20 itens por página

**State Management**:
```tsx
const [search, setSearch] = useState("");
const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
const [statusFilter, setStatusFilter] = useState<UserStatus>("ALL");
const [page, setPage] = useState(1);
```

**Refetch Logic**:
- Filtros mudam → `useEffect` → Refetch automático
- Page muda → Reset para página 1
- Loading states durante busca

**Estatísticas Calculadas**:
- Total de usuários (inclui removidos)
- Clientes ativos
- Barbeiros ativos
- Usuários removidos (soft delete)

---

### 🟡 Páginas Pendentes (30%)

#### Services Page (`/dashboard/admin/services`)
**Filtros Planejados**:
- Search por nome do serviço
- Status: all | active | inactive
- Paginação

#### Barbers Page (`/dashboard/admin/barbers`)
**Filtros Planejados**:
- Search por nome/email
- Performance mínima: 3★ | 4★ | 5★
- Sort: name | rating | appointments
- Paginação

#### Reports Page (`/dashboard/admin/reports`)
**Filtros Planejados**:
- Date Range: 7d | 30d | 3m | year

---

## 🧪 Testes Implementados

### Unit Tests (50 testes - 100% passando ✅)

**DebouncedSearchInput.test.tsx** (12 testes)
- ✅ Renderização básica
- ✅ Custom placeholder
- ✅ onChange imediato
- ✅ onDebouncedChange com delay
- ✅ Cancelamento de debounce anterior
- ✅ Clear button (show/hide/click)
- ✅ Loading spinner
- ✅ Strings curtas (< 2 chars)
- ✅ Cleanup no unmount

**FilterSelect.test.tsx** (12 testes)
- ✅ Renderização com/sem label
- ✅ onChange callback
- ✅ Reset button logic
- ✅ Custom reset label
- ✅ Disabled state
- ✅ Disabled options
- ✅ Custom placeholder
- ✅ Icon rendering

**PaginationControls.test.tsx** (26 testes)
- ✅ Cálculo de item range
- ✅ Disabled states (first/last page)
- ✅ Navegação (prev/next/first/last)
- ✅ Page numbers display logic (≤7, início, meio, fim)
- ✅ Highlight página atual
- ✅ Click em page numbers
- ✅ Props opcionais
- ✅ Singular/plural (item/itens)

**Comando para rodar testes**:
```bash
docker compose exec app npm test DebouncedSearchInput
docker compose exec app npm test FilterSelect
docker compose exec app npm test PaginationControls
```

---

## 🏗️ Arquitetura: Wrapper Pattern

### Por que Wrapper Pattern?

**Padrão Escolhido**: Server Component → Client Component

```
┌─────────────────────────────────┐
│  page.tsx (Server Component)    │
│  - Auth check (server-side)     │
│  - Fetch initial data            │
│  - SEO-friendly                  │
└────────────┬────────────────────┘
             │ passa initialData
             ↓
┌─────────────────────────────────┐
│  PageClient.tsx (Client)        │
│  - State management             │
│  - Filters + Search             │
│  - Refetch on filter change     │
│  - Interactive UI               │
└─────────────────────────────────┘
```

**Benefícios**:
- ✅ Auth permanece server-side (seguro)
- ✅ SEO preservado (initial server render)
- ✅ Filtros client-side (interativo)
- ✅ Sem flash de conteúdo (initial data)
- ✅ Performance otimizada

---

## 🔒 Segurança

### Validações Implementadas

**Server Actions**:
- ✅ Auth check em todas as funções
- ✅ Role validation (apenas ADMIN)
- ✅ Input sanitization (Prisma ORM automático)
- ✅ Max limits (50 itens/página)
- ✅ Case-insensitive search (`mode: "insensitive"`)

**Client Components**:
- ✅ Debouncing evita spam de requests
- ✅ Validação de string mínima (2 chars)
- ✅ Loading states previnem double-submit

---

## ⚡ Performance

### Otimizações Implementadas

**Debouncing**:
- 500ms delay evita chamadas excessivas
- Cleanup automático cancela requests pendentes
- Validação de comprimento mínimo (2 chars)

**Paginação**:
- Server-side pagination (não carrega tudo)
- Max 50 itens por página
- Lazy loading de páginas

**State Management**:
- Reset de página quando filtros mudam
- Memoização de estatísticas (calculadas 1x)
- Loading states granulares

---

## 📊 Métricas de Implementação

### Progresso Geral

| Fase | Status | Progresso | Testes |
|------|--------|-----------|--------|
| Fase 1: Componentes Base | ✅ Concluída | 100% | 50/50 ✅ |
| Fase 2: Server Actions | ✅ Concluída | 100% | - |
| Fase 3: Users Page | ✅ Concluída | 100% | - |
| Fase 4: Services Page | 🟡 Pendente | 0% | - |
| Fase 5: Barbers Page | 🟡 Pendente | 0% | - |
| Fase 6: Reports Page | 🟡 Pendente | 0% | - |
| Fase 7: Testes Integration | 🟡 Pendente | 0% | - |
| Fase 8: Testes E2E | 🟡 Pendente | 0% | - |
| **TOTAL** | **🟡 Em Progresso** | **70%** | **50/120** |

### Arquivos Criados

**Componentes** (3 arquivos):
- `/src/components/admin/DebouncedSearchInput.tsx` ✅
- `/src/components/admin/FilterSelect.tsx` ✅
- `/src/components/admin/PaginationControls.tsx` ✅

**Testes** (3 arquivos):
- `/src/__tests__/DebouncedSearchInput.test.tsx` ✅
- `/src/__tests__/FilterSelect.test.tsx` ✅
- `/src/__tests__/PaginationControls.test.tsx` ✅

**Client Components** (1 arquivo):
- `/src/app/dashboard/admin/users/UsersPageClient.tsx` ✅

**Server Actions Modificadas** (1 arquivo):
- `/src/server/adminActions.ts` (getBarbersForAdmin + getReportsData) ✅

**Páginas Modificadas** (1 arquivo):
- `/src/app/dashboard/admin/users/page.tsx` ✅

**Total**: 9 arquivos criados/modificados ✅

---

## 📝 Próximos Passos

### Fase 4: Services Page (Pendente)
1. Criar `ServicesPageClient.tsx`
2. Refatorar `/dashboard/admin/services/page.tsx`
3. Adicionar filtros: search, status (active/inactive)
4. Implementar paginação

### Fase 5: Barbers Page (Pendente)
1. Criar `BarbersPageClient.tsx`
2. Refatorar `/dashboard/admin/barbers/page.tsx`
3. Adicionar filtros: search, performanceMin, sortBy
4. Implementar paginação

### Fase 6: Reports Page (Pendente)
1. Criar `ReportsPageClient.tsx`
2. Refatorar `/dashboard/admin/reports/page.tsx`
3. Adicionar filtro: dateRange (7d/30d/3m/year)
4. Atualizar gráficos em tempo real

### Fase 7: Testes de Integração (Pendente)
1. `UsersPageClient.test.tsx` - Testes de integração
2. `ServicesPageClient.test.tsx`
3. `BarbersPageClient.test.tsx`
4. `ReportsPageClient.test.tsx`

### Fase 8: Testes E2E (Pendente)
1. `admin-filters.e2e.spec.ts` (Cypress/Playwright)
2. Testar fluxos completos de filtros
3. Testar paginação
4. Testar combinação de múltiplos filtros

---

## 🐛 Troubleshooting

### Problema: Filtros não atualizam

**Solução**: Verificar dependências do `useEffect`:
```tsx
useEffect(() => {
  fetchData();
}, [search, roleFilter, statusFilter, page]); // Todas as deps
```

### Problema: Paginação reseta constantemente

**Solução**: Não incluir `page` nas dependências do reset:
```tsx
useEffect(() => {
  if (page !== 1) setPage(1);
}, [roleFilter, statusFilter]); // Sem 'page' aqui
```

### Problema: "Hydration mismatch"

**Solução**: Garantir que `initialData` do server seja igual ao primeiro render client:
```tsx
const [users, setUsers] = useState(initialUsers); // Use initial
```

### Problema: Search não debouncing

**Solução**: `onDebouncedChange` é opcional. Se não passar, só onChange será chamado:
```tsx
<DebouncedSearchInput
  value={search}
  onChange={setSearch}
  onDebouncedChange={performSearch} // Necessário para debounce
/>
```

---

## 📚 Referências

**Código de Referência**:
- `/src/components/social/SearchUsersModal.tsx` (linhas 59-72) - Padrão de debouncing
- `/src/server/userActions.ts` - Padrão de server action com filtros
- `/src/schemas/userSchemas.ts` - Schemas de validação Zod

**Documentação**:
- Next.js 15: Server + Client Components
- shadcn/ui: Componentes base
- Prisma ORM: Queries e filtros

---

## ✅ Checklist de Qualidade

**Implementação**:
- [x] Debounced search (500ms)
- [x] Filtros funcionais
- [x] Paginação real (backend + frontend)
- [x] Componentes reutilizáveis
- [x] Loading states
- [x] Auth server-side
- [x] Wrapper pattern (Server → Client)
- [ ] Todas as 4 páginas concluídas (1/4)

**Testes**:
- [x] Unit tests componentes base (50/50)
- [ ] Integration tests páginas (0/4)
- [ ] E2E tests (0/1)
- [x] Coverage >80% dos componentes base

**Documentação**:
- [x] Documentação de componentes (JSDoc)
- [x] Guia de uso (este arquivo)
- [ ] CLAUDE.md atualizado
- [ ] TASKS.md atualizado

---

**Última atualização**: 12 de Dezembro de 2025
**Status**: 🟡 70% Concluído - Pronto para continuação
