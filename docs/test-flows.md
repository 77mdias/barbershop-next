# 🧪 Testes de Fluxos

Este documento apresenta checklist e exemplos de testes para os principais fluxos do sistema.

---

## 1. Testes de Autenticação
- [ ] Registrar novo usuário
- [ ] Login com credenciais
- [ ] Login social (GitHub/Google)
- [ ] Logout e sessão expirada

---

## 2. Testes de Agendamento
- [ ] Criar agendamento como cliente
- [ ] Verificar disponibilidade do barbeiro
- [ ] Cancelar agendamento
- [ ] Finalizar agendamento
- [ ] Testar restrições de horário

---

## 3. Testes de Dashboard
- [ ] Acesso ao painel admin
- [ ] Acesso ao painel barbeiro
- [ ] CRUD de serviços e usuários
- [ ] Controle de disponibilidade

---

## 4. Testes de Permissões
- [ ] Cliente não acessa rotas de admin/barbeiro
- [ ] Barbeiro não acessa rotas de admin
- [ ] Admin acessa todas as rotas

---

## 5. Testes de API
- [ ] Listar barbeiros
- [ ] Criar/cancelar agendamento via API
- [ ] Consultar disponibilidade

---

## 6. Boas Práticas
- Documentar cada teste realizado
- Registrar aprendizados e problemas encontrados
- Sugerir múltiplas soluções para bugs

---

## 7. Referências
- [Papéis e Permissões](./roles-permissions.md)
- [Dashboard Admin](./dashboard-admin.md)
- [Dashboard Barbeiro](./dashboard-barber.md)
