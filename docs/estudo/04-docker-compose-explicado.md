# 📚 Estudo 04 - Docker Compose Explicado

## 🎯 O que é Docker Compose?

**Docker Compose** é uma ferramenta para definir e executar aplicações Docker com **múltiplos containers**. É como um "maestro" que coordena uma orquestra de containers.

### 🤔 Analogia: Orquestra Musical

**Sem Docker Compose:**
```bash
# Você precisa "reger" cada músico individualmente
docker run -p 5432:5432 postgres        # Violinista
docker run -p 6379:6379 redis           # Pianista  
docker run -p 3000:3000 minha-app       # Cantor
```

**Com Docker Compose:**
```yaml
# Um maestro coordena todos de uma vez
services:
  postgres: ...    # Violinista
  redis: ...       # Pianista
  app: ...         # Cantor
```

```bash
docker-compose up  # 🎼 "Todos juntos, agora!"
```

---

## 🏗️ Estrutura do Arquivo

### 📝 **Anatomia Básica:**
```yaml
version: "3.8"          # Versão do Docker Compose
services:               # Lista de containers
  nome-do-servico:      # Nome do container
    build: ...          # Como construir
    ports: ...          # Portas expostas
    volumes: ...        # Arquivos compartilhados
    environment: ...    # Variáveis de ambiente
```

---

## 📝 Análise Linha por Linha

### 🔧 **Configuração Global**

```yaml
version: "3.8"
```
**O que faz:**
- Define versão do Docker Compose
- Versão 3.8 suporta recursos modernos
- **Importante**: Versões diferentes têm recursos diferentes

```yaml
services:
```
**O que faz:**
- Inicia seção de definição de containers
- Cada item aqui será um container separado

---

### 🛠️ **Serviço: app (Desenvolvimento)**

```yaml
app:
```
**O que faz:**
- Define um serviço chamado "app"
- Nome usado para referenciar este container

```yaml
build:
  context: .
  target: dev
```
**O que faz:**
- `context: .`: Usa diretório atual como contexto de build
- `target: dev`: Usa estágio "dev" do Dockerfile multi-stage
- **Resultado**: Constrói imagem para desenvolvimento

```yaml
environment:
  - NODE_ENV=development
```
**O que faz:**
- Define variável de ambiente dentro do container
- `NODE_ENV=development`: Informa que é ambiente de desenvolvimento
- **Efeito**: Next.js ativa hot-reload, logs detalhados, etc.

```yaml
ports:
  - "3001:3000"
```
**O que faz:**
- Mapeia porta do host para porta do container
- `3001` (host) → `3000` (container)
- **Acesso**: `http://localhost:3001` no seu navegador

**💡 Por que 3001 e não 3000?**
- Evita conflito se você rodar Next.js localmente na 3000
- Permite desenvolvimento híbrido (local + container)

```yaml
volumes:
  - .:/app:delegated
  - /app/node_modules
```
**O que faz:**
1. `.:/app:delegated`: Monta diretório atual no `/app` do container
   - **Efeito**: Mudanças no código são refletidas instantaneamente
   - `delegated`: Otimização para macOS/Windows
2. `/app/node_modules`: Volume anônimo para node_modules
   - **Efeito**: Evita conflito entre node_modules local e do container

**🔍 Explicação Detalhada dos Volumes:**

```
Seu Computador          Container
├── src/               ├── /app/src/           ← Sincronizado
├── package.json  ────▶├── /app/package.json   ← Sincronizado  
├── node_modules/      ├── /app/node_modules/  ← Isolado (volume)
└── .env          ────▶└── /app/.env           ← Sincronizado
```

```yaml
user: "${UID:-1000}:${GID:-1000}"
```
**O que faz:**
- Define usuário que executa processos no container
- `${UID:-1000}`: Usa UID do sistema ou 1000 como padrão
- `${GID:-1000}`: Usa GID do sistema ou 1000 como padrão
- **Objetivo**: Evitar problemas de permissão de arquivos

```yaml
env_file:
  - .env
```
**O que faz:**
- Carrega variáveis de ambiente do arquivo `.env`
- **Conteúdo típico**: `DATABASE_URL`, `NEXTAUTH_SECRET`, etc.

```yaml
command: npm run dev
```
**O que faz:**
- Sobrescreve comando padrão do Dockerfile
- Executa `npm run dev` em vez do `CMD` definido no Dockerfile

---

### 🚀 **Serviço: app-prod (Produção)**

```yaml
app-prod:
```
**O que faz:**
- Define serviço separado para produção
- **Vantagem**: Pode testar produção localmente

```yaml
build:
  context: .
  target: prod
```
**O que faz:**
- Usa mesmo Dockerfile, mas estágio "prod"
- **Resultado**: Imagem otimizada para produção

```yaml
environment:
  - NODE_ENV=production
```
**O que faz:**
- Define ambiente como produção
- **Efeito**: Next.js otimiza performance, remove logs de debug

```yaml
ports:
  - "8080:3000"
```
**O que faz:**
- Mapeia porta 8080 do host para 3000 do container
- **Acesso**: `http://localhost:8080`
- **Diferente do dev**: Evita conflito de portas

