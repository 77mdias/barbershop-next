# 🧪 Infraestrutura de Testes - Barbershop Next

Documentação completa da infraestrutura de testes automatizados do projeto.

---

## 📋 Visão Geral

**Status**: ✅ Configurado e Funcional  
**Framework**: Jest + Testing Library  
**Implementação**: Outubro 2025

O projeto utiliza Jest como framework de testes e React Testing Library para testes de componentes React, garantindo qualidade e confiabilidade do código.

---

## 🛠️ Stack de Testes

### Ferramentas Principais
- **Jest** (v29+) - Framework de testes JavaScript
- **@testing-library/react** - Testes de componentes React
- **@testing-library/jest-dom** - Matchers customizados para DOM
- **@testing-library/user-event** - Simulação de eventos do usuário
- **ts-jest** - Suporte TypeScript para Jest

### Configuração
- **jest.config.js** - Configuração principal do Jest
- **src/tests/setup.ts** - Setup global dos testes
- **tsconfig.json** - Configuração TypeScript para testes

---

## 📁 Estrutura de Testes

```
src/
├── __tests__/                 # Testes de componentes
│   ├── ReviewForm.test.tsx    # Testes do formulário de reviews
│   ├── LoadingSpinner.test.tsx # Testes do spinner
│   └── Skeleton.test.tsx      # Testes dos skeletons
├── tests/
│   └── setup.ts              # Configuração global
└── components/
    └── [component].tsx       # Componentes testados
```

---

## ⚙️ Configuração

### jest.config.js

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### src/tests/setup.ts

```typescript
import '@testing-library/jest-dom';

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}));

// Configurações globais
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
```

---

## 🧪 Testes Implementados

### 1. ReviewForm.test.tsx

**Objetivo**: Testar o formulário de criação/edição de avaliações

**Cobertura**:
- ✅ Renderização do componente
- ✅ Validação de campos obrigatórios
- ✅ Sistema de rating (estrelas)
- ✅ Upload de imagens
- ✅ Submissão do formulário
- ✅ Estados de loading
- ✅ Mensagens de erro

**Exemplo**:
```typescript
describe('ReviewForm', () => {
  it('deve renderizar o formulário corretamente', () => {
    render(<ReviewForm serviceHistoryId="test-id" />);
    
    expect(screen.getByLabelText(/avaliação/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    render(<ReviewForm serviceHistoryId="test-id" />);
    
    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await userEvent.click(submitButton);
    
    expect(await screen.findByText(/rating é obrigatório/i)).toBeInTheDocument();
  });
});
```

### 2. LoadingSpinner.test.tsx

**Objetivo**: Testar o componente de loading spinner

**Cobertura**:
- ✅ Renderização básica
- ✅ Diferentes tamanhos (sm, md, lg)
- ✅ Texto customizado
- ✅ Classes CSS aplicadas

**Exemplo**:
```typescript
describe('LoadingSpinner', () => {
  it('deve renderizar com tamanho padrão', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('deve renderizar texto quando fornecido', () => {
    render(<LoadingSpinner text="Carregando dados..." />);
    expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
  });
});
```

### 3. Skeleton.test.tsx

**Objetivo**: Testar componentes skeleton

**Cobertura**:
- ✅ Renderização do skeleton
- ✅ Classes CSS customizadas
- ✅ ReviewSkeleton
- ✅ ReviewsListSkeleton

**Exemplo**:
```typescript
describe('Skeleton', () => {
  it('deve renderizar skeleton básico', () => {
    render(<Skeleton />);
    const skeleton = screen.getByRole('status', { hidden: true });
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('deve renderizar ReviewSkeleton com estrutura correta', () => {
    render(<ReviewSkeleton />);
    expect(screen.getAllByRole('status', { hidden: true })).toHaveLength(8);
  });
});
```

### 4. ReviewsList.test.tsx ⭐ NOVO

**Objetivo**: Testar o componente de lista de avaliações com funcionalidades completas

**Cobertura** (28 testes):
- ✅ Renderização de estados (loading, empty, populated)
- ✅ Card de estatísticas (stats card)
- ✅ Interações do usuário (editar, excluir com confirmação)
- ✅ Expansão/colapso de imagens
- ✅ Paginação (next/prev, disabled states)
- ✅ Variações de props (userId, serviceId, barberId filters)
- ✅ Tratamento de erros (API failures, network errors)
- ✅ Botões de ação baseados em role

### 5. reviewActions.test.ts ⭐ NOVO

**Objetivo**: Testar todas as server actions de reviews

