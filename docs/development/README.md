# 📚 Documentação de Desenvolvimento - Barbershop Next

Esta pasta contém toda a documentação relacionada ao processo de desenvolvimento do projeto.

## 📁 Estrutura da Documentação

### Arquivos Principais

| Arquivo | Descrição | Atualização |
|---------|-----------|-------------|
| `ROADMAP.md` | Planejamento de funcionalidades e cronograma | Semanal |
| `CHANGELOG.md` | Histórico detalhado de mudanças | A cada release |
| `TASKS.md` | Lista de tarefas, bugs e melhorias | Diária |

### Como Usar

#### 📋 ROADMAP.md
- **Objetivo**: Visão geral do projeto e planejamento
- **Quando usar**: Planejamento de sprints, definição de prioridades
- **Atualizar**: Toda semana ou quando mudanças significativas

#### 📝 CHANGELOG.md
- **Objetivo**: Histórico de todas as mudanças implementadas
- **Quando usar**: Para rastrear progresso e releases
- **Atualizar**: A cada feature/bugfix implementado

#### 🎯 TASKS.md
- **Objetivo**: Gerenciamento de tarefas e issues
- **Quando usar**: Desenvolvimento diário, sprint planning
- **Atualizar**: Diariamente conforme progresso

## 🔄 Fluxo de Trabalho

### 1. Planejamento
1. Revisar `ROADMAP.md`
2. Selecionar tasks do `TASKS.md`
3. Estimar e priorizar

### 2. Desenvolvimento
1. Marcar task como "Em andamento" no `TASKS.md`
2. Implementar funcionalidade
3. Testar e documentar
   - Em ambiente dockerizado, execute os testes dentro do container `app` (ex.: `./scripts/docker-manager.sh shell dev` e `npm test`, ou `docker compose -f docker-compose.yml exec app npm test -- <suite>`). Evite rodar Jest diretamente no host para manter paridade de ambiente.

### 3. Release
1. Atualizar `CHANGELOG.md`
2. Marcar task como concluída no `TASKS.md`
3. Revisar `ROADMAP.md` se necessário

## 🎯 Convenções

### Labels de Prioridade
- 🔥 **Alta**: Crítico, bloqueia outros desenvolvimentos
- 📋 **Média**: Importante, mas não bloqueia
- 🔧 **Baixa**: Melhorias e otimizações

### Status de Tasks
- ✅ **Concluído**: Implementado e testado
- 🚧 **Em Desenvolvimento**: Sendo trabalhado
- 📝 **Planejado**: Definido mas não iniciado
- 💡 **Ideia**: Conceito para análise futura

### Tipos de Issues
- **Bug**: Problema identificado
- **Feature**: Nova funcionalidade
- **Enhancement**: Melhoria de funcionalidade existente
- **Docs**: Documentação
- **Technical**: Melhorias técnicas/refatoração

## 📊 Métricas e Acompanhamento

### Indicadores de Progresso
- Velocity por sprint
- Burn down de funcionalidades
- Cobertura de testes
- Performance metrics

### Reviews Regulares
- **Diária**: Atualização de tasks
- **Semanal**: Review do roadmap
- **Mensal**: Retrospectiva completa

## 🤝 Colaboração

### Para Desenvolvedores
1. Sempre consultar documentação antes de iniciar
2. Atualizar status conforme progresso
3. Documentar decisões técnicas importantes

### Para Product Owners
1. Priorizar features no roadmap
2. Definir critérios de aceite claros
3. Validar entregas conforme changelog

---

**Última atualização**: 15 de fevereiro de 2026  
**Responsável**: Development Team  
**Próxima revisão**: 22 de fevereiro de 2026
