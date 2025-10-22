# 🐳 DEVCONTAINER - GUIA RÁPIDO

## 🚀 Início Rápido

### 1. Abrir no DevContainer

1. Instale a extensão **Dev Containers** no VS Code
2. Abra o projeto no VS Code
3. `Ctrl+Shift+P` → **"Dev Containers: Reopen in Container"**
4. Aguarde a configuração automática (2-5 minutos na primeira vez)

### 2. Verificar se está funcionando

- ✅ Aplicação: http://localhost:3000
- ✅ Prisma Studio: http://localhost:5555
- ✅ Terminal com `node --version` deve funcionar

## ⚡ Comandos Essenciais

### No Terminal do VS Code (dentro do container):

```bash
# Desenvolvimento
npm run dev                    # Iniciar aplicação
npm run db:studio             # Abrir Prisma Studio

# Database
npx prisma migrate dev        # Nova migração
npm run db:seed              # Popular com dados
npx prisma studio            # Interface do banco

# Código
npm run lint:fix             # Corrigir problemas
npm run type-check           # Verificar tipos
npm test                     # Executar testes
```

### Script Utilitário:

```bash
# Use o gerenciador do devcontainer
./.devcontainer/devcontainer-manager.sh help
./.devcontainer/devcontainer-manager.sh setup
./.devcontainer/devcontainer-manager.sh start
```

## 🎯 Tarefas do VS Code

`Ctrl+Shift+P` → **"Tasks: Run Task"** → Escolha:

- 🚀 Iniciar Aplicação
- 📊 Prisma Studio
- 🔄 Prisma Migrate Dev
- 🌱 Seed Database
- 🧹 Lint & Format

## 🐛 Debug

### Configurações disponíveis:

- **Debug Next.js App**: Debug completo da aplicação
- **Debug Jest Tests**: Debug de testes
- **Debug Current File**: Debug do arquivo atual

### Como usar:

1. `F5` ou `Ctrl+Shift+D`
2. Escolha a configuração
3. Clique em ▶️ ou `F5`

## 📁 Estrutura Adicionada

```
.devcontainer/
├── devcontainer.json          # Configuração principal
├── docker-compose.devcontainer.yml # Overrides para dev
├── tasks.json                 # Tarefas do VS Code
├── launch.json               # Configurações de debug
├── setup.sh                  # Script de inicialização
├── devcontainer-manager.sh   # Utilitário de gerenciamento
├── settings.json             # Configurações específicas
├── snippets.json             # Snippets de código
├── .env.example              # Template de variáveis
└── README.md                 # Documentação completa
```

## 🔧 Problemas Comuns

### Container não inicia:

```bash
Ctrl+Shift+P → "Dev Containers: Rebuild Container"
```

### Banco não conecta:

1. Verifique se PostgreSQL está rodando
2. Execute: `./.devcontainer/devcontainer-manager.sh status`

### Hot reload não funciona:

1. Verifique se a aplicação está rodando: `npm run dev`
2. Teste alterando um arquivo em `/src`

### Permissões de arquivo:

```bash
# No terminal do container:
sudo chown -R node:node /app
```

## 💡 Dicas Importantes

1. **Sempre trabalhe dentro do container** - não execute comandos npm localmente
2. **Use as tarefas do VS Code** - mais eficiente que comandos manuais
3. **Configure seu Git** - suas configs locais são montadas automaticamente
4. **Use o Prisma Studio** - interface visual muito útil para o banco
5. **Debug está configurado** - use F5 para debugar facilmente

## 🌟 Recursos Especiais

- ✅ **Hot Reload**: Mudanças refletem automaticamente
- ✅ **Cache Otimizado**: node_modules e .next em cache
- ✅ **Extensões Pré-instaladas**: Tudo que precisa para desenvolvimento
- ✅ **PostgreSQL Isolado**: Banco dedicado para desenvolvimento
- ✅ **Git Integrado**: Suas configurações e chaves SSH disponíveis
- ✅ **Snippets Personalizados**: Digite `bb` + Tab para snippets
- ✅ **Formatação Automática**: Prettier e ESLint configurados
- ✅ **IntelliSense Completo**: TypeScript, React, Prisma, Tailwind

---

🎉 **Pronto para desenvolvimento!** Seu ambiente está 100% containerizado e otimizado.