```yaml
env_file:
  - .env.production
```
**O que faz:**
- Carrega variáveis específicas de produção
- **Exemplo**: URLs de banco de produção, chaves de API diferentes

```yaml
restart: always
```
**O que faz:**
- Reinicia container automaticamente se ele parar
- **Importante**: Apenas para produção, não para desenvolvimento

---

## 🎯 Comandos Essenciais

### 🛠️ **Desenvolvimento:**
```bash
# Subir apenas serviço de desenvolvimento
docker-compose up app

# Subir em background
docker-compose up -d app

# Rebuild e subir
docker-compose up --build app

# Ver logs
docker-compose logs app

# Parar
docker-compose down
```

### 🚀 **Produção:**
```bash
# Subir serviço de produção
docker-compose up app-prod

# Subir em background
docker-compose up -d app-prod
```

### 🔧 **Utilitários:**
```bash
# Listar serviços rodando
docker-compose ps

# Executar comando no container
docker-compose exec app bash

# Ver logs em tempo real
docker-compose logs -f app

# Parar todos os serviços
docker-compose down

# Remover volumes também
docker-compose down -v
```

---

## 🔍 Configurações Avançadas

### 1. **Dependências entre Serviços**
```yaml
services:
  app:
    depends_on:
      - database
      - redis
  
  database:
    image: postgres:15
  
  redis:
    image: redis:7
```

### 2. **Networks Customizadas**
```yaml
services:
  app:
    networks:
      - frontend
      - backend
  
networks:
  frontend:
  backend:
```

### 3. **Volumes Nomeados**
```yaml
services:
  app:
    volumes:
      - app_data:/app/data

volumes:
  app_data:
```

---

## 🔄 Fluxos de Trabalho

### 🛠️ **Desenvolvimento Típico:**

1. **Primeira vez:**
```bash
docker-compose up --build app
```

2. **Desenvolvimento diário:**
```bash
docker-compose up app  # Rápido, usa cache
```

3. **Mudou dependências:**
```bash
docker-compose up --build app
```

4. **Limpeza:**
```bash
docker-compose down
docker system prune
```

### 🚀 **Deploy de Produção:**

1. **Testar localmente:**
```bash
docker-compose up app-prod
```

2. **Deploy real:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐛 Problemas Comuns e Soluções

### 1. **"Port already in use"**
```bash
# Problema: Porta 3001 já está sendo usada
Error: Port 3001 is already in use

# Solução 1: Mudar porta no docker-compose.yml
ports:
  - "3002:3000"

# Solução 2: Parar processo que usa a porta
lsof -ti:3001 | xargs kill -9
```

### 2. **"Permission denied"**
```bash
# Problema: Arquivos criados com permissão errada
# Solução: Configurar user no docker-compose.yml
user: "${UID:-1000}:${GID:-1000}"
```

### 3. **"Volume not updating"**
```bash
# Problema: Mudanças no código não aparecem
# Solução: Verificar volumes no docker-compose.yml
volumes:
  - .:/app:delegated  # ← Deve estar presente
```

### 4. **"Environment variables not loaded"**
```bash
# Problema: Variáveis do .env não funcionam
# Solução: Verificar env_file no docker-compose.yml
env_file:
  - .env  # ← Arquivo deve existir
```

---

## 🎓 Conceitos Importantes

### ✅ **Diferenças: docker run vs docker-compose**

| Aspecto | docker run | docker-compose |
|---------|------------|----------------|
| **Complexidade** | Simples | Múltiplos containers |
| **Configuração** | Linha de comando | Arquivo YAML |
| **Reutilização** | Difícil | Fácil |
| **Orquestração** | Manual | Automática |

### ✅ **Desenvolvimento vs Produção**

| Configuração | Desenvolvimento | Produção |
|--------------|-----------------|----------|
| **Target** | `dev` | `prod` |
| **Volumes** | Código sincronizado | Apenas dados |
| **Restart** | Não | `always` |
| **Logs** | Verbosos | Otimizados |
| **Porta** | 3001 | 8080 |

---

## 📝 Anotações Pessoais

### ❓ Dúvidas Levantadas:
- Por que usar dois serviços (app e app-prod)?
- O que são volumes e por que são importantes?
- Como funciona o mapeamento de portas?

### 💡 Soluções Testadas:
- Testei `docker-compose up app` → funcionou perfeitamente
- Testei mudança no código → hot-reload funcionou
- Testei `docker-compose up app-prod` → versão otimizada

### 🚀 Aprendizados Finais:
- Docker Compose simplifica gerenciamento de containers
- Volumes permitem desenvolvimento em tempo real
- Separação dev/prod permite testar ambos localmente
- Configuração declarativa é mais fácil que comandos manuais
- É essencial para projetos com múltiplos serviços

---

## 🔗 Próximos Estudos:
- [ ] Quando usar desenvolvimento local vs container
- [ ] Como adicionar banco de dados ao docker-compose
- [ ] Estratégias de debugging em containers
- [ ] Otimizações de performance