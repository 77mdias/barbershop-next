# Documentation Guide — Barbershop Next

Objetivo: padronizar como escrever, revisar e atualizar documentação no repositório.

Resumo rápido

- Local principal da documentação: `docs/`
- Documentos de alto nível: `README.md`, `DOCKER.md`, `INSTALL.md`, `docs/development/ROADMAP.md`
- Padrão: Markdown, em português brasileiro (pt-BR)

Estrutura recomendada

- docs/
  - development/ (roadmap, processos)
  - docker/ (guias e troubleshooting)
  - prisma/ (schema, seeds, guias)
  - database/ (modelos e scripts)

Regras de escrita

- Use título H1 apenas uma vez por arquivo.
- Seja objetivo: primeiro um resumo de 1-3 linhas.
- Inclua exemplos copiáveis (blocos de código) para passos operacionais.
- Sempre mantenha um "Última atualização" com data e autor (GitHub username).
- Use listas de tarefas quando houver passos a executar.

Padrões técnicos

- Comandos de terminal: usar Bash-flavored snippets
- Links internos: caminhos relativos desde a raiz do repositório
- Exemplos com Docker: preferir `./scripts/docker-manager.sh` quando aplicável

Como propor mudanças

1. Crie uma branch a partir de `main` com nome `docs/<assunto>-<seu-usuario>`.
2. Faça as alterações e inclua um resumo claro no commit.
3. Abra um PR descrevendo o que foi alterado e por quê.
4. Marque `@docs` e o owner da área (ex: `@devops`) para revisão.

Template rápido para novos arquivos

---

# Título do Documento

Resumo: 1-3 linhas descrevendo o objetivo.

Última atualização: YYYY-MM-DD — @seu-usuario

## Sumário

- Exemplo

## Passos

```bash
# comandos
```

## Notas

- Observações relevantes

---

Checklist antes de abrir PR

- [ ] Texto revisado e sem erros ortográficos
- [ ] Comandos testados (quando aplicável)
- [ ] Links internos verificados
- [ ] Data de atualização preenchida

Feedback e manutenção

- Reservado para `@docs`. Para dúvidas sobre o padrão, abra uma issue no repositório.
