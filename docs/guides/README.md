# 📖 Guides - Barbershop Next

Guias práticos, tutoriais e documentação de apoio para o projeto Barbershop Next.

## 📚 Documentos Disponíveis

### 🎯 Overview & Features

- **[Features Overview](./features-overview.md)** - Visão geral completa de todas as funcionalidades
  - Lista de features implementadas
  - Status de cada feature
  - Dependências entre features
  - Roadmap de features futuras

### 🎨 Demonstração e Vendas

- **[Demo Sales Guide](./demo-sales.md)** - Guia completo para demonstrações
  - Roteiro de demonstração
  - Features principais a destacar
  - Fluxos de uso mais impactantes
  - Respostas a perguntas comuns
  - Value propositions

### 📝 Documentação

- **[Documentation Guide](./documentation.md)** - Guia para escrever documentação
  - Estrutura de documentos
  - Convenções de escrita
  - Templates disponíveis
  - Melhores práticas

- **[Documentation Updates](./documentation-updates.md)** - Resumo de atualizações recentes
  - Histórico de mudanças na documentação
  - Grandes refatorações de docs
  - Migrations de estrutura

### 🤔 Decisões de Projeto

- **[Decisions](./decisions.md)** - Decisões arquiteturais importantes
  - ADRs (Architecture Decision Records)
  - Escolhas tecnológicas
  - Trade-offs considerados
  - Alternativas avaliadas

---

## 🎯 Guias Práticos

### Para Novos Desenvolvedores

**Sequência recomendada de leitura:**

1. **Comece aqui**: [Features Overview](./features-overview.md)
   - Entenda o que o sistema faz
   - Conheça as principais funcionalidades

2. **Setup inicial**: [Development Guide](../development/README.md)
   - Configure o ambiente local
   - Primeiro build e execução

3. **Arquitetura**: [Server Actions](../architecture/server-actions.md)
   - Entenda o pattern fundamental do projeto
   - Aprenda a estrutura de código

4. **Database**: [Database Guide](../database/GUIA-DESENVOLVIMENTO.md)
   - Trabalhe com Prisma ORM
   - Entenda os modelos de dados

5. **Features específicas**: [Features Docs](../features/)
   - Aprofunde-se nas features que vai trabalhar

### Para Demonstrações

**Preparação para demo:**

