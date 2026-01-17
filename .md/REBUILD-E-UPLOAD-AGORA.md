# 🚀 Rebuild e Upload - Correção SSL

## ❌ Problema Atual

**Erro no console:**
```
net::ERR_CERT_COMMON_NAME_INVALID
www.novaedubncc.com.br/api/auth/login
```

**Causa:**
- Certificado SSL é válido apenas para `novaedubncc.com.br` (sem www)
- Build antigo ainda usa `www.novaedubncc.com.br` na URL da API
- `.htaccess` foi deletado do `dist/`

## ✅ Correções Aplicadas

### 1. URL da API Corrigida

**Arquivo**: `src/services/apiService.ts`

**Mudança:**
- ❌ ANTES: `https://www.novaedubncc.com.br/api`
- ✅ AGORA: `https://novaedubncc.com.br/api`

### 2. CORS Atualizado

**Arquivo**: `api/config/cors.php`

**Alterado:**
- `novaedubncc.com.br` agora é o primeiro na lista

### 3. .htaccess Recriado

**Arquivo**: `dist/.htaccess`

**Recriado com:**
- Regras para não redirecionar `/api/`
- Regras para não redirecionar arquivos PHP
- Regras para SPA React

## 📋 Passo a Passo

### 1. Rebuild do Frontend

**Execute:**
```bash
npm run build
```

**Isso vai:**
- ✅ Compilar código com URL sem www
- ✅ Gerar arquivos em `dist/`
- ✅ Incluir `.htaccess` atualizado

### 2. Upload para Servidor

**Upload via FTP:**

**Pasta `dist/` → `/public_html/`:**
- ✅ `.htaccess` (substituir)
- ✅ `index.html` (substituir)
- ✅ `assets/` (substituir pasta inteira)

**Arquivo `api/config/cors.php`:**
- ✅ Upload para `/public_html/api/config/cors.php`

### 3. Testar

**Após upload:**

1. **Limpar cache do navegador** (Ctrl+Shift+Delete)
2. **Acessar SEM www:**
   ```
   https://novaedubncc.com.br
   ```
3. **Testar login:**
   - Usuário: `marcus.lopes`
   - Senha: `?&,6bsMrD08a`

## 🎯 O Que Esperar

**✅ Sucesso:**
- Sem erro de certificado SSL
- Login funciona
- API retorna JSON

**❌ Se ainda der erro:**
- Verificar se build foi feito
- Verificar se upload foi completo
- Verificar cache do navegador
- Verificar se está acessando SEM www

## ⚠️ Importante

**SEMPRE acesse SEM www:**
- ✅ `https://novaedubncc.com.br`
- ❌ `https://www.novaedubncc.com.br` (certificado não cobre)

**Ou configure redirecionamento no painel Hostinger:**
- `www` → `sem www` (301 redirect)

---

**💡 Execute `npm run build` agora e faça upload!**
