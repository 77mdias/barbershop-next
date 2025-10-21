# ⚡ Guia Rápido - Barbershop Next

> **Para quem tem pressa**: Começe em 5 minutos! ⏱️

---

## 🚀 Setup Ultra-Rápido (Docker)

```bash
# 1. Clone
git clone https://github.com/77mdias/barbershop-next.git && cd barbershop-next

# 2. Configure
cp .env.example .env.development

# 3. Inicie tudo
npm run docker:dev

# 4. Migrações + Seed
npm run docker:dev:migrate && npm run docker:dev:seed

# 5. Acesse http://localhost:3000
```

**Pronto!** Aplicação rodando em ~3 minutos. 🎉

---

## 📚 Primeiros Passos

### Logins de Teste

```
Admin:    admin@barbershop.com / admin123
Barbeiro: joao@barbershop.com / barbeiro123
Cliente:  carlos@email.com / cliente123
```

### URLs Importantes

| Serviço | URL |
|---------|-----|
| **App** | http://localhost:3000 |
| **Prisma Studio** | http://localhost:5555 |
| **Health Check** | http://localhost:3000/api/health |

---

## 🛠️ Comandos Essenciais

```bash
# Ver logs
npm run docker:dev:logs

# Acessar shell
npm run docker:dev:shell

# Parar containers
npm run docker:dev:down

# Prisma Studio
npm run docker:dev:studio

# Status
npm run docker:status
```

---

## 📖 Próximos Passos

1. **Explorar**: Navegue pela aplicação
2. **Código**: Veja `/src/app` e `/src/components`
3. **Documentação**: Leia [PROJECT-STATUS.md](./PROJECT-STATUS.md)
4. **Contribuir**: Veja [CONTRIBUTING.md](./CONTRIBUTING.md)
5. **Task**: Escolha em [TASKS.md](./docs/development/TASKS.md)

---

## 🆘 Problemas?

**Docker não inicia?**
```bash
sudo systemctl start docker
```

**Porta ocupada?**
```bash
sudo netstat -tulpn | grep :3000
# Mate o processo ou mude a porta
```

**Banco não conecta?**
```bash
# Aguarde 10s e tente novamente
sleep 10 && npm run docker:dev:migrate
```

**Mais ajuda**: [TROUBLESHOOTING.md](./docs/docker/README.md#solução-de-problemas)

---

## 📚 Documentação Completa

- **[README.md](./README.md)** - Overview completo
- **[PROJECT-STATUS.md](./PROJECT-STATUS.md)** - Status do projeto
- **[SETUP-DOCKER.md](./SETUP-DOCKER.md)** - Setup detalhado
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Como contribuir

---

**Começou bem? Agora faça sua primeira contribuição!** 🎯

1. Escolha issue `good first issue` em [TASKS.md](./docs/development/TASKS.md)
2. Leia [CONTRIBUTING.md](./CONTRIBUTING.md)
3. Faça um fork e manda ver! 🚀
