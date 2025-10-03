# Configuração de Email - Barbershop Next.js

## 📧 Configuração Gmail para Desenvolvimento

### 1. Configurar Senha de App no Gmail

1. **Acesse sua conta Google**: https://myaccount.google.com/
2. **Vá para Segurança** > **Verificação em duas etapas**
3. **Ative a verificação em duas etapas** (se ainda não estiver ativa)
4. **Acesse "Senhas de app"**: https://myaccount.google.com/apppasswords
5. **Selecione "Mail"** e **"Outro (nome personalizado)"**
6. **Digite**: "Barbershop App" ou nome de sua escolha
7. **Copie a senha gerada** (16 caracteres)

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.development`:

```bash
# Configuração de Email (Gmail)
EMAIL_USER=seu.email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_16_caracteres
```

**⚠️ IMPORTANTE:**
- Use sua **senha de app**, não a senha normal do Gmail
- A senha de app tem 16 caracteres sem espaços
- Mantenha essas credenciais seguras e não commit no Git

### 3. Testar Configuração

1. **Reinicie o container**:
   ```bash
   npm run docker:dev:down
   npm run docker:dev
   ```

2. **Tente fazer um cadastro** na aplicação
3. **Verifique os logs**:
   ```bash
   npm run docker:dev:logs
   ```

### 4. Modo Desenvolvimento (Sem Configuração)

Se não configurar as credenciais, a aplicação funcionará em **modo mock**:
- ✅ Não trava a aplicação
- ✅ Logs mostram que o email foi "enviado" (simulado)
- ✅ Desenvolvimento continua normalmente
- ⚠️ Emails não são realmente enviados

### 5. Solução de Problemas

#### Erro: "Username and Password not accepted"
- ✅ Verifique se usa **senha de app**, não senha normal
- ✅ Verifique se a verificação em duas etapas está ativa
- ✅ Regenere a senha de app se necessário

#### Erro: "Less secure app access"
- ✅ Use **senha de app** (método recomendado)
- ❌ NÃO ative "menos seguro" (descontinuado pelo Google)

#### Container não inicia
- ✅ Verifique syntax do arquivo `.env.development`
- ✅ Não use aspas nas variáveis de ambiente
- ✅ Reinicie o container após mudanças

### 6. Configuração para Produção

Para produção, configure no `.env.production`:

```bash
# Produção - Use serviços profissionais
EMAIL_USER=noreply@seudominio.com
EMAIL_PASSWORD=senha_do_servico_profissional
```

**Serviços recomendados para produção:**
- **SendGrid** (recomendado)
- **Mailgun**
- **AWS SES**
- **Postmark**

### 7. Funcionalidades de Email

O sistema suporta:
- ✅ **Email de verificação** (cadastro)
- ✅ **Reset de senha**
- ✅ **Templates HTML responsivos**
- ✅ **Logs detalhados**
- ✅ **Fallback para desenvolvimento**

### 8. Logs e Debugging

Monitore os logs para debugar:

```bash
# Logs em tempo real
docker compose logs app -f

# Logs específicos de email
docker compose logs app | grep -i email
```

### 9. Segurança

**✅ Boas práticas implementadas:**
- Senhas de app (não senhas normais)
- TLS/SSL para conexões
- Logs não expõem credenciais
- Fallback seguro para desenvolvimento
- Timeouts configurados

**⚠️ Nunca faça:**
- Commit de credenciais no Git
- Use credenciais de produção em desenvolvimento
- Desative verificação em duas etapas
- Compartilhe senhas de app

---

## 🚀 Quick Start

1. **Configure Gmail** (passos 1-2 acima)
2. **Reinicie container**: `npm run docker:dev`
3. **Teste cadastro** na aplicação
4. **Verifique email** (ou logs em modo mock)

**Precisa de ajuda?** Verifique os logs ou consulte a documentação completa.