**Cobertura** (40 testes):
- ✅ **createReview**: Sucesso, validação, duplicação, autorização
- ✅ **updateReview**: Atualizações parciais, ownership validation
- ✅ **getReviews**: Filtragem por role (CLIENT/BARBER/ADMIN), paginação
- ✅ **deleteReview**: Soft delete, override do ADMIN
- ✅ **getReviewStats**: Agregações, distribuição de ratings
- ✅ **getBarberMetrics**: Cálculos complexos de métricas
- ✅ **getPublicReviews**: Acesso anônimo

**Padrão de teste**:
```typescript
describe("createReview", () => {
  test("deve criar avaliação com sucesso", async () => {
    mockDb.serviceHistory.update.mockResolvedValue(mockData);

    const result = await createReview(validInput);

    expect(result.success).toBe(true);
    expect(mockRevalidatePath).toHaveBeenCalled();
  });
});
```

### 6. dashboardActions.test.ts ⭐ NOVO

**Objetivo**: Testar server actions de dashboard

**Cobertura** (19 testes):
- ✅ **getBarberMetrics**: Autorização, cálculos, métricas mensais
- ✅ **getDashboardMetrics**: Roteamento por role (CLIENT/BARBER/ADMIN)
- ✅ **getAdminMetrics**: Métricas globais, contadores, top performers
- ✅ Tratamento de valores nulos e zeros
- ✅ Edge cases (missing data, empty results)

### 7. BarberDashboard.test.tsx ⭐ NOVO

**Objetivo**: Testar página de dashboard do barbeiro (Server Component)

**Cobertura** (18 testes):
- ✅ **Autenticação**: Redirecionamentos baseados em role
- ✅ **Métricas**: Cards de avaliação, clientes, receita
- ✅ **Goals**: Progresso de metas, percentagens
- ✅ **Distribuição**: Rating distribution visualization
- ✅ **Tabs**: Navegação entre seções (Reviews, Agendamentos, etc)
- ✅ **Edge cases**: Métricas null, zeradas, erros de API
- ✅ **Responsividade**: Grid responsivo

### 8. AdminDashboard.test.tsx ⭐ NOVO

**Objetivo**: Testar página de dashboard administrativo (Server Component)

**Cobertura** (18 testes):
- ✅ **Autenticação**: Acesso restrito a ADMIN
- ✅ **Métricas de usuários**: Total, por role, ativos
- ✅ **Métricas de reviews**: Global average, distribuição
- ✅ **Métricas de atividade**: Agendamentos, novos usuários
- ✅ **Financeiro**: Receita total e mensal
- ✅ **Top performers**: Lista de melhores barbeiros
- ✅ **Edge cases**: Dados vazios, listas vazias
- ✅ **Componentes interativos**: Buttons, tabs

### 9. NotificationBell.test.tsx ✅ EXISTENTE

**Cobertura** (11 testes):
- ✅ Renderização do sino de notificações
- ✅ Badge de contador de não lidas
- ✅ Dropdown de notificações
- ✅ Ações (marcar como lida, navegar)
- ✅ Auto-refresh a cada 30 segundos

### 10. ChatBell.test.tsx ✅ EXISTENTE

**Cobertura** (11 testes):
- ✅ Renderização do sino de chat
- ✅ Contador de mensagens não lidas
- ✅ Preview de conversas
- ✅ Navegação para chat
- ✅ Estados vazios

### 11. MessageBubble.test.tsx ✅ EXISTENTE

**Cobertura** (15 testes):
- ✅ Renderização de mensagens
- ✅ Diferenciação sent/received
- ✅ Timestamps e status de leitura
- ✅ Formatação de data/hora

---

## 📊 Estatísticas Gerais

### Status Atual (Outubro 2025)

| Métrica | Valor | Status |
|---------|-------|--------|
| **Test Suites** | 11 | ✅ 100% Passando |
| **Testes Totais** | 178 | ✅ 100% Passando |
| **Componentes Testados** | 11 | 🟢 Excelente |
| **Server Actions Testadas** | 2 arquivos | 🟢 Excelente |
| **Dashboards Testados** | 2 (Barber + Admin) | 🟢 Excelente |

### Distribuição de Testes

```
ReviewsList         ██████████████ 28 testes (16%)
reviewActions       ████████████████████ 40 testes (22%)
dashboardActions    ██████████ 19 testes (11%)
BarberDashboard     █████████ 18 testes (10%)
AdminDashboard      █████████ 18 testes (10%)
Testes Existentes   ███████████████ 55 testes (31%)
```

### Cobertura por Categoria

