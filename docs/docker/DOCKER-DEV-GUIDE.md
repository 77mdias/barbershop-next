# 🐳 Guia de Desenvolvimento Docker (Sem DevContainer)

## ⚠️ Situação Atual

Como o devcontainer não está funcionando, este guia ajuda a contornar as limitações de trabalhar com containers Docker externamente.

## 🔧 Configurações Aplicadas

### VS Code Settings

- **TypeScript validation** desabilitada (evita erros de módulos não encontrados)
- **Auto imports** desabilitados (módulos estão no container)
- **Performance otimizada** com exclusões de arquivos
- **Tasks personalizadas** para comandos Docker frequentes

### Snippets Criados

- `nextpage` - Template de página Next.js
- `serveraction` - Template de server action
- `reactcomp` - Template de componente React
- `zodschema` - Template de schema Zod
- `useformhook` - Template de form com react-hook-form
- `imports` - Imports comuns do projeto
- `dockercmd` - Comentário com comando Docker

## 🚀 Comandos Essenciais

### Desenvolvimento Diário

```bash
# Iniciar desenvolvimento
docker compose up app

# Parar containers
docker compose down

# Ver logs
docker compose logs app -f
```

### Sincronização automática de dependências

- O container `app` agora valida o hash do `package-lock.json` ao iniciar.
- Se o lockfile mudou (ou `node_modules` está incompleto), ele executa `npm ci` automaticamente antes do `npm run dev`.
- Isso evita erros como `Module not found` quando novas dependências foram adicionadas no host.
- O `docker-manager.sh` aguarda `prisma` e `next` estarem disponíveis no container antes de executar `db:migrate`, reduzindo falhas de corrida no boot.

### Comandos Frequentes

```bash
# Executar comando no container
docker compose exec app [COMANDO]

# Exemplos:
docker compose exec app npm install [package]
docker compose exec app npx prisma studio
docker compose exec app npm run db:seed
docker compose exec app sh  # Terminal no container
```

### Database/Prisma

```bash
# Migrações
docker compose exec app npx prisma migrate dev

# Seed
docker compose exec app npm run db:seed

# Studio
docker compose exec app npx prisma studio

# Status
docker compose exec app npx prisma migrate status
```

## 🎯 Tasks do VS Code (Ctrl+Shift+P > "Tasks: Run Task")

1. **🐳 Docker: Run Dev Server** - Inicia servidor desenvolvimento
2. **🐳 Docker: Execute Command** - Executa comando personalizado
3. **🐳 Docker: Install Package** - Instala novo pacote
4. **🗄️ Prisma: Migrate Dev** - Aplica migrações
5. **🗄️ Prisma: Studio** - Abre Prisma Studio
6. **🌱 Prisma: Seed Database** - Executa seed
7. **🧪 Run Tests** - Executa testes
8. **🔍 Lint Code** - Executa linting
9. **🐚 Docker: Shell Access** - Terminal no container

## 💡 Dicas de Produtividade

### 1. Use os Snippets

Ao invés de lutar com imports, use os snippets:

- Digite `imports` + Tab para imports comuns
- Digite `serveraction` + Tab para server actions
- Digite `reactcomp` + Tab para componentes

### 2. Ignore Erros de Import

Os "erros" vermelhos de TypeScript são falsos - os módulos existem no container.

### 3. Use Tasks Frequentemente

Ao invés de digitar comandos Docker longos, use as tasks do VS Code.

### 4. Terminal Dedicado

Mantenha um terminal sempre com `docker compose logs app -f` rodando.

### 5. Alias Úteis (opcional)

Adicione ao seu `.zshrc`:

```bash
alias dce="docker compose exec app"
alias dcl="docker compose logs app -f"
alias dcu="docker compose up app"
alias dcd="docker compose down"
```

## 🚨 Solução de Problemas

### "Module not found" no VS Code

✅ **Normal** - módulo está no container, erro é só visual

### Container não inicia

```bash
docker compose down
docker compose build --no-cache
docker compose up app
```

### Banco de dados perdido

```bash
docker compose exec app npx prisma migrate dev
docker compose exec app npm run db:seed
```

### Performance lenta

- Feche abas desnecessárias no VS Code
- Use `docker compose down` quando não estiver desenvolvendo
- Limpe containers antigos: `docker system prune`

## 🎨 Estrutura de Desenvolvimento

```
🏗️ Container (onde tudo roda)
├── Node.js + dependências
├── Next.js
├── Prisma + PostgreSQL
└── Todas as ferramentas

💻 Local (VS Code)
├── Código fonte
├── Git
├── Tasks customizadas
└── Snippets otimizados
```

## ✨ Resultado Final

Com essas configurações você consegue:

- ✅ Desenvolvimento fluido com Docker
- ✅ Comandos rápidos via Tasks
- ✅ Snippets para código comum
- ✅ Performance otimizada
- ✅ Ignorar "erros" falsos do TypeScript

---

**Lembre-se**: Os "erros" de import no VS Code são cosméticos. Se o container roda, está tudo funcionando! 🎉
