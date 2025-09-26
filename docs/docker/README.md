# 🐳 Docker e Ambiente de Desenvolvimento

Este documento explica como configurar e utilizar o ambiente Docker para o projeto Barbershop Next.js.

## Estrutura de Containers

O projeto utiliza multi-stage build para otimizar o tamanho das imagens e separar ambientes:

```
┌─────────────┐
│    deps     │ Base comum com dependências
└─────┬───────┘
      │
      ▼
┌─────────────┐     ┌─────────────┐
│     dev     │     │   builder   │ 
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    prod     │
                    └─────────────┘
```

## Estágios do Dockerfile

### 1. Estágio `deps`
- Instala todas as dependências do projeto
- Serve como base para os ambientes de desenvolvimento e produção

### 2. Estágio `dev`
- Ambiente de desenvolvimento com hot-reload
- Monta volumes para desenvolvimento ativo
- Executa `npm run dev`

### 3. Estágio `builder`
- Compila a aplicação Next.js
- Gera arquivos estáticos e otimizados

### 4. Estágio `prod`
- Imagem final de produção
- Contém apenas os arquivos necessários para execução
- Executa `npm start`

## Comandos Principais

### Iniciar ambiente de desenvolvimento
```bash
docker-compose up app
```
Acesse: http://localhost:3001

### Iniciar ambiente de produção
```bash
docker-compose up app-prod
```
Acesse: http://localhost:8080

### Reconstruir imagens
```bash
docker-compose build
```

## Volumes e Persistência

O ambiente de desenvolvimento utiliza volumes para:
- Sincronizar código-fonte: `.:/app`
- Preservar node_modules: `/app/node_modules`

## Troubleshooting

### Porta já em uso
Se a porta 3001 ou 8080 já estiver em uso, altere no arquivo `docker-compose.yml`:

```yaml
ports:
  - "NOVA_PORTA:3000"
```

### Problemas de permissão
Em sistemas Linux, pode ser necessário ajustar permissões:

```bash
sudo chown -R $(id -u):$(id -g) .
```

### Limpeza de imagens
Para remover imagens antigas e liberar espaço:

```bash
docker system prune -a
```