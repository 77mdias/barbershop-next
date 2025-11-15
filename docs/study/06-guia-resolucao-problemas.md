# 📚 Estudo 06 - Guia de Resolução de Problemas

## 🎯 Como Usar Este Guia

Este guia segue a metodologia de **diagnóstico estruturado**:

1. **🔍 Identificar o problema** (sintomas)
2. **🤔 Levantar hipóteses** (possíveis causas)
3. **🔧 Testar soluções** (uma por vez)
4. **✅ Verificar resultado** (funcionou?)
5. **📝 Documentar aprendizado** (para próxima vez)

---

## 🐛 Problemas com Prisma

### 1. **"@prisma/client did not initialize yet"**

#### 🔍 **Sintomas:**
```
Error: @prisma/client did not initialize yet. 
Please run "prisma generate" and try to import it again.
```

#### 🤔 **Possíveis Causas:**
1. Prisma Client não foi gerado
2. Caminho de import incorreto
3. Cliente gerado em local diferente do esperado
4. Cache desatualizado

#### 🔧 **Soluções:**

**Solução 1: Gerar Prisma Client**
```bash
# Local
npx prisma generate

# Container
docker-compose exec app npx prisma generate
```

**Solução 2: Verificar caminho de import**
```typescript
// ❌ Errado (se cliente está em pasta customizada)
import { PrismaClient } from "@prisma/client";

// ✅ Correto (se cliente está em src/generated)
import { PrismaClient } from "@/generated/prisma";
```

**Solução 3: Verificar configuração do schema**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"  // ← Verificar este caminho
}
```

**Solução 4: Limpar cache e regenerar**
```bash
# Remover cliente gerado
rm -rf node_modules/.prisma
rm -rf src/generated

# Reinstalar e regenerar
npm install
npx prisma generate
```

---

### 2. **"Environment variable not found: DATABASE_URL"**

#### 🔍 **Sintomas:**
```
Error: Environment variable not found: DATABASE_URL
```

#### 🤔 **Possíveis Causas:**
1. Arquivo `.env` não existe
2. Variável não está definida no `.env`
3. Arquivo `.env` não está sendo carregado
4. Sintaxe incorreta no `.env`

#### 🔧 **Soluções:**

**Solução 1: Criar/verificar arquivo .env**
```bash
# Verificar se arquivo existe
ls -la .env

# Criar se não existir
cp .env.example .env
```

**Solução 2: Verificar conteúdo do .env**
```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/barbershop"
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

**Solução 3: Verificar sintaxe**
```env
# ❌ Errado
DATABASE_URL = postgresql://...  # Espaços ao redor do =
DATABASE_URL="postgresql://...   # Aspas não fechadas

# ✅ Correto
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
```

**Solução 4: Verificar carregamento no Next.js**
```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
```

---

### 3. **"Can't reach database server"**

#### 🔍 **Sintomas:**
```
Error: Can't reach database server at `localhost:5432`
```

#### 🤔 **Possíveis Causas:**
1. Banco de dados não está rodando
2. Porta incorreta
3. Credenciais incorretas
4. Host incorreto (localhost vs container name)

#### 🔧 **Soluções:**

**Solução 1: Verificar se banco está rodando**
```bash
# Verificar processos PostgreSQL
ps aux | grep postgres

# Verificar portas em uso
lsof -i :5432

# Iniciar PostgreSQL (se local)
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

**Solução 2: Verificar configuração de conexão**
```env
# Para desenvolvimento local
DATABASE_URL="postgresql://user:pass@localhost:5432/barbershop"

# Para container (app conectando com banco em container)
DATABASE_URL="postgresql://user:pass@db:5432/barbershop"
```

**Solução 3: Testar conexão manualmente**
```bash
# Testar conexão com psql
psql "postgresql://user:pass@localhost:5432/barbershop"

# Testar com Docker
docker run --rm postgres:15 psql "postgresql://user:pass@host.docker.internal:5432/barbershop"
```

---

## 🐳 Problemas com Docker

### 1. **"Port already in use"**

#### 🔍 **Sintomas:**
```
Error: Port 3000 is already in use
```

#### 🤔 **Possíveis Causas:**
1. Outro processo usando a porta
2. Container anterior ainda rodando
3. Aplicação local rodando na mesma porta

#### 🔧 **Soluções:**

**Solução 1: Identificar processo usando a porta**
```bash
# Encontrar processo
lsof -ti:3000

# Matar processo
lsof -ti:3000 | xargs kill -9
```

**Solução 2: Parar containers Docker**
```bash
# Parar todos os containers
docker-compose down

# Parar container específico
docker stop nome-do-container
```

**Solução 3: Usar porta diferente**
```yaml
# docker-compose.yml
services:
  app:
    ports:
      - "3001:3000"  # Usar 3001 em vez de 3000
```

---

### 2. **"No space left on device"**

#### 🔍 **Sintomas:**
```
Error: No space left on device
```

#### 🤔 **Possíveis Causas:**
1. Muitas imagens Docker acumuladas
2. Containers parados ocupando espaço
3. Volumes não utilizados
4. Cache de build muito grande

#### 🔧 **Soluções:**

**Solução 1: Limpeza básica**
```bash
# Remover containers parados
docker container prune

# Remover imagens não utilizadas
docker image prune

# Remover volumes não utilizados
docker volume prune
```

**Solução 2: Limpeza completa**
```bash
# Remover tudo não utilizado
docker system prune -a