1. [Demo Sales Guide](./demo-sales.md) - Roteiro completo
2. [Features Overview](./features-overview.md) - Lista de features
3. [Test Credentials](../development/README.md#credenciais-de-teste) - Login para demo

**Features mais impactantes para demonstrar:**

1. 📅 **Agendamento** - Core do negócio
2. 💬 **Chat entre amigos** - Diferencial social
3. 🔔 **Notificações em tempo real** - UX moderna
4. ⭐ **Reviews com imagens** - Prova social
5. 🎟️ **Sistema de vouchers** - Retenção de clientes

### Para Arquitetos/Tech Leads

**Decisões importantes do projeto:**

1. [Decisions](./decisions.md) - ADRs e escolhas arquiteturais
2. [Docker Multi-Stage](../docker/GUIA-MULTI-STAGE.md) - Estratégia de deploy
3. [Server Actions Pattern](../architecture/server-actions.md) - Pattern principal
4. [Database Model](../architecture/database-model.md) - Modelagem de dados

---

## 📋 Templates Disponíveis

### Template: Nova Feature Documentation

```markdown
# Feature Name

**Status**: ✅ Implemented / 🚧 In Progress / 📋 Planned
**Since**: Version X.X.X
**Author**: Nome

## Overview

Breve descrição da feature (2-3 parágrafos).

## Core Components

### UI Components
- `ComponentName.tsx` - Descrição

### Server Actions
- `actionName()` - Descrição

### Services
- `ServiceName.method()` - Descrição

## Database Models

```prisma
model ModelName {
  // schema
}
```

## Usage Examples

### Basic Usage
\`\`\`typescript
// code example
\`\`\`

### Advanced Usage
\`\`\`typescript
// code example
\`\`\`

## API Reference

### Server Actions
- `actionName(params)` - Description

### Props/Parameters
- `prop1: Type` - Description

## Integration Points

Where this feature connects with others.

## Testing

How to test this feature.

## Common Issues

Known issues and solutions.

## Related Documentation

- [Related Doc 1](./link.md)
- [Related Doc 2](./link.md)
```

### Template: Decision Record (ADR)

```markdown
# ADR XXX: Decision Title

**Status**: Accepted / Superseded / Deprecated
**Date**: YYYY-MM-DD
**Decision makers**: Names

## Context

What is the issue we're trying to solve?

## Decision

What is the change we're proposing?

## Consequences

### Positive
- Pro 1
- Pro 2

### Negative
- Con 1
- Con 2

### Neutral
- Impact 1
- Impact 2

## Alternatives Considered

### Alternative 1
Why we didn't choose it.

### Alternative 2
Why we didn't choose it.

## References

- [Related Doc](./link.md)
- [External Resource](https://example.com)
```

---

## 🎓 Materiais de Estudo

### Conceitos Fundamentais

Para entender melhor o projeto, consulte os guias de estudo:

- [Prisma Fundamentals](../study/01-prisma-conceitos-fundamentais.md)
- [Docker Fundamentals](../study/02-docker-conceitos-fundamentais.md)
- [Dockerfile Explained](../study/03-dockerfile-explicado-linha-por-linha.md)
- [Docker Compose Explained](../study/04-docker-compose-explicado.md)

### Tutoriais Práticos

- [Local vs Container Development](../study/05-desenvolvimento-local-vs-container.md)
- [Troubleshooting Guide](../study/06-guia-resolucao-problemas.md)
- [Environment Variables](../study/07-estrutura-variaveis-ambiente.md)
- [Production Deploy](../study/08-guia-deploy-producao.md)

---

## 🔍 Como Encontrar Informação

### Preciso entender uma feature específica?
→ [Features Documentation](../features/)

### Preciso saber como fazer deploy?
→ [Deployment Guide](../deployment/)

### Preciso entender a arquitetura?
→ [Architecture Documentation](../architecture/)

### Preciso configurar o ambiente local?
→ [Development Guide](../development/)

### Preciso criar/rodar testes?
→ [Testing Guide](../testing/)

### Preciso trabalhar com banco de dados?
→ [Database Guide](../database/)

### Preciso entender Docker?
→ [Docker Guide](../docker/)

---

## 📊 Métricas de Documentação

### Coverage de Documentação

- ✅ **Architecture**: 100% documentado
- ✅ **Features**: 14/14 features documentadas
- ✅ **Database**: Guia completo disponível
- ✅ **Docker**: Guia completo + troubleshooting
- ✅ **Testing**: Overview + guides
- ✅ **Deployment**: Produção documentada
- 🚧 **API Routes**: Em progresso
- 📋 **Storybook**: Planejado

### Documentos por Categoria

```
Total de documentos: 70+
├── Architecture: 7 docs
├── Features: 14 docs
├── Database: 4 docs
├── Docker: 7 docs
├── Development: 3 docs
├── Testing: 3 docs
├── Deployment: 3 docs
├── Guides: 5 docs
├── Tasks: 1 doc principal
└── Study: 11 docs
```

---

## 🤝 Contribuindo com Documentação

### Antes de escrever

1. Verifique se já existe doc sobre o tema
2. Identifique a categoria correta
3. Escolha o template apropriado
4. Leia o [Documentation Guide](./documentation.md)

### Ao escrever

1. Use linguagem clara e objetiva
2. Inclua exemplos de código
3. Adicione links para docs relacionados
4. Mantenha formatação consistente

### Após escrever

1. Adicione link no README da categoria
2. Adicione link no README principal
3. Revise ortografia e gramática
4. Peça review de outro desenvolvedor

---

## 🔗 Links Úteis

### Documentação Externa

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

### Ferramentas

- [Docker Docs](https://docs.docker.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)

---

## 📞 Suporte

### Dúvidas sobre Documentação

- Criar issue no GitHub com label `documentation`
- Perguntar no canal de desenvolvimento
- Revisar [Documentation Updates](./documentation-updates.md)

### Sugestões de Melhorias

- Abrir PR com melhorias
- Criar issue com sugestões
- Discutir em reuniões de equipe

---

**Última atualização**: 15 de Novembro de 2025
