# 🤖 Gemini Agent Guidelines

Este documento serve como a principal fonte de verdade para todos os agentes de IA que trabalham neste repositório. A adesão a estas diretrizes é fundamental para garantir a qualidade, consistência e eficiência no desenvolvimento.

---

### 📜 Critical Rules - READ FIRST

1.  **Safety First**: Nunca execute comandos destrutivos (`rm -rf`, `git reset --hard`) sem um backup ou confirmação explícita.
2.  **Stick to the Stack**: Use exclusivamente as tecnologias e padrões definidos neste documento. Não introduza novas bibliotecas sem aprovação.
3.  **Follow the Workflow**: Adira estritamente ao fluxo de desenvolvimento, testes e commits.
4.  **Never Assume**: Sempre leia os arquivos relevantes (`package.json`, `README.md`, `*.config.js`) antes de agir. O contexto é tudo.
5.  **Documentation is Key**: Mantenha a documentação (incluindo este arquivo) atualizada com quaisquer alterações relevantes.

---

### 📚 Stack-Specific Guides

-   **Next.js 14**: O projeto utiliza o App Router. As páginas e layouts estão em `src/app`. A lógica de back-end é implementada principalmente através de Server Actions.
-   **Prisma ORM**: A interação com o banco de dados é feita exclusivamente através do Prisma Client. O schema do banco está em `prisma/schema.prisma`.
-   **Tailwind CSS & shadcn/ui**: A estilização é utility-first. Componentes de UI reutilizáveis são baseados em `shadcn/ui` e estão localizados em `src/components/ui`.
-   **TypeScript**: Todo o código deve ser fortemente tipado. Evite `any` sempre que possível.
-   **Docker**: O ambiente de desenvolvimento é containerizado para consistência. Use os scripts do `docker-manager.sh` para gerenciar os contêineres.

---

### 🏗️ Project Structure

```
src/
├── app/                    # App Router (Next.js 14): Páginas, Layouts, Rotas
├── components/             # Componentes React reutilizáveis
│   └── ui/                 # Componentes base (shadcn/ui)
├── server/                 # Server Actions e Services (lógica de backend)
├── schemas/                # Schemas Zod para validação
├── lib/                    # Funções utilitárias, config do NextAuth, client Prisma
├── hooks/                  # Hooks React customizados
├── contexts/               # Contextos React
├── providers/              # Provedores de contexto
├── types/                  # Definições de tipos TypeScript
├── __tests__/              # Testes automatizados (Jest & Testing Library)
prisma/                     # Schema, migrations e seed do Prisma
docs/                       # Documentação do projeto
scripts/                    # Scripts de utilidade (Docker, DB, etc.)
```

---

### ⚡ Essential Commands

#### Development

-   `npm run dev`: Inicia o servidor de desenvolvimento.
-   `./scripts/docker-manager.sh up dev`: Sobe o ambiente Docker de desenvolvimento completo.
-   `./scripts/docker-manager.sh down dev`: Para o ambiente Docker de desenvolvimento.
-   `./scripts/docker-manager.sh logs dev`: Exibe os logs dos contêineres de desenvolvimento.

#### Production

-   `npm run build`: Compila a aplicação para produção.
-   `npm run start`: Inicia o servidor de produção a partir do build.
-   `./scripts/deploy-pro.sh migrate`: Aplica migrações no ambiente de produção.
-   `./scripts/deploy-pro.sh app-only`: Implanta apenas a aplicação em produção.

#### Database (Prisma)

-   `npm run db:migrate`: Cria uma nova migração de desenvolvimento.
-   `npm run db:push`: Empurra o schema do Prisma para o banco de dados (apenas dev).
-   `npm run db:seed`: Popula o banco de dados com dados de teste.
-   `npm run db:studio`: Abre o Prisma Studio.
-   `./scripts/db-prod.sh <command>`: Executa comandos de banco de dados no ambiente de produção.

#### Testing

