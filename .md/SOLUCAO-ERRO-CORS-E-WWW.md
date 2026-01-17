# 🔧 Solução: Erro CORS e Requisição com www

## ❌ Problema Atual

**Erros no console:**
1. **CORS Error**: "Access to fetch at 'https://www.novaedubncc.com.br/api/auth/login' from origin 'https://novaedubncc.com.br' has been blocked by CORS policy"
2. **SSL Error**: `net::ERR_CERT_COMMON_NAME_INVALID` para `www.novaedubncc.com.br`
3. **Requisição indo para www**: A requisição ainda está usando `www.novaedubncc.com.br` (build antigo)

**Causa:**
- Build antigo ainda está no servidor (usa `www`)
- Frontend está em `novaedubncc.com.br` (sem www)
- API está sendo chamada em `www.novaedubncc.com.br` (com www)
- São origens diferentes → CORS bloqueia

## ✅ Solução

### 1. Fazer Rebuild do Frontend

**Execute:**
```bash
npm run build
```

**Isso vai:**
- ✅ Compilar código com URL `novaedubncc.com.br` (sem www)
- ✅ Gerar novos arquivos em `dist/`

### 2. Upload Completo

**Upload via FTP:**

**Pasta `dist/` → `/public_html/`:**
- ✅ `.htaccess` (substituir)
- ✅ `index.html` (substituir)
- ✅ `assets/` (substituir pasta inteira - deletar pasta antiga primeiro)

**Arquivo `api/config/cors.php`:**
- ✅ Upload para `/public_html/api/config/cors.php`

### 3. Limpar Cache

**No navegador:**
1. **Ctrl+Shift+Delete**
2. **Selecionar**: "Imagens e arquivos em cache"
3. **Período**: "Todo o período"
4. **Limpar dados**

**Ou usar modo anônimo:**
- **Ctrl+Shift+N** (Chrome)
- Acessar: `https://novaedubncc.com.br`

### 4. Verificar CORS no Login

**Arquivo**: `api/auth/login.php`

**Verificar se tem:**
```php
require_once __DIR__ . '/../config/cors.php';
```

**Deve estar na PRIMEIRA linha** (antes de qualquer output).

## 🎯 Teste Após Correção

**1. Acessar SEM www:**
```
https://novaedubncc.com.br
```

**2. Abrir console (F12)**

**3. Tentar login:**
- Usuário: `marcus.lopes`
- Senha: `?&,6bsMrD08a`

**4. Verificar no console:**
- ✅ Requisição deve ir para: `https://novaedubncc.com.br/api/auth/login` (sem www)
- ✅ Sem erro de CORS
- ✅ Sem erro de SSL
- ✅ Resposta JSON

## ⚠️ Importante

**SEMPRE acesse SEM www:**
- ✅ `https://novaedubncc.com.br`
- ❌ `https://www.novaedubncc.com.br` (certificado não cobre)

**Ou configure redirecionamento no painel Hostinger:**
- `www` → `sem www` (301 redirect permanente)

## 🔍 Se Ainda Não Funcionar

### Verificar 1: Build foi feito?

**Verificar arquivo:**
- `dist/assets/index-*.js` (abrir e procurar por `novaedubncc.com.br`)
- Se encontrar `www.novaedubncc.com.br` → build não foi feito

### Verificar 2: Upload foi completo?

**Via FTP:**
- Verificar data de modificação dos arquivos
- Se data antiga → upload não foi feito

### Verificar 3: Cache do navegador?

**Testar em modo anônimo:**
- Se funcionar em anônimo → problema é cache
- Limpar cache completamente

---

**💡 Execute `npm run build` AGORA e faça upload completo!**
