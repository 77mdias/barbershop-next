# 🔧 Correção do Docker Manager - Prisma Studio

## Problema Identificado

O script `docker-manager.sh` estava falhando ao executar o comando `studio dev` com o erro:
```bash
unknown flag: --profile
```

## Causa Raiz

O problema estava na função `docker_studio()` que tentava usar a flag `--profile` sem especificar o arquivo docker-compose correto, além de ter uma arquitetura com serviços duplicados no docker-compose.yml.

### Problemas encontrados:

1. **Comando sem arquivo específico**: 
   ```bash
   docker compose up -d --profile studio  # ❌ Sem -f arquivo
   ```

2. **Serviços duplicados**: O `docker-compose.yml` tinha dois serviços tentando usar a porta 5555:
   - `app` (serviço principal)
   - `prisma-studio` (serviço com profile)

3. **Conflito de portas**: Ambos os serviços tentavam bind na porta 5555

## Solução Implementada

### 1. Correção do Script (`docker-manager.sh`)

**Antes:**
```bash
docker_studio() {
    # ...
    docker compose up -d --profile studio  # ❌
    # ...
}
```

**Depois:**
```bash
docker_studio() {
    # ...
    local compose_file=$(get_compose_file dev)
    
    # Verificar se o container app está rodando
    if ! docker compose -f $compose_file ps app | grep -q "running"; then
        docker compose -f $compose_file up -d app
    fi
    
    # Executar Prisma Studio no container app existente
    docker compose -f $compose_file exec -d app npx prisma studio --port 5555 --hostname 0.0.0.0
    # ...
}
```

### 2. Simplificação do Docker Compose

**Removido** o serviço `prisma-studio` duplicado do `docker-compose.yml`, mantendo apenas o serviço `app` que já expõe a porta 5555.

## Benefícios da Correção

1. **✅ Eliminação de conflitos**: Não há mais duplicação de serviços
2. **✅ Melhor performance**: Reutiliza o container app existente
3. **✅ Mais estável**: Menos pontos de falha
4. **✅ Mais simples**: Arquitetura mais limpa

## Como Usar

```bash
# Abrir Prisma Studio (agora funcionando)
./scripts/docker-manager.sh studio dev

# O Prisma Studio estará disponível em:
# http://localhost:5555
```

## Arquitetura Final

```
┌─────────────────┐    ┌─────────────────┐
│   Container     │    │   Container     │
│   app           │    │   db            │
│                 │    │                 │
│ - Next.js :3000 │◄───┤ - PostgreSQL    │
│ - Prisma Studio │    │   :5432         │
│   :5555         │    │                 │
└─────────────────┘    └─────────────────┘
```

## Testes Realizados

1. ✅ `./scripts/docker-manager.sh studio dev` - Funciona
2. ✅ `http://localhost:5555` - Prisma Studio carrega
3. ✅ Conexão com banco de dados funcional
4. ✅ Não há conflitos de porta

---

**Data da correção**: 3 de outubro de 2025  
**Problema original**: `unknown flag: --profile`  
**Status**: ✅ Resolvido