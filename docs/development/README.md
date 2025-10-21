# 📚 Documentação de Desenvolvimento - Barbershop Next

Esta pasta contém toda a documentação relacionada ao processo de desenvolvimento do projeto.

**Última atualização**: 21 de outubro de 2025  
**Status do Projeto**: 🚀 **87.5% das features principais implementadas**

---

## 📑 Documentos Principais

### 📊 Status e Planejamento

| Documento | Descrição | Atualização | Link |
|-----------|-----------|-------------|------|
| **PROJECT-STATUS.md** | Visão geral executiva completa do projeto | Semanal | [📊 Ver Status](../../PROJECT-STATUS.md) |
| **ROADMAP.md** | Planejamento de funcionalidades e cronograma | Semanal | [🗺️ Ver Roadmap](./ROADMAP.md) |
| **TASKS.md** | Lista de tarefas, bugs e melhorias | Diária | [✅ Ver Tasks](./TASKS.md) |
| **CHANGELOG.md** | Histórico detalhado de mudanças | A cada release | [📝 Ver Changelog](./CHANGELOG.md) |

### 🤝 Contribuição

| Documento | Descrição | Link |
|-----------|-----------|------|
| **CONTRIBUTING.md** | Guia completo de contribuição | [🤝 Como Contribuir](../../CONTRIBUTING.md) |
| **README.md** | Overview geral do projeto | [📖 README Principal](../../README.md) |

---

## 📂 Estrutura da Documentação

### 📁 Por Categoria

```
docs/
├── development/           # Desenvolvimento e planejamento
│   ├── README.md         # Este arquivo
│   ├── ROADMAP.md        # Roadmap e cronograma
│   ├── TASKS.md          # Tasks e issues
│   └── CHANGELOG.md      # Histórico de mudanças
├── docker/               # Docker e containerização
│   ├── README.md
│   ├── GUIA-MULTI-STAGE.md
│   ├── PRODUCTION.md
│   └── ... (8 arquivos)
├── database/             # Database e Prisma
│   ├── GUIA-DESENVOLVIMENTO.md
│   ├── EXEMPLOS-PRATICOS.md
│   └── SCRIPTS.md
├── estudo/               # Guias de estudo
│   └── ... (11 arquivos)
└── features/             # Documentação de features
    ├── review-system.md
    ├── upload-system.md
    ├── roles-permissions.md
    └── ...

Raiz do Projeto:
├── README.md             # Overview principal
├── PROJECT-STATUS.md     # Status executivo (NOVO!)
├── CONTRIBUTING.md       # Guia de contribuição (NOVO!)
├── SETUP-DOCKER.md      # Setup Docker
├── DOCKER.md            # Comandos Docker
├── INSTALL.md           # Instalação
└── SECURITY.md          # Segurança
```

---

## 🎯 Como Usar Esta Documentação

### 👤 Para Novos Colaboradores

**Leitura Recomendada (nesta ordem)**:

1. **[README.md](../../README.md)** - Overview geral do projeto
2. **[PROJECT-STATUS.md](../../PROJECT-STATUS.md)** - Status atual e métricas
3. **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - Como contribuir
4. **[SETUP-DOCKER.md](../../SETUP-DOCKER.md)** - Setup do ambiente
5. **[TASKS.md](./TASKS.md)** - Escolher uma task para começar

**Tempo estimado**: 30-45 minutos

---

### 📋 Para Product Owners

**Documentos Essenciais**:

1. **[PROJECT-STATUS.md](../../PROJECT-STATUS.md)** - Visão executiva completa
2. **[ROADMAP.md](./ROADMAP.md)** - Planejamento e cronograma
3. **[TASKS.md](./TASKS.md)** - Status das tasks e prioridades
4. **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de entregas

**Frequência de Revisão**: Semanal

---

### 💻 Para Desenvolvedores

**Referência Rápida**:

