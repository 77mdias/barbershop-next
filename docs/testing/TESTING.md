# 🧪 Guia de Testes - Barbershop Next

Documentação completa do sistema de testes automatizados do projeto.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Configuração](#configuração)
4. [Executando Testes](#executando-testes)
5. [Estrutura de Testes](#estrutura-de-testes)
6. [Componentes Testados](#componentes-testados)
7. [Escrevendo Novos Testes](#escrevendo-novos-testes)
8. [Boas Práticas](#boas-práticas)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O projeto implementa testes automatizados para garantir a qualidade e confiabilidade do código, focando em:

- ✅ Componentes críticos de UI
- ✅ Interações de usuário
- ✅ Estados de loading e erro
- ✅ Integração com Server Actions
- ✅ Acessibilidade e UX

### Estatísticas Atuais

- **55 testes implementados**
- **6 suites de teste**
- **~4% cobertura geral** (focado em componentes críticos)
- **100% dos testes passando**

---

## 🛠 Tecnologias

### Stack de Testes

- **Jest v30.2.0** - Test runner e framework
- **ts-jest v29.4.5** - Suporte TypeScript
- **@testing-library/react v16.3.0** - Testes de componentes React
- **@testing-library/jest-dom v6.9.1** - Matchers customizados
- **@testing-library/user-event v14.6.1** - Simulação de eventos de usuário
- **jest-environment-jsdom v30.2.0** - Ambiente DOM para testes

### Por que escolhemos estas ferramentas?

1. **Jest** - Padrão da indústria, rápido, com excelente DX
2. **Testing Library** - Foca em testar comportamento do usuário, não implementação
3. **ts-jest** - Integração perfeita com TypeScript
4. **jsdom** - Simula browser environment no Node.js

---

## ⚙️ Configuração

### Arquivos de Configuração

#### `jest.config.js`
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
}
```

#### `src/tests/setup.ts`

Arquivo de setup global que:
- Importa `@testing-library/jest-dom` para matchers
- Mocka Next.js router e navigation
- Mocka NextAuth (useSession, SessionProvider)
- Mocka server actions padrões
- Mocka toast notifications
- Mocka Next Image component
- Configura ResizeObserver e matchMedia

### Scripts NPM

```bash
npm run test              # Executa todos os testes
npm run test:watch        # Modo watch para desenvolvimento
npm run test:coverage     # Gera relatório de cobertura
npm run test:ci           # Testes para CI/CD (sem watch, com coverage)
```

---

## 🚀 Executando Testes

### Desenvolvimento Local (Ambiente Docker)

**IMPORTANTE**: Este é um projeto **Docker-first**. Use os comandos corretos:

```bash
# Executar todos os testes
docker compose exec app npm test

# Modo watch (desenvolvimento)
docker compose exec app npm run test:watch

# Relatório de cobertura
docker compose exec app npm run test:coverage

# Testes específicos
docker compose exec app npm test NotificationBell
docker compose exec app npm test ChatBell
docker compose exec app npm test ReviewForm
```

### Fora do Docker (se npm disponível localmente)

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Filtrar Testes

```bash
# Executar arquivo específico
npm test LoadingSpinner.test.tsx

# Executar por padrão
npm test -- --testPathPattern=components

# Executar testes que contenham string específica
npm test -- -t "renders with default props"
```

---

## 📁 Estrutura de Testes

### Organização de Arquivos

```
src/
├── __tests__/                    # Testes de componentes
│   ├── LoadingSpinner.test.tsx   # ✅ 5 testes
│   ├── Skeleton.test.tsx         # ✅ 3 testes
│   ├── ReviewForm.test.tsx       # ✅ 7 testes
│   ├── NotificationBell.test.tsx # ✅ 11 testes
│   ├── ChatBell.test.tsx         # ✅ 13 testes
│   └── MessageBubble.test.tsx    # ✅ 16 testes
├── tests/
│   └── setup.ts                  # Setup global de testes
└── components/                   # Componentes testados
    ├── ui/
    │   ├── loading-spinner.tsx
    │   └── skeleton.tsx
    ├── ReviewForm.tsx
    ├── NotificationBell.tsx
    ├── ChatBell.tsx
    └── chat/
        └── MessageBubble.tsx
```

### Convenções de Nomenclatura

- **Arquivos de teste**: `ComponentName.test.tsx`
- **Suites**: `describe("ComponentName", () => {})`
- **Testes**: `test("description of what it does", () => {})`
- **Mocks**: Prefixo `mock` (ex: `mockGetRecentNotifications`)

---

## 🧩 Componentes Testados

### 1. LoadingSpinner (5 testes)

**Localização**: `src/components/ui/loading-spinner.tsx`

Testa:
- Renderização do SVG spinner
- Texto customizado
- Classes CSS customizadas
- Diferentes tamanhos (sm, md, lg)
- Animação de spin

### 2. Skeleton (3 testes)

**Localização**: `src/components/ui/skeleton.tsx`

Testa:
- Classes padrão de loading
- Classes customizadas
- Props adicionais

### 3. ReviewForm (7 testes)

**Localização**: `src/components/ReviewForm.tsx`

Testa:
- Renderização do formulário
- Seleção de rating (estrelas)
- Input de feedback
- Submissão com dados corretos
- Toast de sucesso
- Toast de erro
- Desabilitação quando sem rating

### 4. NotificationBell (11 testes)

**Localização**: `src/components/NotificationBell.tsx`

Testa:
- Renderização do botão sino
- Badge com contador de não lidas
- Badge "9+" para > 9 notificações
- Carregamento de notificações
- Estado vazio
- Marcar como lida ao clicar
- Marcar todas como lidas
- Ícones diferentes por tipo
- Navegação contextual

### 5. ChatBell (13 testes)

**Localização**: `src/components/ChatBell.tsx`

Testa:
- Renderização do botão de mensagens
- Badge com contador de não lidas
- Badge "9+" para > 9 mensagens
- Carregamento de conversas
- Estado vazio
- Preview de mensagens
- Navegação para conversa
- Botão "Ver todas"
- Filtro de usuário atual
- Badge individual de não lidas por conversa

### 6. MessageBubble (16 testes)

**Localização**: `src/components/chat/MessageBubble.tsx`

Testa:
- Renderização de conteúdo
- Timestamp formatado
- Estilo de mensagem própria (isOwn=true)
- Estilo de mensagem recebida (isOwn=false)
- Avatar para mensagens recebidas
- Sem avatar para mensagens próprias
- Nome do remetente
- Checkmark simples (não lida)
- Checkmark duplo (lida)
- Conteúdo multilinha
- Props mínimas

---

## ✍️ Escrevendo Novos Testes

### Template Base

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MyComponent } from "@/components/MyComponent";

// Mock dependencies
jest.mock("@/server/myActions", () => ({
  myAction: jest.fn(),
}));

// Get mocked functions
import * as myActions from "@/server/myActions";
const mockMyAction = myActions.myAction as jest.MockedFunction<typeof myActions.myAction>;

describe("MyComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMyAction.mockResolvedValue({ success: true, data: {} });
  });

  test("renders component", () => {
    render(<MyComponent />);

    expect(screen.getByText("My Component")).toBeInTheDocument();
  });

  test("handles user interaction", async () => {
    render(<MyComponent />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMyAction).toHaveBeenCalled();
    });
  });
});
```

### Padrões de Query

```typescript
// Preferir queries acessíveis
screen.getByRole("button", { name: "Submit" })  // ✅ Melhor
screen.getByText("Submit")                      // ⚠️ OK
screen.getByTestId("submit-button")             // ❌ Último recurso

// Queries assíncronas
await screen.findByText("Success")              // ✅ Async, espera elemento aparecer
await waitFor(() => {                           // ✅ Para múltiplas asserções
  expect(screen.getByText("Success")).toBeInTheDocument();
});

// Múltiplos elementos
screen.getAllByText("Item")                     // Para arrays
screen.getAllByText("Item").length              // Contar elementos
screen.getAllByText("Item")[0]                  // Primeiro elemento
```

### Mockando Server Actions

```typescript
// ❌ ERRADO - Causa hoisting error
const mockAction = jest.fn();
jest.mock("@/server/actions", () => ({
  action: mockAction,
}));

// ✅ CORRETO - Mock inline + type assertion
jest.mock("@/server/actions", () => ({
  action: jest.fn(),
}));

import * as actions from "@/server/actions";
const mockAction = actions.action as jest.MockedFunction<typeof actions.action>;
```

### Mockando Date/Time

```typescript
jest.mock("date-fns", () => ({
  format: jest.fn(() => "14:30"),
  formatDistanceToNow: jest.fn(() => "há 5 minutos"),
}));

jest.mock("date-fns/locale", () => ({
  ptBR: {},
}));
```

---

## 🎯 Boas Práticas

### 1. Teste Comportamento, Não Implementação

```typescript
// ❌ RUIM - Testa implementação
expect(component.state.counter).toBe(5);

// ✅ BOM - Testa comportamento visível
expect(screen.getByText("Count: 5")).toBeInTheDocument();
```

### 2. Use Queries Acessíveis

```typescript
// ✅ Ordem de prioridade
1. getByRole (melhor para acessibilidade)
2. getByLabelText (para forms)
3. getByPlaceholderText (para inputs)
4. getByText (para conteúdo)
5. getByTestId (último recurso)
```

### 3. Limpe Mocks Entre Testes

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Limpa contadores e implementações
});
```

### 4. Use waitFor Para Operações Assíncronas

```typescript
// ❌ RUIM - Pode falhar intermitentemente
fireEvent.click(button);
expect(screen.getByText("Success")).toBeInTheDocument();

// ✅ BOM - Espera pela mudança
fireEvent.click(button);
await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

### 5. Teste Estados de Loading e Erro

```typescript
test("shows loading state", () => {
  render(<Component />);
  expect(screen.getByRole("status")).toBeInTheDocument();
});

test("shows error message on failure", async () => {
  mockAction.mockRejectedValue(new Error("Failed"));
  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### 6. Agrupe Testes Relacionados

```typescript
describe("MyComponent", () => {
  describe("when logged in", () => {
    // Testes para usuário logado
  });

  describe("when logged out", () => {
    // Testes para usuário não logado
  });
});
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module '@/...'"

**Solução**: Verifique `moduleNameMapper` no `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Problema: "Unexpected token '<'"

**Causa**: Jest não está processando JSX corretamente.

**Solução**: Verifique transform no `jest.config.js`:

```javascript
transform: {
  '^.+\\.(ts|tsx)$': ['ts-jest', {
    tsconfig: {
      jsx: 'react-jsx',  // Importante!
    },
  }],
}
```

### Problema: "Found multiple elements with text..."

**Causa**: Elemento aparece múltiplas vezes no DOM (ex: avatar + nome).

**Solução**: Use `getAllByText` ao invés de `getByText`:

```typescript
// ❌ Falha se houver múltiplos elementos
expect(screen.getByText("João")).toBeInTheDocument();

// ✅ Funciona com múltiplos elementos
expect(screen.getAllByText("João").length).toBeGreaterThan(0);
```

### Problema: "Act(...)" warnings

**Causa**: State updates não envolvidos em `act()`.

**Impacto**: Warnings, mas testes funcionam corretamente.

**Solução** (se necessário):
```typescript
await act(async () => {
  // Código que causa state update
});
```

### Problema: Testes lentos

**Soluções**:
1. Use `--maxWorkers=2` para CI
2. Evite usar `setTimeout` nos testes
3. Mocke operações de rede/DB
4. Execute testes específicos durante desenvolvimento

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)

### Guias Internos

- `/CLAUDE.md` - Instruções gerais do projeto
- `/docs/development/ROADMAP.md` - Roadmap e progresso
- `/docs/development/TASKS.md` - Tasks e issues

---

## 🤝 Contribuindo

### Adicionando Novos Testes

1. Crie arquivo em `src/__tests__/ComponentName.test.tsx`
2. Siga o [Template Base](#template-base)
3. Execute `npm test` para validar
4. Gere coverage: `npm run test:coverage`
5. Atualize esta documentação se necessário

### Checklist para Pull Requests

- [ ] Todos os testes passando (`npm test`)
- [ ] Coverage adequado (mínimo 60% no arquivo testado)
- [ ] Testes seguem boas práticas
- [ ] Mocks configurados corretamente
- [ ] Documentação atualizada

---

**Última atualização**: 30 de outubro de 2025
**Mantido por**: GitHub Copilot + Claude AI
**Status**: ✅ **55 testes implementados e passando**

---

## 📝 Changelog

### 2025-10-30 - Issue #014 Concluída
- ✅ Instalação de dependências de teste
- ✅ Configuração Jest + Testing Library
- ✅ 55 testes implementados (6 componentes)
- ✅ Scripts NPM adicionados
- ✅ Documentação completa criada
- ✅ Integração com Docker
