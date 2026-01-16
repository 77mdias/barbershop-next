# TASK-REALTIME-ANALYTICS-UX

Plano consolidado para evoluções de analytics, UX e confiabilidade de relatórios/admin.

## Objetivo
Entregar métricas em tempo real, visões financeiras detalhadas, análises de clientes e exportações acionáveis, mantendo UX responsiva e validações de entrada seguras.

## Itens

### 1) Notificações em Tempo Real (extensão #019)
- **Escopo**: Provider WebSocket/SSE; sync multi-aba; push de eventos para dashboards (reviews, agendamentos, receitas).
- **Entrega**: ✅ SSE centralizado `/api/realtime` com autenticação, fallback para polling, BroadcastChannel multi-aba, indicadores de status e reconexão exponencial. Eventos emitidos para notificações, reviews, agendamentos e analytics admin.
- **Critérios de aceite**:
  - Eventos broadcast com fallback para polling. ✅
  - Estado consistente em múltiplas abas. ✅
  - Indicadores de live status e reconexão exponencial. ✅
- **Dependências**: Infra WS/SSE; autenticação e autorização nos canais.

### 2) Receita por Método de Pagamento
- **Status**: ✅ Entregue (2026-02) – ReportsPageClient refetch corrigido para refletir o período atual e exportação CSV mantém filtros ativos.
- **Escopo**: Gráficos (pizza/stacked) por período; KPIs por método; drill-down por serviço/barbeiro.
- **Critérios de aceite**:
  - [x] Seleção de período reflete métodos com percentuais e valores absolutos (refetch sempre que o range muda, inclusive retorno ao padrão).
  - [x] Tratamento de “sem dados” e loading (spinner global + empty states específicos para pagamentos).
  - [x] Exportável junto com filtros aplicados (CSV com período selecionado e drill-down agregado).
- **Testes**:
  - [x] `AdminReportsPageClient.test.tsx` cobre re-busca ao alternar 7d ↔ 30d.
- **Notas**: Ajustado cache de faixa temporal e detalhes de export/empty state para manter KPIs consistentes por período.

### 3) Cohort de Clientes (Novos vs Recorrentes + LTV)
- **Escopo**: Classificar clientes mês a mês (novo/recorrente); LTV básico por cliente e por barbeiro.
- **Critérios de aceite**:
  - Cohort mensal com % de retenção e contagem.
  - LTV = receita total / clientes únicos (global e por barbeiro).
  - Possibilidade de filtro de período e serviço.

### 4) Capacidade e No-Show
- **Escopo**: Métricas de ocupação por barbeiro/serviço; taxa de cancelamento/no-show; alertas.
- **Critérios de aceite**:
  - Ocupação = slots utilizados / slots disponíveis (config base).
  - Taxa de no-show/cancelamento por período e por barbeiro.
  - Alertas visuais quando indicadores passam thresholds configuráveis.

### 5) Playbook de Exportação
- **Escopo**: Downloads de PDF/CSV/Excel na aba Exportar, respeitando filtros ativos.
- **Critérios de aceite**:
  - Gera arquivos com metadados de período e filtros.
  - Exporta tabelas de receitas, cohort e pagamentos.
  - Feedback de progresso/erro e retry.

### 6) UX de Loading/Erros
- **Escopo**: Loading/skeletons nos blocos de growth/payment; snackbars para falhas de fetch.
- **Critérios de aceite**:
  - Skeletons exibidos durante refetch; sem layout shift brusco.
  - Erros exibidos com ação de retry; logs em console apenas para debug.

### 7) Segurança/Limpeza de Inputs
- **Escopo**: Revalidar whitelist de dateRange e filtros; estados “sem dados” consistentes.
- **Critérios de aceite**:
  - Inputs sanitizados e validados no server (range permitido); UI mostra empty-state amigável.
  - Nenhum acesso a dados fora do range permitido.

## Entregáveis
- Server actions/handlers para WS/SSE, cohorts, ocupação e métodos de pagamento.
- Componentes UI: gráficos (pizza/stacked), tabelas exportáveis, skeletons e toasts de erro.
- Rotas de exportação (PDF/CSV/Excel) respeitando filtros.
- Documentação: atualização de ROADMAP/CHANGELOG/TASKS ao entregar cada item.

## Métricas de sucesso
- Latência de atualização < 2s em WS/SSE (quando habilitado).
- 0 erros não tratados em fetch/refetch de relatórios.
- Exportações com 100% de correspondência aos filtros selecionados.
- Disponibilidade dos dashboards: 99% em ambiente de produção.

## Riscos e Mitigações
- **Infra WS/SSE**: fallback para polling; timeouts configurados.
- **Dados incompletos**: estados de “sem dados” e testes de coortes com datasets pequenos.
- **Performance**: agregar consultas (groupBy) e paginar exportações; índices em campos de data/método.

## Status
- 🚀 Item 1 entregue (SSE/real-time ativo); demais itens permanecem pendentes.