- **Começando**: [CONTRIBUTING.md](../../CONTRIBUTING.md)
- **Tasks Disponíveis**: [TASKS.md](./TASKS.md)
- **Padrões de Código**: [CONTRIBUTING.md#padrões-de-código](../../CONTRIBUTING.md)
- **Fluxo de Trabalho**: [CONTRIBUTING.md#fluxo-de-trabalho](../../CONTRIBUTING.md)

**Documentação Técnica**:

- **Database**: [/docs/database/](../database/)
- **Docker**: [/docs/docker/](../docker/)
- **Features**: [/docs/](../)

---

## 🔄 Fluxo de Trabalho de Documentação

### 1. Planejamento (Início do Sprint)

**Quem**: Product Owner + Tech Lead  
**O que fazer**:
1. Revisar [ROADMAP.md](./ROADMAP.md)
2. Atualizar [TASKS.md](./TASKS.md) com novas tasks
3. Definir prioridades e estimativas
4. Atualizar [PROJECT-STATUS.md](../../PROJECT-STATUS.md)

**Quando**: Início de cada sprint (toda segunda-feira)

---

### 2. Desenvolvimento (Durante o Sprint)

**Quem**: Desenvolvedores  
**O que fazer**:
1. Consultar [TASKS.md](./TASKS.md) para task atual
2. Atualizar status da task conforme progresso
3. Documentar decisões técnicas importantes
4. Escrever comentários em código complexo

**Quando**: Diariamente, conforme trabalha

---

### 3. Release (Fim do Sprint)

**Quem**: Tech Lead  
**O que fazer**:
1. Atualizar [CHANGELOG.md](./CHANGELOG.md)
2. Marcar tasks como concluídas em [TASKS.md](./TASKS.md)
3. Revisar e atualizar [ROADMAP.md](./ROADMAP.md)
4. Atualizar [PROJECT-STATUS.md](../../PROJECT-STATUS.md)

**Quando**: Final de cada sprint (toda sexta-feira)

---

### 4. Review Mensal

**Quem**: Time completo  
**O que fazer**:
1. Retrospectiva completa
2. Análise de métricas
3. Ajustes no planejamento
4. Atualização de documentação arquitetural

**Quando**: Última sexta-feira de cada mês

---

## 🎯 Convenções e Padrões

### 📝 Labels de Prioridade

| Label | Emoji | Significado | Ação |
|-------|-------|-------------|------|
| **Crítica** | 🔥 | Bloqueia desenvolvimento | Resolver ASAP |
| **Alta** | ⚡ | Importante, impacta usuários | Priorizar |
| **Média** | 📋 | Importante mas não bloqueia | Próximo sprint |
| **Baixa** | 🔧 | Melhorias e otimizações | Backlog |

### 🏷️ Status de Tasks

| Status | Emoji | Descrição |
|--------|-------|-----------|
| **Concluído** | ✅ | Implementado, testado e merged |
| **Em Desenvolvimento** | 🚧 | Ativamente trabalhando |
| **Aguardando** | 📝 | Planejado para este sprint |
| **Bloqueado** | ⏸️ | Aguardando dependência |
| **Backlog** | 💡 | Planejado para futuro |

### 📦 Tipos de Issues

| Tipo | Emoji | Descrição | Exemplo |
|------|-------|-----------|---------|
| **Bug** | 🐛 | Problema identificado | Erro de validação |
| **Feature** | ✨ | Nova funcionalidade | Sistema de busca |
| **Enhancement** | 🔄 | Melhoria de feature existente | Otimizar queries |
| **Docs** | 📚 | Documentação | Atualizar README |
| **Technical** | 🔧 | Melhorias técnicas | Refatoração |
| **Security** | 🔒 | Segurança | Corrigir vulnerabilidade |

---

## 📊 Métricas e Acompanhamento

### Indicadores de Progresso

**Medimos**:
- ✅ Velocity por sprint (story points/semana)
- 📉 Burn down de funcionalidades
- 🧪 Cobertura de testes (meta: 80%)
- ⚡ Performance metrics (Core Web Vitals)
- 🐛 Bug rate (bugs/sprint)

**Onde ver**: [PROJECT-STATUS.md](../../PROJECT-STATUS.md)

### Reviews Regulares

| Tipo | Frequência | Participantes | Duração |
|------|------------|---------------|---------|
| **Daily Status** | Diária | Devs | 5min |
| **Sprint Review** | Semanal | Time completo | 30min |
| **Sprint Planning** | Semanal | Time completo | 1h |
| **Retrospectiva** | Mensal | Time completo | 1h |

---

## 🤝 Colaboração

### Para Desenvolvedores

**Antes de Iniciar**:
1. ✅ Ler [CONTRIBUTING.md](../../CONTRIBUTING.md)
2. ✅ Configurar ambiente ([SETUP-DOCKER.md](../../SETUP-DOCKER.md))
3. ✅ Escolher task em [TASKS.md](./TASKS.md)
4. ✅ Comentar na issue que vai trabalhar

**Durante o Desenvolvimento**:
1. 📝 Atualizar status da task
2. 💬 Comentar decisões técnicas importantes
3. 📚 Documentar código complexo
4. ✅ Testar continuamente

**Ao Finalizar**:
1. ✅ Verificar checklist do PR
2. 📸 Adicionar screenshots (se UI)
3. 📝 Descrever mudanças claramente
4. 🔗 Linkar issue relacionada

---

### Para Product Owners

**Responsabilidades**:
1. 🎯 Priorizar features no roadmap
2. ✍️ Definir critérios de aceite claros
3. ✅ Validar entregas conforme changelog
4. 📊 Revisar métricas semanalmente

**Documentos-Chave**:
- [PROJECT-STATUS.md](../../PROJECT-STATUS.md) - Visão executiva
- [ROADMAP.md](./ROADMAP.md) - Planejamento
- [TASKS.md](./TASKS.md) - Prioridades

---

### Para Novos Membros do Time

**Onboarding - Primeiro Dia**:

- [ ] Ler [README.md](../../README.md) (10min)
- [ ] Ler [PROJECT-STATUS.md](../../PROJECT-STATUS.md) (15min)
- [ ] Ler [CONTRIBUTING.md](../../CONTRIBUTING.md) (20min)
- [ ] Configurar ambiente ([SETUP-DOCKER.md](../../SETUP-DOCKER.md)) (30min)
- [ ] Explorar código e estrutura (1h)

**Onboarding - Primeira Semana**:

- [ ] Completar primeira contribuição (issue `good first issue`)
- [ ] Familiarizar-se com [ROADMAP.md](./ROADMAP.md)
- [ ] Entender fluxo de trabalho em [TASKS.md](./TASKS.md)
- [ ] Participar do sprint planning

**Recursos de Apoio**:
- [Documentação técnica](../)
- [Guias de estudo](../estudo/)
- [Exemplos de código](../database/EXEMPLOS-PRATICOS.md)

---

## 📚 Recursos Adicionais

### Documentação Técnica

| Categoria | Links Principais |
|-----------|------------------|
| **Docker** | [README](../docker/README.md) · [Multi-Stage](../docker/GUIA-MULTI-STAGE.md) · [Produção](../docker/PRODUCTION.md) |
| **Database** | [Desenvolvimento](../database/GUIA-DESENVOLVIMENTO.md) · [Exemplos](../database/EXEMPLOS-PRATICOS.md) · [Scripts](../database/SCRIPTS.md) |
| **Features** | [Reviews](../review-system.md) · [Upload](../upload-system.md) · [Roles](../roles-permissions.md) |
| **Estudo** | [11 guias detalhados](../estudo/README.md) |

### Links Externos

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🎓 Boas Práticas

### Documentação

- ✅ Sempre atualizar após mudanças significativas
- ✅ Usar linguagem clara e objetiva
- ✅ Incluir exemplos práticos
- ✅ Manter índice atualizado
- ✅ Adicionar data de última atualização

### Código

- ✅ Seguir padrões do [CONTRIBUTING.md](../../CONTRIBUTING.md)
- ✅ Comentar lógica complexa
- ✅ Escrever testes (quando setup estiver pronto)
- ✅ Code review antes de merge
- ✅ Usar Conventional Commits

### Processo

- ✅ Atualizar status diariamente
- ✅ Comunicar bloqueios imediatamente
- ✅ Pedir ajuda quando necessário
- ✅ Participar das reviews
- ✅ Contribuir com melhorias

---

## 🆘 Troubleshooting

### Problemas Comuns

**"Onde encontro a task X?"**
→ Veja [TASKS.md](./TASKS.md), busque por palavra-chave

**"Como sei o que trabalhar?"**
→ Veja Sprint Atual em [TASKS.md](./TASKS.md#sprint-atual)

**"Documentação desatualizada"**
→ Abra uma issue ou PR para corrigir

**"Não sei por onde começar"**
→ Veja [CONTRIBUTING.md](../../CONTRIBUTING.md#primeiras-contribuições)

### Contato

- **Issues**: [GitHub Issues](https://github.com/77mdias/barbershop-next/issues)
- **Discussões**: [GitHub Discussions](https://github.com/77mdias/barbershop-next/discussions)

---

## 📝 Histórico de Mudanças Deste Documento

| Data | Versão | Mudanças |
|------|--------|----------|
| 2025-10-21 | 2.0 | Reestruturação completa, adição de PROJECT-STATUS e CONTRIBUTING |
| 2025-10-11 | 1.0 | Versão inicial |

---

**Última atualização**: 21 de outubro de 2025  
**Responsável**: Development Team  
**Próxima revisão**: 28 de outubro de 2025  
**Status**: 📚 **Documentação completa e atualizada**