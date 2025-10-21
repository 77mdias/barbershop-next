# 🤝 Guia de Contribuição - Barbershop Next

Obrigado por considerar contribuir com o Barbershop Next! Este guia vai te ajudar a começar.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configurando o Ambiente](#configurando-o-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Padrões de Código](#padrões-de-código)
- [Commits e Pull Requests](#commits-e-pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Features](#sugerindo-features)

---

## 📜 Código de Conduta

Este projeto segue princípios de respeito, inclusão e colaboração. Esperamos que todos:

- ✅ Sejam respeitosos e profissionais
- ✅ Aceitem feedback construtivo
- ✅ Foquem no que é melhor para o projeto
- ✅ Demonstrem empatia com outros colaboradores
- ❌ Não usem linguagem ou comportamento ofensivo
- ❌ Não façam ataques pessoais

---

## 🚀 Como Posso Contribuir?

### 🐛 Reportando Bugs

Encontrou um bug? Ajude-nos a corrigi-lo:

1. **Verifique** se já não existe uma issue sobre o bug
2. **Crie uma nova issue** usando o template de bug
3. **Inclua**:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (OS, browser, versão)

### ✨ Sugerindo Features

Tem uma ideia? Compartilhe conosco:

1. **Abra uma issue** de feature request
2. **Descreva** o problema que a feature resolve
3. **Explique** a solução proposta
4. **Considere** alternativas
5. **Adicione** mockups se aplicável

### 💻 Contribuindo com Código

Tipos de contribuições bem-vindas:

- 🐛 Correção de bugs
- ✨ Novas features
- 📚 Melhorias na documentação
- ♻️ Refatoração de código
- ✅ Adição de testes
- 🎨 Melhorias de UI/UX

---

## 🔧 Configurando o Ambiente

### Pré-requisitos

- **Docker 20.10+** e **Docker Compose 2.0+** (Recomendado)
- Ou **Node.js 20+** e **PostgreSQL 14+**
- **Git** para controle de versão

### Setup com Docker (Recomendado)

```bash
# 1. Fork e clone o repositório
git clone https://github.com/SEU-USERNAME/barbershop-next.git
cd barbershop-next

# 2. Configure o ambiente
cp .env.example .env.development
# Edite .env.development conforme necessário

# 3. Inicie os containers
npm run docker:dev

# 4. Execute migrações
npm run docker:dev:migrate

# 5. Popule o banco (opcional)
npm run docker:dev:seed

# 6. Acesse a aplicação
# http://localhost:3000
```

### Setup Local (Sem Docker)

```bash
# 1. Fork e clone
git clone https://github.com/SEU-USERNAME/barbershop-next.git
cd barbershop-next

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env.development
# Configure DATABASE_URL e outras variáveis

# 4. Execute migrações
npm run db:migrate

# 5. Popule o banco (opcional)
npm run db:seed

# 6. Inicie servidor de desenvolvimento
npm run dev

# 7. Acesse http://localhost:3000
```

---

## 🔄 Fluxo de Trabalho

### 1. Escolha uma Task

- Verifique [TASKS.md](./docs/development/TASKS.md)
- Procure issues com label `good first issue`
- Comente na issue que vai trabalhar nela

### 2. Crie uma Branch

```bash
# Certifique-se de estar atualizado
git checkout main
git pull origin main

# Crie uma branch descritiva
git checkout -b feat/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

**Convenção de Nomes**:
- `feat/` - Nova feature
- `fix/` - Correção de bug
- `docs/` - Apenas documentação
- `refactor/` - Refatoração
- `test/` - Adição de testes
- `chore/` - Manutenção

### 3. Desenvolva

```bash
# Faça suas alterações
# Execute o projeto localmente
npm run dev
# ou
npm run docker:dev

# Teste suas mudanças manualmente
```

### 4. Teste

```bash
# Lint
npm run lint

# Type check
npm run type-check

# Valide tudo
npm run validate

# Build (para garantir que não quebra)
npm run build
```

### 5. Commit

```bash
# Adicione mudanças
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona sistema de notificações"

# Siga Conventional Commits (veja abaixo)
```

### 6. Push e Pull Request

```bash
# Push para seu fork
git push origin feat/nome-da-feature

# Abra um Pull Request no GitHub
# Preencha o template de PR
```

---

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // ...
}

// ❌ Evite
const getUser = async (id) => {
  // Sem tipos
}
```

### Componentes React

```typescript
// ✅ Bom - Functional components com tipos
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button onClick={onClick} className={cn(/* ... */)}>
      {children}
    </button>
  );
};

// ❌ Evite class components
class Button extends React.Component { /* ... */ }
```

### Naming Conventions

```typescript
// Componentes: PascalCase
export const UserProfile = () => { /* ... */ };

// Funções: camelCase
export const getUserById = (id: string) => { /* ... */ };

// Constantes: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

// Arquivos de componentes: PascalCase
// UserProfile.tsx

// Arquivos utilitários: camelCase
// userHelpers.ts
```

### Server Actions

```typescript
// ✅ Bom
"use server";

export async function createReview(data: CreateReviewInput) {
  try {
    // Validate
    const validated = createReviewSchema.parse(data);
    
    // Execute
    const review = await db.review.create({
      data: validated
    });
    
    // Return
    return { success: true, data: review };
  } catch (error) {
    return { success: false, error: "Failed to create review" };
  }
}
```

### Prisma Queries

```typescript
// ✅ Bom - Select específico, incluindo apenas o necessário
const user = await db.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    reviews: {
      take: 5,
      orderBy: { createdAt: 'desc' }
    }
  }
});

// ❌ Evite - Carrega todos os campos
const user = await db.user.findUnique({
  where: { id }
});
```

### CSS e Tailwind

```tsx
// ✅ Bom - Use cn() para classes condicionais
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)} />

// ❌ Evite - Strings condicionais complexas
<div className={`base ${isActive ? 'active' : ''} ${variant}`} />
```

---

## 💬 Commits e Pull Requests

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat:` - Nova feature
- `fix:` - Correção de bug
- `docs:` - Apenas documentação
- `style:` - Formatação, não afeta código
- `refactor:` - Refatoração
- `test:` - Adição/correção de testes
- `chore:` - Manutenção

**Exemplos**:

```bash
feat(reviews): adiciona upload de múltiplas imagens
fix(auth): corrige erro de validação no login
docs(readme): atualiza instruções de instalação
refactor(dashboard): simplifica lógica de métricas
test(reviews): adiciona testes para ReviewForm
chore(deps): atualiza dependências do Next.js
```

### Template de Pull Request

```markdown
## Descrição
[Descreva as mudanças de forma clara]

## Tipo de Mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova feature
- [ ] 📚 Documentação
- [ ] ♻️ Refatoração
- [ ] ✅ Testes

## Issue Relacionada
Closes #123

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots (se aplicável)
[Adicione screenshots de mudanças na UI]

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Comentários adicionados onde necessário
- [ ] Documentação atualizada
- [ ] Testes adicionados/atualizados
- [ ] Build passa sem erros
- [ ] Lint passa sem warnings críticos
- [ ] Type check passa
```

---

## 🎨 Guia de Estilo UI/UX

### Princípios de Design

1. **Mobile-First**: Sempre desenvolva para mobile primeiro
2. **Acessibilidade**: Seguir WCAG 2.1 Level AA
3. **Consistência**: Usar componentes do design system
4. **Performance**: Otimizar imagens e lazy load

### Componentes shadcn/ui

```tsx
// ✅ Bom - Usar componentes existentes
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ❌ Evite - Criar componentes similares do zero
```

### Responsividade

```tsx
// ✅ Bom - Mobile-first com Tailwind
<div className="
  flex flex-col          // Mobile: column
  md:flex-row           // Tablet+: row
  gap-4                 // Espaçamento padrão
  p-4 md:p-6 lg:p-8    // Padding responsivo
">
  {/* ... */}
</div>
```

---

## ✅ Checklist Antes de Submeter PR

### Código

- [ ] Código segue os padrões do projeto
- [ ] Variáveis e funções têm nomes descritivos
- [ ] Comentários adicionados onde a lógica é complexa
- [ ] Não há `console.log()` ou código de debug
- [ ] Não há código comentado desnecessário

### Testes

- [ ] Testei manualmente todas as mudanças
- [ ] Testei em diferentes tamanhos de tela
- [ ] Testei edge cases
- [ ] (Futuro) Testes automatizados adicionados

### Build e Qualidade

- [ ] `npm run lint` passa sem erros críticos
- [ ] `npm run type-check` passa sem erros
- [ ] `npm run build` completa com sucesso
- [ ] Não há regressões em funcionalidades existentes

### Documentação

- [ ] README atualizado se necessário
- [ ] Comentários em código complexo
- [ ] CHANGELOG.md atualizado (para features grandes)
- [ ] Screenshots adicionados ao PR (para UI)

---

## 🐛 Reportando Bugs

### Template de Bug Report

```markdown
**Descrição**
Descrição clara e concisa do bug.

**Para Reproduzir**
Passos para reproduzir:
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que está acontecendo.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 120]
- Versão: [ex: 0.8.7]

**Contexto Adicional**
Qualquer outra informação relevante.
```

---

## ✨ Sugerindo Features

### Template de Feature Request

```markdown
**O problema que essa feature resolve**
Descrição clara do problema.

**Solução Proposta**
Como você imaginaria essa feature funcionando?

**Alternativas Consideradas**
Outras soluções que você pensou.

**Benefícios**
- Benefício 1
- Benefício 2

**Mockups** (opcional)
Adicione mockups ou wireframes se tiver.

**Contexto Adicional**
Qualquer outra informação relevante.
```

---

## 📚 Recursos Úteis

### Documentação do Projeto

- [README Principal](./README.md)
- [Roadmap](./docs/development/ROADMAP.md)
- [Tasks](./docs/development/TASKS.md)
- [Project Status](./PROJECT-STATUS.md)

### Tecnologias Usadas

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Guias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

## 🤝 Comunidade

### Como Obter Ajuda

1. **Documentação**: Leia primeiro a documentação do projeto
2. **Issues**: Procure em issues existentes
3. **Discussions**: Use GitHub Discussions para perguntas
4. **PR Comments**: Comente no seu PR se tiver dúvidas

### Onde Discutir

- **GitHub Issues**: Para bugs e features
- **GitHub Discussions**: Para perguntas gerais
- **Pull Requests**: Para revisão de código

---

## 🎉 Primeiras Contribuições

Novo no open source? Sem problema!

### Issues para Iniciantes

Procure por issues com estas labels:
- `good first issue` - Bom para primeira contribuição
- `help wanted` - Precisamos de ajuda
- `documentation` - Melhorias na docs
- `beginner friendly` - Amigável para iniciantes

### Sua Primeira Contribuição

1. **Escolha** uma issue `good first issue`
2. **Comente** que vai trabalhar nela
3. **Faça um fork** do repositório
4. **Siga** o fluxo de trabalho acima
5. **Peça ajuda** se precisar (comments no PR)
6. **Seja paciente** - vamos revisar e ajudar

---

## 📞 Contato

- **Issues**: [GitHub Issues](https://github.com/77mdias/barbershop-next/issues)
- **Discussions**: [GitHub Discussions](https://github.com/77mdias/barbershop-next/discussions)
- **Maintainer**: @77mdias

---

## 🙏 Agradecimentos

Obrigado por contribuir com o Barbershop Next! Cada contribuição, por menor que seja, faz diferença.

**Lembre-se**:
- 💡 Sem pergunta boba
- 🤝 Seja gentil e respeitoso
- 📚 Documentação é contribuição
- 🐛 Reportar bugs ajuda
- ⭐ Star o projeto ajuda muito!

---

**Happy Coding!** 🚀
