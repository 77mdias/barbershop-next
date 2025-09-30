# 📚 Estudo 02 - Docker: Conceitos Fundamentais

## 🎯 O que é Docker?

Docker é uma **plataforma de containerização** que permite "empacotar" sua aplicação com todas as dependências em um **container** isolado.

### 🤔 Analogia: Docker é como uma "caixa mágica"

Imagine que você quer enviar um bolo para um amigo:

**Sem Docker:**
- Você envia apenas a receita
- Seu amigo precisa ter os mesmos ingredientes
- Pode dar errado se ele tiver farinha diferente, forno diferente, etc.

**Com Docker:**
- Você envia o bolo **já pronto** dentro de uma caixa especial
- A caixa tem tudo: bolo, prato, garfo, guardanapo
- Seu amigo só precisa abrir a caixa e comer

### 💻 Na programação:

**Sem Docker:**
```bash
# No seu computador
npm install
npm run dev  # ✅ Funciona

# No computador do colega
npm install   # ❌ Erro: versão diferente do Node
npm run dev   # ❌ Não funciona
```

**Com Docker:**
```bash
# Qualquer computador
docker run minha-app  # ✅ Sempre funciona igual
```

---

## 🏗️ Conceitos Fundamentais

### 1. **Container** 🗃️
- É uma "caixa" que roda sua aplicação
- Isolado do sistema operacional
- Tem tudo que precisa para funcionar

```
┌─────────────────────────────────┐
│         CONTAINER               │
│  ┌─────────────────────────┐    │
│  │    Sua Aplicação        │    │
│  │  (Next.js + Prisma)     │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │    Dependências         │    │
│  │  (Node.js, npm, etc)    │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │    Sistema Base         │    │
│  │      (Linux)            │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### 2. **Imagem** 📦
- É o "molde" para criar containers
- Como uma receita que gera o bolo
- Imutável (não muda depois de criada)

### 3. **Dockerfile** 📝
- Arquivo com instruções para criar a imagem
- Como uma receita passo-a-passo

### 4. **Docker Compose** 🎼
- Ferramenta para gerenciar múltiplos containers
- Como um maestro que coordena uma orquestra

---

## 🔄 Fluxo de Trabalho

```
1. Dockerfile  →  2. Imagem  →  3. Container  →  4. Aplicação Rodando
   (receita)      (molde)      (caixa)         (resultado)
```

### Exemplo prático:

```bash
# 1. Criar imagem a partir do Dockerfile
docker build -t minha-app .

# 2. Criar e rodar container a partir da imagem
docker run -p 3000:3000 minha-app

# 3. Aplicação rodando em http://localhost:3000
```

---

## 🏠 Desenvolvimento Local vs Container

### 🖥️ **Desenvolvimento Local**
```
Seu Computador
├── Node.js (versão X)
├── npm packages
├── Banco PostgreSQL local
└── Sua aplicação
```

**Vantagens:**
- ✅ Rápido para testar mudanças
- ✅ Fácil de debuggar
- ✅ Acesso direto aos arquivos

**Desvantagens:**
- ❌ "Funciona na minha máquina"
- ❌ Dependências podem conflitar
- ❌ Difícil de replicar ambiente

### 🐳 **Desenvolvimento com Container**
```
Container
├── Node.js (versão fixa)
├── npm packages (versões fixas)
├── Banco PostgreSQL (container separado)
└── Sua aplicação
```

**Vantagens:**
- ✅ Ambiente idêntico para todos
- ✅ Isolamento total
- ✅ Fácil de deployar

**Desvantagens:**
- ❌ Mais lento para mudanças
- ❌ Curva de aprendizado
- ❌ Consome mais recursos

---

## 🎯 Quando Usar Cada Um?

### 📝 **Regra Geral:**

| Situação | Recomendação |
|----------|--------------|
| **Aprendendo/Estudando** | Desenvolvimento Local |
| **Trabalhando em equipe** | Container |
| **Deploy em produção** | Container |
| **Testando rapidamente** | Desenvolvimento Local |
| **Projeto complexo** | Container |

### 🔄 **Fluxo Híbrido (Recomendado):**

1. **Desenvolver localmente** para velocidade
2. **Testar em container** antes de commit
3. **Deploy sempre em container**

---

## 📁 Estrutura de Arquivos Docker

```
projeto/
├── Dockerfile              ← Instruções para criar imagem
├── docker-compose.yml      ← Orquestração de containers
├── .dockerignore           ← Arquivos a ignorar
├── scripts/
│   └── docker-entrypoint.sh ← Script de inicialização
└── src/
    └── app/                ← Sua aplicação
```

---

## 🔧 Comandos Essenciais

### **Imagens:**
```bash
# Listar imagens
docker images

# Criar imagem
docker build -t nome-da-imagem .

# Remover imagem
docker rmi nome-da-imagem
```

### **Containers:**
```bash
# Listar containers rodando
docker ps

# Listar todos containers
docker ps -a

# Rodar container
docker run -p 3000:3000 nome-da-imagem

# Parar container
docker stop nome-do-container

# Remover container
docker rm nome-do-container
```

### **Docker Compose:**
```bash
# Subir todos os serviços
docker-compose up

# Subir em background
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Rebuild e subir
docker-compose up --build
```

---

## 🐛 Problemas Comuns e Soluções

### 1. **"Port already in use"**
```bash
# Problema: Porta 3000 já está sendo usada
Error: Port 3000 is already in use

# Solução: Usar porta diferente
docker run -p 3001:3000 minha-app
```

### 2. **"No space left on device"**
```bash
# Problema: Docker ocupou muito espaço
# Solução: Limpar containers e imagens não usadas
docker system prune -a
```

### 3. **"Container exits immediately"**
```bash
# Problema: Container para logo após iniciar
# Solução: Ver logs para entender o erro
docker logs nome-do-container
```

---

## 🎓 Conceitos Avançados

### **Volumes** 📂
- Compartilham arquivos entre host e container
- Dados persistem mesmo se container for removido

```bash
# Montar pasta local no container
docker run -v /caminho/local:/caminho/container minha-app
```

### **Networks** 🌐
- Permitem containers se comunicarem
- Isolamento de rede

```bash
# Criar rede
docker network create minha-rede

# Conectar container à rede
docker run --network minha-rede minha-app
```

### **Environment Variables** 🔧
- Configurações que mudam entre ambientes

```bash
# Passar variável de ambiente
docker run -e DATABASE_URL="postgresql://..." minha-app
```

---

## 📝 Anotações Pessoais

### ❓ Dúvidas Levantadas:
- Por que usar Docker se já funciona localmente?
- Como containers se comunicam entre si?
- Qual a diferença entre imagem e container?

### 💡 Soluções Testadas:
- Testei `docker build` → criou imagem com sucesso
- Testei `docker run` → container rodou aplicação
- Testei `docker-compose up` → subiu app + banco juntos

### 🚀 Aprendizados Finais:
- Docker resolve o problema "funciona na minha máquina"
- Container é uma instância rodando de uma imagem
- Docker Compose facilita gerenciar múltiplos containers
- Volumes permitem persistir dados
- É uma ferramenta essencial para desenvolvimento moderno

---

## 🔗 Próximos Estudos:
- [ ] Como escrever um Dockerfile eficiente
- [ ] Configuração do docker-compose.yml
- [ ] Integração Docker + Prisma
- [ ] Estratégias de desenvolvimento local vs container