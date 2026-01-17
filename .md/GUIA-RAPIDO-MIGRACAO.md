# 🚀 Guia Rápido: Migração para Business Web Hosting

## ✅ Plano Contratado

**Business Web Hosting** - Hostinger
- **Preço**: R$ 11,99/mês (promoção)
- **Renovação**: R$ 64,99/mês
- **Capacidade**: 35-60 professores simultâneos

## 📋 O Que Fazer Agora

### 1. Preparar Arquivos (Agora)

**Fazer build do frontend:**
```bash
npm run build
```

**Verificar pastas:**
- ✅ `dist/` (frontend)
- ✅ `api/` (backend PHP)
- ✅ Scripts SQL do banco

### 2. Aguardar Credenciais

**Você receberá:**
- Credenciais FTP
- Acesso ao painel (cPanel/hPanel)
- Acesso ao PHPMyAdmin
- Informações do banco de dados

### 3. Fazer Upload

**Estrutura:**
```
/novaedu/ (ou pasta do domínio)
├── .htaccess
├── index.html
├── assets/
├── api/
├── images/
├── pdf/
└── logo/
```

### 4. Configurar Banco

**No PHPMyAdmin:**
1. Criar banco de dados
2. Executar `database-structure.sql`
3. Executar `database-insert-root-user.sql`
4. Atualizar `api/config/database.php`

### 5. Testar

**URLs para testar:**
- `https://www.novaedubncc.com.br/` (site)
- `https://www.novaedubncc.com.br/test-direto.php` (PHP)
- `https://www.novaedubncc.com.br/novaedu/api/test.php` (API)

## 🎯 Checklist Rápido

- [ ] Build do frontend feito
- [ ] Arquivos preparados
- [ ] Credenciais recebidas
- [ ] Upload feito
- [ ] Banco configurado
- [ ] Testes passaram
- [ ] Site funcionando

## 📚 Documentos Criados

1. **PREPARACAO-MIGRACAO-BUSINESS.md** - Guia completo
2. **CHECKLIST-MIGRACAO-COMPLETO.md** - Checklist detalhado
3. **GUIA-RAPIDO-MIGRACAO.md** - Este guia rápido

## 💡 Próximos Passos

1. **Aguardar** credenciais da Hostinger
2. **Preparar** arquivos (build, verificar)
3. **Fazer upload** quando receber credenciais
4. **Configurar** banco de dados
5. **Testar** tudo
6. **Ajustar** se necessário

---

**💡 Dica**: Prepare tudo agora. Quando receber as credenciais, é só fazer upload e configurar!
