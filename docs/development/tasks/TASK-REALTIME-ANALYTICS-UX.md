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
- **Status**: ✅ Entregue (2026-02) – Cohort mensal filtrado por serviço e LTV global/por barbeiro na aba Clientes do Reports.
- **Escopo**: Classificar clientes mês a mês (novo/recorrente); LTV básico por cliente e por barbeiro.
- **Critérios de aceite**:
  - [x] Cohort mensal com % de retenção e contagem (período + serviço).
  - [x] LTV = receita total / clientes únicos (global e por barbeiro).
  - [x] Possibilidade de filtro de período e serviço.
- **Entregas**:
  - Cálculo Prisma com identificação do primeiro serviço por cliente para marcar novos vs recorrentes por mês.
  - LTV global e por barbeiro filtrados por serviço, com receita e clientes únicos do período selecionado.
  - Aba “Clientes” no ReportsPageClient com filtros de período/serviço, cards de LTV/retention e tabela de cohort.
  - Exportação de pagamentos inclui metadados do serviço selecionado.
- **Testes**:
  - `AdminReportsPageClient.test.tsx` cobre refetch por período e filtro de serviço (execução local bloqueada por ausência de dependências Jest no ambiente atual).

### 4) Capacidade e No-Show
- **Status**: ✅ Entregue (2026-02) – Capacidade por barbeiro/serviço com alertas de no-show/cancelamento e thresholds configuráveis.
- **Escopo**: Métricas de ocupação por barbeiro/serviço; taxa de cancelamento/no-show; alertas.
- **Critérios de aceite**:
  - [x] Ocupação = slots utilizados / slots disponíveis (config base).
  - [x] Taxa de no-show/cancelamento por período e por barbeiro.
  - [x] Alertas visuais quando indicadores passam thresholds configuráveis.
- **Entregas**:
  - `getReportsData` agrega capacidade por barbeiro/serviço usando configuração base (slots de 30 min, 9h-18h) com thresholds de ocupação/no-show/cancelamento.
  - Aba Performance do `ReportsPageClient` traz cards de capacidade geral, no-show/cancelamentos e listas por barbeiro/serviço com badges de alerta.
  - Alertas alinhados ao SSE de agendamentos (recalcula ao receber `appointment:changed`/`analytics:updated`).
- **Testes**:
  - `AdminReportsPageClient.test.tsx` cobre renderização das métricas de capacidade/no-show e estados de alerta (execução local não realizada; seguir recomendação de rodar Jest no container app).

### 5) Playbook de Exportação
- **Status**: ✅ Entregue (2026-02) – Exportar com filtros ativos para PDF (financeiro), CSV (pagamentos) e Excel (clientes/cohort).
- **Escopo**: Downloads de PDF/CSV/Excel na aba Exportar, respeitando filtros ativos.
- **Critérios de aceite**:
  - [x] Gera arquivos com metadados de período e filtros.
  - [x] Exporta tabelas de receitas (monthly growth + KPIs), cohort/LTV e pagamentos.
  - [x] Feedback de progresso/erro e retry com toasts (sonner) e estados de loading.
- **Entregas**:
  - PDF gerado via janela de impressão com KPIs financeiros, monthly growth e distribuição de pagamentos (período + serviço ativos).
  - CSV de pagamentos com drill-down por método, serviços e barbeiros; nomes de arquivos incluem o filtro.
  - Excel (xls) de clientes contendo cohort mensal e LTV por barbeiro para o filtro atual.
  - Botões com loading/disable compartilhado e retry via toast action.
- **Testes**:
  - `AdminReportsPageClient.test.tsx` cobre exportação CSV com filtros ativos e feedback (jest/RTL).

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
- 🚀 Itens 1, 3, 4 e 5 entregues (SSE/real-time ativo; cohort/LTV com filtro de serviço; capacidade/no-show com alertas; playbook de exportação completo); itens 6 e 7 permanecem pendentes.
