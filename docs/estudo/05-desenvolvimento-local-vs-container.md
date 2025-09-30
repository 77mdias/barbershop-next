# 📚 Estudo 05 - Desenvolvimento Local vs Container: Quando Usar Cada Um?

## 🎯 Sua Dúvida Principal

> "Preciso instalar e gerar o Prisma no container do Docker, mas eu também já tinha instalado e gerado o Prisma no lado de desenvolvimento (do Next). É necessário eu ter os dois ou eu posso deixar para gerar sempre o banco de dados em container?"

**Resposta Direta:** Você pode escolher uma das três estratégias abaixo. Vou explicar cada uma com prós e contras.

---

## 🔄 Três Estratégias Possíveis

### 1. 🖥️ **Desenvolvimento 100% Local**
### 2. 🐳 **Desenvolvimento 100% Container**  
### 3. 🔀 **Desenvolvimento Híbrido** (Recomendado)

---

## 🖥️ Estratégia 1: Desenvolvimento 100% Local

### 🏗️ **Como Funciona:**
```
Seu Computador
├── Node.js (instalado localmente)
├── npm packages (node_modules local)
├── Prisma Client (gerado localmente)
├── Banco PostgreSQL (local ou remoto)
└── Next.js (rodando em localhost:3000)
```

### 🔧 **Configuração:**
```bash
# 1. Instalar dependências localmente
npm install

# 2. Configurar banco (local ou remoto)
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/barbershop"

# 3. Gerar Prisma Client localmente
npx prisma generate

# 4. Rodar migrations
npx prisma migrate dev

# 5. Iniciar aplicação
npm run dev
```

### ✅ **Vantagens:**
- **Velocidade**: Hot-reload instantâneo
- **Simplicidade**: Não precisa entender Docker
- **Debugging**: Fácil de debuggar com breakpoints
- **IDE**: Auto-complete funciona perfeitamente
- **Recursos**: Usa menos CPU/RAM

### ❌ **Desvantagens:**
- **"Funciona na minha máquina"**: Pode não funcionar em outros computadores
- **Dependências**: Precisa instalar Node.js, PostgreSQL, etc.
- **Conflitos**: Versões diferentes podem causar problemas
- **Deploy**: Diferenças entre desenvolvimento e produção

### 🎯 **Quando Usar:**
- ✅ Você está **aprendendo** e quer focar no código
- ✅ Projeto **pessoal** ou **pequeno**
- ✅ Equipe **pequena** com ambiente similar
- ✅ Prototipagem **rápida**

---

## 🐳 Estratégia 2: Desenvolvimento 100% Container

### 🏗️ **Como Funciona:**
```
Container Docker
├── Node.js (versão fixa)
├── npm packages (dentro do container)
├── Prisma Client (gerado no container)
├── Banco PostgreSQL (container separado)
└── Next.js (rodando no container)
```

### 🔧 **Configuração:**
```bash
# 1. Apenas Docker Compose
docker-compose up app

# 2. Tudo acontece dentro do container
# - npm install (automático)
# - prisma generate (automático)
# - npm run dev (automático)
```

### ✅ **Vantagens:**
- **Consistência**: Ambiente idêntico para todos
- **Isolamento**: Não "suja" seu computador
- **Deploy**: Ambiente de desenvolvimento = produção
- **Simplicidade**: Um comando para tudo
- **Escalabilidade**: Fácil adicionar serviços (Redis, etc.)

### ❌ **Desvantagens:**
- **Performance**: Hot-reload mais lento
- **Complexidade**: Precisa entender Docker
- **Debugging**: Mais difícil debuggar
- **Recursos**: Usa mais CPU/RAM
- **Curva de aprendizado**: Docker + Docker Compose

### 🎯 **Quando Usar:**
- ✅ Trabalhando em **equipe**
- ✅ Projeto **profissional** ou **complexo**
- ✅ Múltiplos **serviços** (banco, cache, etc.)
- ✅ Preparando para **deploy em produção**

---

## 🔀 Estratégia 3: Desenvolvimento Híbrido (Recomendado)

### 🏗️ **Como Funciona:**
```
Desenvolvimento Diário:
├── Node.js (local)
├── Next.js (local - localhost:3000)
├── Prisma Client (local)
└── Banco PostgreSQL (container)

Testes e Deploy:
└── Tudo em containers
```

### 🔧 **Configuração:**

#### **1. Banco em Container:**
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: barbershop
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