-   `npm test`: Executa todos os testes.
-   `npm run test:watch`: Executa os testes em modo de observação.
-   `npm run test:coverage`: Gera um relatório de cobertura de testes.
-   **Via Docker (preferencial)**: quando o ambiente estiver containerizado, execute os testes dentro do container `app` (ex.: `./scripts/docker-manager.sh shell dev` seguido de `npm test`, ou `docker compose -f docker-compose.yml exec app npm test -- <suite>`). Evite rodar Jest diretamente na máquina host.

#### Code Formatting & Linting

-   `npm run lint`: Verifica erros de lint.
-   `npm run lint:fix`: Corrige automaticamente os erros de lint.
-   `npm run type-check`: Verifica erros de tipagem do TypeScript.
-   `npm run validate`: Executa `lint` e `type-check`.

---

### 🧪 Testing Rules

-   Novos componentes de UI devem ter pelo menos um "smoke test" para garantir a renderização.
-   Funcionalidades críticas devem ter testes de integração que cubram os principais casos de uso.
-   Use a React Testing Library para escrever testes que simulem o comportamento do usuário.
-   Mantenha os testes atualizados com as mudanças no código.

---

### ✅ Commit & PR Guidelines

-   **Formato do Commit**: Use prefixos convencionais (ex: `feat:`, `fix:`, `docs:`, `test:`).
-   **Mensagens Claras**: A mensagem do commit deve ser concisa e descritiva.
-   **Pull Requests**:
    -   Faça um PR por feature ou correção.
    -   Descreva as mudanças no PR e vincule a issue correspondente.
    -   Certifique-se de que todos os testes e verificações de lint estão passando antes de solicitar a revisão.

---

###  anchoring:: AIDEV Anchors (Code Comments)

-   Use comentários de âncora para fornecer contexto para outros agentes (e humanos).
-   `// AIDEV: TODO: [explicação]` para funcionalidades a serem implementadas.
-   `// AIDEV: FIXME: [explicação]` para bugs conhecidos que precisam ser corrigidos.
-   `// AIDEV: REVIEW: [explicação]` para seções de código que precisam de revisão.

---

### 🔄 Development Workflow

1.  Crie uma nova branch a partir da `main`.
2.  Implemente a funcionalidade ou correção.
3.  Adicione ou atualize os testes relevantes.
4.  Execute `npm run validate` e `npm test` para garantir que tudo está passando.
5.  Faça o commit das suas alterações seguindo as diretrizes de commit.
6.  Abra um Pull Request para a `main`.
7.  Aguarde a revisão e aprovação.

---

### 🆔 Task ID Convention

-   Se aplicável, prefixe o nome da sua branch e seus commits com o ID da tarefa (ex: `T-123-feature-nova`).

---

### 🏭 Production Info

-   O deploy em produção é feito através do Vercel.
-   As migrações de banco de dados em produção devem ser executadas com o script `deploy-pro.sh` para garantir a segurança.
-   O ambiente de produção usa variáveis de ambiente definidas no Vercel. Consulte `.env.production.local` para um exemplo.

---

### 🔍 Quick Documentation Lookup

-   **Visão Geral do Projeto**: `README.md`
-   **Guia de Desenvolvimento Docker**: `docs/docker/DOCKER-DEV-GUIDE.md`
-   **Configuração de Email**: `CONFIGURAR-EMAIL.md`
-   **Setup do Chat**: `CHAT_SETUP.md`
-   **Guia de Migrations Multi-Stage**: `docs/docker/GUIA-MULTI-STAGE.md`

---

### 🚫 What NOT to Do

-   Não faça commit de segredos ou chaves de API. Use variáveis de ambiente.
-   Não altere o schema do banco de dados diretamente em produção. Use o fluxo de migração.
-   Não ignore os erros de lint ou de testes.
-   Não trabalhe diretamente na branch `main`.

---

### ✨ Success Checklist

Antes de finalizar sua tarefa, verifique se você:

-   [ ] Leu e seguiu todas as regras deste documento.
-   [ ] Atualizou a documentação, se necessário.
-   [ ] Escreveu e passou em todos os testes relevantes.
-   [ ] Verificou que o código está formatado e sem erros de lint.
-   [ ] Garantiu que sua implementação segue os padrões de arquitetura do projeto.
-   [ ] Confirmou que não há segredos ou informações sensíveis no código.
