# 🧪 Testing - Barbershop Next

Documentação sobre testes, quality assurance e estratégias de teste do sistema.

## 📚 Documentos Disponíveis

- **[Overview](./overview.md)** - Visão geral completa do sistema de testes
  - Setup do Jest + React Testing Library
  - Estatísticas: 55 testes, 100% passing
  - Componentes testados
  - Convenções de teste

- **[Test Flows](./test-flows.md)** - Fluxos de teste principais
  - User authentication flows
  - Appointment booking flows
  - Review submission flows
  - Social interaction flows
  - Payment/voucher flows

- **[Loading States](./loading-states.md)** - Testes de estados de loading
  - Skeleton components
  - Loading spinners
  - Suspense boundaries
  - Error boundaries
  - Retry mechanisms

---

## 📊 Status dos Testes

### Estatísticas Atuais

```
✅ 55 testes implementados
✅ 100% passing
✅ 6 test suites
```

### Componentes Testados (100% passing)

- ✅ **LoadingSpinner** - Componente de loading
- ✅ **Skeleton** - Placeholders de carregamento
- ✅ **ReviewForm** - Formulário de reviews
- ✅ **NotificationBell** - Sino de notificações
- ✅ **ChatBell** - Sino de chat
- ✅ **MessageBubble** - Mensagens do chat

### Coverage por Categoria

```
Components:     6/X  testados
Server Actions: Em desenvolvimento
Services:       Em desenvolvimento
Utilities:      Em desenvolvimento
```

---

## 🎯 Executando Testes

### Comandos Principais

```bash
# Executar todos os testes (dentro do container)
docker compose exec app npm test

# Watch mode (desenvolvimento)
docker compose exec app npm run test:watch

# Coverage report
docker compose exec app npm run test:coverage

# CI mode (sem watch, com coverage)
docker compose exec app npm run test:ci

# Teste específico
docker compose exec app npm test NotificationBell
docker compose exec app npm test ChatBell
docker compose exec app npm test ReviewForm
```

### Estrutura de Testes

```
src/
├── __tests__/
│   ├── components/
│   │   ├── LoadingSpinner.test.tsx
│   │   ├── Skeleton.test.tsx
│   │   ├── ReviewForm.test.tsx
│   │   ├── NotificationBell.test.tsx
│   │   ├── ChatBell.test.tsx
│   │   └── MessageBubble.test.tsx
│   ├── server/
│   │   └── (futuro)
│   └── utils/
│       └── (futuro)
└── components/
    └── (componentes principais)
```

---

## 🧩 Padrões de Teste

### Testing Library Pattern

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    render(<ComponentName />)
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument()
    })
  })
})
```

### Mocking Server Actions

```typescript
// Mock server action
jest.mock('@/server/actionFile', () => ({
  actionName: jest.fn()
}))

// Setup mock response
import { actionName } from '@/server/actionFile'
;(actionName as jest.Mock).mockResolvedValue({
  success: true,
  data: { /* test data */ }
})
```

### Mocking NextAuth Session

```typescript
// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}))

// Setup mock session
import { useSession } from 'next-auth/react'
;(useSession as jest.Mock).mockReturnValue({
  data: {
    user: { id: '1', name: 'Test User', role: 'CLIENT' }
  },
  status: 'authenticated'
})
```

---

## 🎨 Testando por Tipo de Componente

### UI Components (Skeleton, Spinner)

**Foco**: Renderização, props, acessibilidade

```typescript
it('should render with correct ARIA attributes', () => {
  render(<LoadingSpinner />)
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
})
```

### Form Components (ReviewForm)

**Foco**: Validação, submission, error handling

```typescript
it('should show validation errors', async () => {
  render(<ReviewForm />)
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  await waitFor(() => {
    expect(screen.getByText(/required/i)).toBeInTheDocument()
  })
})
```

### Interactive Components (NotificationBell, ChatBell)

**Foco**: User interactions, state changes, API calls

```typescript
it('should fetch and display notifications on click', async () => {
  render(<NotificationBell />)
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => {
    expect(mockFetchAction).toHaveBeenCalled()
    expect(screen.getByText('Notification 1')).toBeInTheDocument()
  })
})
```

---

## 🚀 Roadmap de Testes

### Próximas Implementações

#### Fase 1: Server Actions
- [ ] `appointmentActions.test.ts`
- [ ] `reviewActions.test.ts`
- [ ] `chatActions.test.ts`
- [ ] `notificationActions.test.ts`
- [ ] `friendshipActions.test.ts`

#### Fase 2: Services
- [ ] `UserService.test.ts`
- [ ] `AppointmentService.test.ts`
- [ ] `ChatService.test.ts`
- [ ] `NotificationService.test.ts`
- [ ] `FriendshipService.test.ts`

#### Fase 3: Integration Tests
- [ ] Authentication flow (login → dashboard)
- [ ] Appointment booking (select service → pay → confirm)
- [ ] Review submission (complete appointment → review)
- [ ] Social features (add friend → chat)

#### Fase 4: E2E Tests (Playwright/Cypress)
- [ ] Complete user journey
- [ ] Admin workflows
- [ ] Barber workflows
- [ ] Payment flows

---

## 📖 Guias de Teste por Feature

### Testando Agendamentos
1. Mock AuthService para usuário autenticado
2. Mock AppointmentService para criar agendamento
3. Testar validações (data, horário, barbeiro disponível)
4. Testar aplicação de vouchers/promoções
5. Verificar atualização de UI

### Testando Chat
1. Mock ChatService para buscar conversas
2. Mock useSession para amizade válida
3. Testar envio de mensagens
4. Testar auto-refresh (use fake timers)
5. Verificar contador de não lidas

### Testando Notificações
1. Mock NotificationService
2. Testar dropdown opening/closing
3. Testar mark as read (individual/bulk)
4. Testar navegação contextual
5. Verificar badge counter

### Testando Reviews
1. Mock ReviewService
2. Testar upload de imagens (mock File API)
3. Testar validação de rating (1-5)
4. Testar submissão
5. Verificar preview de imagens

---

## 🔧 Configuração de Testes

### jest.config.js

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx'
  ]
}
```

### jest.setup.js

```javascript
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}))

// Global test utilities
global.mockPush = jest.fn()
```

---

## 🆘 Troubleshooting

### Problema: Testes falham com "Cannot find module"

**Solução**: Verificar path aliases no jest.config.js
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1'
}
```

### Problema: "Not wrapped in act(...)" warning

**Solução**: Usar `waitFor` para updates assíncronos
```typescript
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

### Problema: Timers não funcionam em testes

**Solução**: Usar fake timers do Jest
```typescript
jest.useFakeTimers()
// ... test code ...
jest.advanceTimersByTime(1000)
jest.useRealTimers()
```

---

## 🔗 Links Relacionados

- [Features Documentation](../features/) - Features a serem testadas
- [Architecture Documentation](../architecture/) - Entender estrutura
- [Development Guide](../development/) - Setup de ambiente de testes

---

**Última atualização**: 15 de Novembro de 2025