#### **2. Desenvolvimento Local:**
```bash
# 1. Subir apenas o banco
docker-compose up db

# 2. Configurar .env para banco em container
DATABASE_URL="postgresql://user:pass@localhost:5432/barbershop"

# 3. Desenvolvimento normal
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### **3. Testes em Container:**
```bash
# Quando quiser testar em container
docker-compose up app
```

### ✅ **Vantagens:**
- **Melhor dos dois mundos**: Velocidade + Consistência
- **Flexibilidade**: Pode alternar entre local e container
- **Banco isolado**: Dados não se perdem
- **Aprendizado gradual**: Começa simples, evolui para complexo

### ❌ **Desvantagens:**
- **Configuração dupla**: Precisa manter ambos funcionando
- **Complexidade**: Mais conceitos para entender

### 🎯 **Quando Usar:**
- ✅ **Aprendendo Docker** mas quer produtividade
- ✅ **Transição** de desenvolvimento local para container
- ✅ **Equipe mista** (alguns usam local, outros container)
- ✅ **Projetos médios** com necessidade de flexibilidade

---

## 🔍 Comparação Detalhada: Prisma

### 📊 **Onde o Prisma Client é Gerado:**

| Estratégia | Prisma Client | Comando | Onde Roda |
|------------|---------------|---------|-----------|
| **Local** | `node_modules/.prisma/client/` | `npx prisma generate` | Seu computador |
| **Container** | `/app/src/generated/prisma/` | `RUN npx prisma generate` | Dentro do container |
| **Híbrido** | Ambos os lugares | Ambos os comandos | Ambos os lugares |

### 🔄 **Fluxo de Mudanças no Schema:**

#### **Desenvolvimento Local:**
```bash
# 1. Editar prisma/schema.prisma
# 2. Gerar migration
npx prisma migrate dev --name add-new-field
# 3. Gerar cliente
npx prisma generate
# 4. Usar no código
```

#### **Desenvolvimento Container:**
```bash
# 1. Editar prisma/schema.prisma
# 2. Rebuild container
docker-compose up --build app
# (migration e generate acontecem automaticamente)
```

#### **Desenvolvimento Híbrido:**
```bash
# 1. Editar prisma/schema.prisma
# 2. Local: npx prisma migrate dev
# 3. Local: npx prisma generate
# 4. Container: docker-compose up --build app (quando necessário)
```

---

## 🎯 Recomendação Para Você

### 📚 **Como Estudante:**

**Fase 1 - Aprendendo (1-2 meses):**
- Use **Desenvolvimento Local**
- Foque em aprender Next.js, Prisma, TypeScript
- Docker pode esperar

**Fase 2 - Evoluindo (2-4 meses):**
- Migre para **Desenvolvimento Híbrido**
- Banco em container, código local
- Aprenda Docker gradualmente

**Fase 3 - Profissional (4+ meses):**
- Use **Desenvolvimento Container**
- Prepare-se para trabalhar em equipe
- Domine Docker completamente

### 🔧 **Configuração Recomendada Agora:**

```bash
# 1. Manter desenvolvimento local funcionando
npm install
npx prisma generate
npm run dev

# 2. Ter container como backup/teste
docker-compose up app  # Quando quiser testar

# 3. Usar container para deploy
docker-compose up app-prod
```

---

## 🐛 Problemas e Soluções

### 1. **"Prisma Client não sincronizado"**

**Problema:**
- Cliente local diferente do container

**Solução:**
```bash
# Regenerar em ambos os lugares
npx prisma generate                    # Local
docker-compose exec app npx prisma generate  # Container
```

### 2. **"Banco de dados não encontrado"**

**Problema:**
- Configuração de DATABASE_URL diferente

**Solução:**
```bash
# Local: .env
DATABASE_URL="postgresql://user:pass@localhost:5432/barbershop"

# Container: .env
DATABASE_URL="postgresql://user:pass@db:5432/barbershop"
```

### 3. **"Mudanças não aparecem"**

**Problema:**
- Cache ou volumes desatualizados

**Solução:**
```bash
# Local: Restart do servidor
# Container: Rebuild
docker-compose up --build app
```

---

## 📝 Anotações Pessoais

### ❓ Dúvidas Levantadas:
- Posso usar as duas abordagens ao mesmo tempo?
- Como sincronizar mudanças entre local e container?
- Qual é mais rápido para desenvolvimento?

### 💡 Soluções Testadas:
- Testei desenvolvimento local → muito rápido
- Testei desenvolvimento container → mais lento mas consistente
- Testei híbrido → melhor equilíbrio

### 🚀 Aprendizados Finais:
- Não existe "certo" ou "errado", apenas trade-offs
- Desenvolvimento local é melhor para aprender
- Container é melhor para produção
- Híbrido oferece flexibilidade
- A escolha depende do contexto e experiência

---

## 🔗 Próximos Estudos:
- [ ] Como configurar banco PostgreSQL em container
- [ ] Estratégias de debugging em containers
- [ ] Otimizações de performance para desenvolvimento
- [ ] Migração gradual de local para container