# Verificar espaço usado
docker system df
```

**Solução 3: Limpeza específica**
```bash
# Listar imagens por tamanho
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Remover imagem específica
docker rmi nome-da-imagem
```

---

### 3. **"Container exits immediately"**

#### 🔍 **Sintomas:**
```
Container barbershop-app-1 exited with code 1
```

#### 🤔 **Possíveis Causas:**
1. Erro na aplicação
2. Comando incorreto no Dockerfile
3. Dependências não instaladas
4. Variáveis de ambiente faltando

#### 🔧 **Soluções:**

**Solução 1: Ver logs do container**
```bash
# Ver logs
docker-compose logs app

# Ver logs em tempo real
docker-compose logs -f app
```

**Solução 2: Executar container interativamente**
```bash
# Entrar no container para debuggar
docker-compose run app bash

# Executar comandos manualmente
npm install
npm run dev
```

**Solução 3: Verificar Dockerfile**
```dockerfile
# Verificar se comando está correto
CMD ["npm", "run", "dev"]  # ✅ Correto
CMD npm run dev            # ❌ Pode dar problema
```

---

## 🔧 Problemas com Next.js

### 1. **"Module not found"**

#### 🔍 **Sintomas:**
```
Error: Module not found: Can't resolve '@/lib/prisma'
```

#### 🤔 **Possíveis Causas:**
1. Caminho incorreto
2. Alias não configurado
3. Arquivo não existe
4. Extensão de arquivo incorreta

#### 🔧 **Soluções:**

**Solução 1: Verificar se arquivo existe**
```bash
# Verificar estrutura de pastas
ls -la src/lib/

# Verificar arquivo específico
ls -la src/lib/prisma.ts
```

**Solução 2: Verificar configuração de alias**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Solução 3: Verificar import**
```typescript
// ❌ Errado
import { prisma } from '@/lib/prisma.js';

// ✅ Correto
import { prisma } from '@/lib/prisma';
```

---

### 2. **"Hydration failed"**

#### 🔍 **Sintomas:**
```
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

#### 🤔 **Possíveis Causas:**
1. Conteúdo diferente entre servidor e cliente
2. Uso de `Date.now()` ou `Math.random()`
3. Condições baseadas em `window` ou `document`
4. Estado inicial inconsistente

#### 🔧 **Soluções:**

**Solução 1: Usar useEffect para código client-side**
```typescript
// ❌ Errado
function Component() {
  const time = new Date().toLocaleString();
  return <div>{time}</div>;
}

// ✅ Correto
function Component() {
  const [time, setTime] = useState('');
  
  useEffect(() => {
    setTime(new Date().toLocaleString());
  }, []);
  
  return <div>{time}</div>;
}
```

**Solução 2: Usar dynamic import com ssr: false**
```typescript
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
);
```

---

## 🔄 Metodologia de Debugging

### 1. **Coleta de Informações**
```bash
# Logs da aplicação
docker-compose logs app

# Status dos containers
docker-compose ps

# Processos rodando
ps aux | grep node

# Portas em uso
lsof -i :3000
```

### 2. **Teste Isolado**
```bash
# Testar apenas o banco
docker-compose up db

# Testar apenas a aplicação
npm run dev

# Testar build
npm run build
```

### 3. **Verificação Passo a Passo**
```bash
# 1. Dependências instaladas?
ls node_modules

# 2. Prisma Client gerado?
ls src/generated/prisma

# 3. Banco acessível?
npx prisma db pull

# 4. Aplicação compila?
npm run build
```

---

## 📝 Checklist de Problemas Comuns

### ✅ **Antes de Pedir Ajuda:**

- [ ] Li a mensagem de erro completa
- [ ] Verifiquei logs do container (`docker-compose logs app`)
- [ ] Testei regenerar Prisma Client (`npx prisma generate`)
- [ ] Verifiquei se arquivo `.env` existe e está correto
- [ ] Testei limpar cache (`npm install` novamente)
- [ ] Verifiquei se portas estão livres (`lsof -i :3000`)
- [ ] Testei parar e subir containers (`docker-compose down && docker-compose up`)

### 🔧 **Comandos de Emergência:**

```bash
# Reset completo do ambiente
docker-compose down
docker system prune -a
rm -rf node_modules
npm install
npx prisma generate
docker-compose up --build
```

---

## 📝 Anotações Pessoais

### ❓ Dúvidas Levantadas:
- Como identificar rapidamente a causa de um erro?
- Qual a diferença entre erro de desenvolvimento e produção?
- Como debuggar problemas em containers?

### 💡 Soluções Testadas:
- Testei metodologia de diagnóstico → muito mais eficiente
- Testei comandos de limpeza → resolveu 80% dos problemas
- Testei logs estruturados → facilita identificação

### 🚀 Aprendizados Finais:
- Maioria dos problemas tem causa simples
- Logs são a melhor ferramenta de diagnóstico
- Limpeza de cache resolve muitos problemas
- Metodologia estruturada economiza tempo
- Documentar soluções evita repetir problemas

---

## 🔗 Recursos Adicionais:
- [Prisma Troubleshooting](https://www.prisma.io/docs/guides/other/troubleshooting)
- [Docker Debugging](https://docs.docker.com/config/containers/logging/)
- [Next.js Error Handling](https://nextjs.org/docs/advanced-features/error-handling)