- **Componentes Client**: 76 testes (ReviewsList, NotificationBell, ChatBell, etc)
- **Server Components**: 36 testes (BarberDashboard, AdminDashboard)
- **Server Actions**: 59 testes (reviewActions, dashboardActions)
- **UI Components**: 7 testes (LoadingSpinner, Skeleton, MessageBubble)

---

## 🚀 Executando Testes

### Comandos Básicos

```bash
# Executar todos os testes
npm run test

# Modo watch (re-executa em mudanças)
npm run test:watch

# Com cobertura de código
npm run test:coverage

# Teste específico
npm run test -- ReviewForm.test.tsx

# Modo verbose (mais detalhes)
npm run test -- --verbose
```

### Docker

```bash
# Executar testes no container
docker compose exec app npm run test

# Com cobertura
docker compose exec app npm run test:coverage
```

---

## 📊 Cobertura de Código

### Status Atual (Out 2025)

| Categoria | Cobertura | Status |
|-----------|-----------|--------|
| Statements | ~25% | 🟡 Básico |
| Branches | ~20% | 🟡 Básico |
| Functions | ~30% | 🟡 Básico |
| Lines | ~25% | 🟡 Básico |

### Componentes Testados
- ✅ LoadingSpinner
- ✅ Skeleton
- ✅ ReviewForm (parcial)
- ⏳ ReviewsList (pendente)
- ⏳ ReviewSection (pendente)
- ⏳ Dashboard components (pendente)

### Metas de Cobertura
- **Curto prazo**: 50% (componentes críticos)
- **Médio prazo**: 70% (maioria dos componentes)
- **Longo prazo**: 80%+ (cobertura ampla)

---

## 🎯 Boas Práticas

### 1. Estrutura de Testes

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Preparação antes de cada teste
  });

  // Testes de renderização
  describe('rendering', () => {
    it('should render correctly', () => {
      // teste
    });
  });

  // Testes de interação
  describe('interactions', () => {
    it('should handle user actions', async () => {
      // teste
    });
  });

  // Cleanup
  afterEach(() => {
    // Limpeza após cada teste
  });
});
```

### 2. Queries Recomendadas

Ordem de preferência (conforme Testing Library):
1. **getByRole** - Acessibilidade
2. **getByLabelText** - Formulários
3. **getByPlaceholderText** - Inputs
4. **getByText** - Conteúdo textual
5. **getByTestId** - Último recurso

```typescript
// ✅ Bom
const button = screen.getByRole('button', { name: /enviar/i });

// ⚠️ Evitar
const button = screen.getByTestId('submit-button');
```

### 3. Testes Assíncronos

```typescript
// Esperar por elemento
const element = await screen.findByText('Success');

// Esperar por ação
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Simular evento assíncrono
await userEvent.click(button);
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```

### 4. Mocks

```typescript
// Mock de função
const mockOnSubmit = jest.fn();

// Mock de módulo
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.join(' '),
}));

// Mock de Server Action
jest.mock('@/server/reviewActions', () => ({
  createReview: jest.fn().mockResolvedValue({ success: true }),
}));
```

---

## 📝 Próximos Passos

### Testes a Implementar

#### Alta Prioridade
- [ ] **ReviewsList.test.tsx** - Lista de avaliações
- [ ] **Dashboard.test.tsx** - Dashboards
- [ ] **Server Actions** - reviewActions, dashboardActions

#### Média Prioridade
- [ ] **ImageUpload.test.tsx** - Upload de imagens
- [ ] **ReviewSection.test.tsx** - Seção de reviews
- [ ] **Navigation.test.tsx** - Componentes de navegação

#### Baixa Prioridade
- [ ] **Integration tests** - Fluxos completos
- [ ] **E2E tests** - Playwright
- [ ] **Performance tests** - Lighthouse CI

---

## 🔧 Troubleshooting

### Problemas Comuns

**Erro: Cannot find module '@/...'**
```bash
# Verificar configuração de paths no jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

**Erro: TextEncoder is not defined**
```javascript
// Adicionar no setup.ts
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

**Testes lentos**
```bash
# Executar em paralelo
npm run test -- --maxWorkers=4

# Executar apenas testes modificados
npm run test -- --onlyChanged
```

---

## 📚 Recursos e Referências

### Documentação Oficial
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)

### Guias Internos
- [Development Guide](/docs/development/README.md)
- [Features](/docs/FEATURES.md)

### Artigos Recomendados
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Última atualização**: 21 de outubro de 2025  
**Responsável**: Development Team  
**Status**: ✅ Configuração completa, expansão contínua
