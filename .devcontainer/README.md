# ===============================================

# 🐳 GUIA DEVCONTAINER - BARBERSHOP NEXT.JS

# ===============================================

## 🎯 Visão Geral

Este devcontainer está configurado para desenvolvimento 100% em container, integrando perfeitamente com sua arquitetura Docker existente. Todas as ferramentas, dependências e serviços rodam dentro de containers, proporcionando um ambiente de desenvolvimento consistente e isolado.

## 🚀 Como Usar

### 1. **Abrir no DevContainer**

- Instale a extensão "Dev Containers" no VS Code
- Abra o projeto no VS Code
- Pressione `Ctrl+Shift+P` e selecione "Dev Containers: Reopen in Container"
- Aguarde a configuração automática (primeira vez pode demorar alguns minutos)

### 2. **Primeira Configuração Automática**

O devcontainer executará automaticamente:

- ✅ Instalação das dependências npm
- ✅ Geração do cliente Prisma
- ✅ Aplicação das migrações do banco
- ✅ Seed do banco de dados
- ✅ Configuração do ambiente

## 🛠️ Recursos Disponíveis

### **Extensões Pré-instaladas**

- 📝 TypeScript e JavaScript (intellisense avançado)
- ⚛️ React e Next.js (snippets e helpers)
- 🗄️ Prisma (syntax highlighting e autocomplete)
- 🎨 Tailwind CSS (autocomplete de classes)
- 🐳 Docker (gerenciamento de containers)
- 🔍 ESLint e Prettier (formatação automática)
- 📊 Thunder Client (teste de APIs)
- 🎯 Git e GitHub (controle de versão)

### **Portas Expostas**

- 🌐 **3000**: Aplicação Next.js
- 📊 **5555**: Prisma Studio
- 🗄️ **5432**: PostgreSQL

### **Tarefas Automáticas**

Pressione `Ctrl+Shift+P` > "Tasks: Run Task":

- 🚀 **Iniciar Aplicação**: `npm run dev`
- 📊 **Prisma Studio**: Interface visual do banco
- 🔄 **Prisma Migrate**: Criar novas migrações
- 🌱 **Seed Database**: Popular com dados de teste
- 🧹 **Lint & Format**: Correção automática de código
- 🏗️ **Build**: Compilar para produção

## 🔧 Configurações Especiais

### **Sincronização de Arquivos**

- ✅ Hot reload ativado para `/src` e `/public`
- ✅ Restart automático para mudanças em `package.json`
- ✅ Cache otimizado para `node_modules` e `.next`

### **Performance Otimizada**

- 🚀 Volumes em cache para melhor performance
- 🗄️ PostgreSQL otimizado para desenvolvimento
- 📦 Node modules persistentes entre rebuilds

### **Configurações do Git**

- 🔗 Suas configurações Git locais são montadas automaticamente
- 🔑 Chaves SSH disponíveis no container
- 📝 Histórico e configurações preservados

## 🐛 Debug e Desenvolvimento

### **Debug Configurations**

- 🚀 **Debug Next.js App**: Debug completo da aplicação
- 🧪 **Debug Jest Tests**: Debug de testes unitários
- 🔍 **Debug Current File**: Debug do arquivo atual
- 🌐 **Attach to Container**: Anexar a processo em execução

### **Comandos Úteis no Terminal**

```bash
# Desenvolvimento
npm run dev                 # Iniciar aplicação
npm run db:studio          # Abrir Prisma Studio

# Database
npx prisma migrate dev     # Nova migração
npx prisma db push         # Push schema (dev)
npm run db:seed           # Popular dados

# Qualidade do código
npm run lint:fix          # Corrigir problemas ESLint
npm run type-check        # Verificar tipos TypeScript
npm test                  # Executar testes
```

## 📊 Monitoramento

### **Logs e Status**

- 📋 Logs automáticos dos containers
- 🔍 Health checks do PostgreSQL
- ⚡ Restart automático em caso de falha

### **Prisma Studio**

- 🌐 Acesse em: http://localhost:5555
- 📊 Interface visual completa do banco
- ✏️ Edição de dados em tempo real
- 🔍 Queries visuais e relacionamentos

## 🛡️ Segurança e Isolamento

### **Isolamento Completo**

- 🐳 Tudo roda em containers isolados
- 🔒 Sem dependências locais necessárias
- 🌐 Network isolada para os serviços
- 📦 Cache e dados persistentes

### **Variáveis de Ambiente**

- ✅ `.env.development` carregado automaticamente
- 🔑 Secrets isolados no container
- 🌐 URLs e portas configuradas automaticamente

## 🚨 Solução de Problemas

### **Container não inicia**

```bash
# Rebuildar devcontainer
Ctrl+Shift+P > "Dev Containers: Rebuild Container"
```

### **Banco não conecta**

```bash
# Verificar status do PostgreSQL
docker compose logs db
```

### **Hot reload não funciona**

```bash
# Verificar volumes
docker compose exec app ls -la /app
```

### **Permissões de arquivo**

```bash
# Corrigir permissões
docker compose exec app chown -R node:node /app
```

## 📈 Produtividade

### **Shortcuts Úteis**

- `Ctrl+Shift+P`: Command Palette
- ` Ctrl+``  `: Abrir terminal integrado
- `F5`: Iniciar debug
- `Ctrl+Shift+D`: Abrir debug panel
- `Ctrl+J`: Toggle do painel inferior

### **Workflow Recomendado**

1. 🚀 Abra o devcontainer
2. ⚡ Execute "Iniciar Aplicação" nas tasks
3. 📊 Abra o Prisma Studio se necessário
4. 💻 Desenvolva com hot reload
5. 🧪 Execute testes regularmente
6. 📝 Commit usando Git integrado

## 🌟 Vantagens do DevContainer

- ✅ **Ambiente Consistente**: Mesmo ambiente em qualquer máquina
- 🚀 **Setup Instantâneo**: Clone e execute, sem configurações
- 🔒 **Isolamento Total**: Sem conflitos com sistema local
- 📦 **Zero Dependências**: Só precisa de Docker e VS Code
- 🔄 **Versionado**: Configuração versionada com o código
- 👥 **Colaboração**: Toda equipe usa exato mesmo ambiente

---

🎉 **Pronto para desenvolvimento!** O devcontainer está configurado e otimizado para sua aplicação barbershop. Desenvolva com confiança sabendo que está em um ambiente 100% containerizado e profissional.
