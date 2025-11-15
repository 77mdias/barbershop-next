# 📦 Guia de Dependências Compatíveis - Next.js + Tailwind CSS

## 🎯 Objetivo

Este documento fornece orientações para instalação e manutenção de dependências compatíveis em projetos Next.js, evitando conflitos de versão que podem causar falhas na build.

---

## 🚨 Problemas Comuns e Soluções

### 1. **Conflito Tailwind CSS v3 vs v4**

#### ❌ **Problema:**
```bash
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. 
The PostCSS plugin has moved to a separate package...
```

#### ✅ **Solução:**
Escolher **UMA** versão e manter consistência:

**Opção A: Tailwind CSS v3 (Recomendado para produção)**
```bash
npm install tailwindcss@^3.4.0 tailwindcss-animate@^1.0.7
```

**Opção B: Tailwind CSS v4 (Experimental)**
```bash
npm install @tailwindcss/postcss@^4.0.0
npm uninstall tailwindcss tailwindcss-animate
```

---

## 📋 Stack de Dependências Recomendada

### **Core Framework**
```json
{
  "next": "15.5.4",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "typescript": "^5"
}
```

### **Styling (Tailwind CSS v3)**
```json
{
  "tailwindcss": "^3.4.0",
  "tailwindcss-animate": "^1.0.7",
  "autoprefixer": "^10.4.21",
  "postcss": "^8.4.32"
}
```

### **UI Components**
```json
{
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-navigation-menu": "^1.2.14",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-toast": "^1.2.15",
  "@radix-ui/react-tooltip": "^1.2.8"
}
```

### **Database & ORM**
```json
{
  "@prisma/client": "^6.16.2",
  "prisma": "^6.16.2"
}
```

### **Authentication**
```json
{
  "next-auth": "^4.24.11",
  "@next-auth/prisma-adapter": "^1.0.7",
  "bcryptjs": "^3.0.2",
  "@types/bcryptjs": "^2.4.6"
}
```

### **Validation & Forms**
```json
{
  "zod": "^4.1.11",
  "react-hook-form": "^7.63.0",
  "@hookform/resolvers": "^5.2.2"
}
```

### **Utilities**
```json
{
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "lucide-react": "^0.544.0"
}
```

---

## ⚙️ Configurações Essenciais

### **PostCSS (postcss.config.mjs)**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### **Tailwind CSS (tailwind.config.js)**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Suas customizações aqui
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

### **CSS Global (src/app/globals.css)**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Suas variáveis CSS aqui */
  }
}
```

---

## 🔍 Verificação de Compatibilidade

### **Comando de Verificação**
```bash
# Verificar versões instaladas
npm list tailwindcss @tailwindcss/postcss autoprefixer postcss

# Verificar conflitos
npm ls --depth=0 | grep -E "(tailwind|postcss)"
```

### **Sinais de Problemas**
- ❌ Múltiplas versões do mesmo pacote
- ❌ Versões incompatíveis entre dependências relacionadas
- ❌ Plugins que requerem versões específicas

---

## 🛠️ Processo de Resolução de Conflitos

### **1. Identificar o Problema**
```bash
# Verificar logs de build
npm run build

# Verificar dependências
npm list --depth=1
```

### **2. Limpar Dependências Conflitantes**
```bash
# Remover pacotes conflitantes
npm uninstall tailwindcss @tailwindcss/postcss tailwindcss-animate

# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
```

### **3. Reinstalar com Versões Compatíveis**
```bash
# Instalar versão específica
npm install tailwindcss@^3.4.0 tailwindcss-animate@^1.0.7

# Verificar instalação
npm list tailwindcss
```

### **4. Testar Build**
```bash
# Testar localmente
npm run build

# Testar no Docker
docker-compose build
```

---

## 📚 Boas Práticas

### **1. Versionamento Semântico**
- Use `^` para atualizações menores: `"tailwindcss": "^3.4.0"`
- Use `~` para patches apenas: `"next": "~15.5.4"`
- Use versão exata para dependências críticas: `"react": "19.1.0"`

### **2. Documentação de Mudanças**
```markdown
## Changelog de Dependências

### 2024-10-01
- ⬇️ Downgrade: @tailwindcss/postcss@4.1.14 → tailwindcss@3.4.0
- ➕ Adicionado: tailwindcss-animate@1.0.7
- 🔧 Motivo: Conflito de versões causando falha na build
```

### **3. Testes de Compatibilidade**
```bash
# Script de teste completo
npm run lint && npm run build && npm run test
```

### **4. Backup de Configurações**
- Sempre fazer backup do `package.json` antes de mudanças grandes
- Documentar configurações que funcionam
- Usar `.env.example` para variáveis de ambiente

---

## 🚀 Comandos Úteis

### **Instalação Limpa**
```bash
# Remover tudo e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### **Verificação de Segurança**
```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente
npm audit fix
```

### **Atualização Segura**
```bash
# Verificar atualizações disponíveis
npm outdated

# Atualizar dependências menores
npm update

# Atualizar dependência específica
npm install package@latest
```

---

## ⚠️ Avisos Importantes

1. **Nunca misturar Tailwind CSS v3 e v4** no mesmo projeto
2. **Sempre testar a build** após mudanças de dependências
3. **Documentar mudanças** para facilitar rollback
4. **Usar versões LTS** para dependências críticas
5. **Verificar compatibilidade** antes de atualizar

---

## 🔗 Referências

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostCSS Documentation](https://postcss.org/)
- [npm Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning)

---

**📝 Última atualização:** 01/10/2024  
**🔄 Próxima revisão:** Quando houver atualizações major das dependências principais