# 📧 GUIA DE CONFIGURAÇÃO DE EMAIL - Gmail

## Problema Identificado
O erro indica que as credenciais do Gmail não estão configuradas corretamente no arquivo `.env.development`.

## ⚠️ Erro Atual
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

## 🔧 Como Resolver

### 1. Configurar Gmail App Password

Para usar Gmail com nodemailer, você precisa de uma **Senha de App** (não a senha normal da conta):

#### Passo a Passo:
1. **Acesse sua conta Google**: https://myaccount.google.com/
2. **Vá em Segurança** → **Verificação em duas etapas** (deve estar ativada)
3. **Procure por "Senhas de app"** ou acesse: https://myaccount.google.com/apppasswords
4. **Gere uma nova senha de app**:
   - Nome: "Barbershop App"
   - Copie a senha gerada (16 caracteres)

### 2. Configurar o .env.development

Edite o arquivo `.env.development` e substitua:

```bash
# ==================
# 📧 CONFIGURAÇÃO DE EMAIL
# ==================
# Gmail (desenvolvimento)
EMAIL_USER=SEU_EMAIL@gmail.com
EMAIL_PASSWORD=SUA_SENHA_DE_APP_16_CARACTERES

# Configurações SMTP alternativas (descomente se necessário)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
```

### 3. Exemplo de Configuração Correta

```bash
EMAIL_USER=jean.carlos3@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

⚠️ **IMPORTANTE**: Use a senha de app de 16 caracteres, NÃO a senha da sua conta!

## 🔄 Reiniciar Container

Após configurar, reinicie o container:
```bash
docker compose down
docker compose up -d
```

## 🧪 Testar Email

1. Tente fazer um novo cadastro
2. Verifique os logs: `docker compose logs barbershop-app-dev`
3. Deve aparecer: "Email configuration verified successfully"

## 🆘 Alternativas

Se não conseguir configurar Gmail, pode usar:

### Mailtrap (Desenvolvimento)
```bash
EMAIL_USER=seu_username_mailtrap
EMAIL_PASSWORD=sua_senha_mailtrap
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
```

### Outlook/Hotmail
```bash
EMAIL_USER=seu_email@outlook.com
EMAIL_PASSWORD=sua_senha
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 📋 Checklist de Verificação

- [ ] Verificação em duas etapas ativada no Gmail
- [ ] Senha de app gerada
- [ ] .env.development configurado com email real
- [ ] .env.development configurado com senha de app
- [ ] Container reiniciado
- [ ] Teste de cadastro realizado