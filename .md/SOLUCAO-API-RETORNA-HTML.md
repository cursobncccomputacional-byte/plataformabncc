# 🔧 Solução: API Retornando HTML em vez de JSON

## ❌ Problema

**Erro no console:**
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Causa:**
A requisição para `/api/auth/login` está retornando o HTML do React (`index.html`) em vez de executar o PHP e retornar JSON.

## 🔍 Diagnóstico

### Problema 1: URL da API no Frontend

**Arquivo**: `src/services/apiService.ts` (linha 7)

**Código atual:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://www.novaedubncc.com.br/novaedu/api';
```

**Problema:**
- Está usando `/novaedu/api` 
- Mas a API deve estar em `/api/` (raiz)

### Problema 2: Estrutura no Servidor

**Estrutura esperada:**
```
public_html/
├── index.html (React)
├── assets/ (React)
└── api/ (API PHP - mesmo nível que index.html)
    ├── auth/
    │   └── login.php
    └── config/
```

**NÃO deve ser:**
```
public_html/
└── novaedu/
    ├── index.html
    └── api/ ❌ (ERRADO)
```

## ✅ Soluções

### Solução 1: Corrigir URL no Frontend

**Arquivo**: `src/services/apiService.ts`

**Alterar linha 7:**
```typescript
// ANTES:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://www.novaedubncc.com.br/novaedu/api';

// DEPOIS:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://www.novaedubncc.com.br/api';
```

**OU usar variável de ambiente:**

Criar arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=https://www.novaedubncc.com.br/api
```

### Solução 2: Verificar Estrutura no Servidor

**Via FileZilla, verificar:**

1. **A API está em `/api/` (raiz)?**
   - Caminho: `/public_html/api/` ou `/home/supernerd/novaedu/api/`
   - Deve estar no **mesmo nível** que `index.html`

2. **Arquivo `login.php` existe?**
   - Caminho: `/api/auth/login.php`
   - Deve existir fisicamente no servidor

### Solução 3: Verificar .htaccess

**Arquivo**: `.htaccess` (na raiz, junto com `index.html`)

**Deve conter:**
```apache
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # CRÍTICO: NÃO redirecionar pasta /api/
  RewriteCond %{REQUEST_URI} ^/api [NC]
  RewriteRule ^ - [L]
  
  # NÃO redirecionar arquivos PHP
  RewriteCond %{REQUEST_URI} \.php$ [NC]
  RewriteRule ^ - [L]
  
  # NÃO redirecionar arquivos que existem
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule ^ - [L]
  
  # NÃO redirecionar diretórios que existem
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Redirecionar resto para index.html (SPA)
  RewriteRule ^ index.html [L]
</IfModule>
```

### Solução 4: Criar .htaccess na Pasta API

**Arquivo**: `/api/.htaccess`

**Conteúdo:**
```apache
# Permitir execução de PHP
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# Não fazer rewrite nesta pasta
RewriteEngine Off
```

## 🧪 Testes

### Teste 1: Verificar se API está acessível

**Acesse no navegador:**
```
https://www.novaedubncc.com.br/api/test-api-json.php
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "message": "API PHP está funcionando corretamente!",
  ...
}
```

**Se retornar HTML:**
- ❌ Arquivo não está no lugar certo
- ❌ `.htaccess` está redirecionando

### Teste 2: Verificar URL correta

**Teste estas URLs:**
1. `https://www.novaedubncc.com.br/api/test-api-json.php` ✅ (deve funcionar)
2. `https://www.novaedubncc.com.br/novaedu/api/test-api-json.php` ❌ (não deve existir)

### Teste 3: Testar Login Direto

**Via cURL:**
```bash
curl -X POST https://www.novaedubncc.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marcus.lopes","password":"?&,6bsMrD08a"}'
```

**Resultado esperado:**
```json
{
  "error": false,
  "user": {...},
  "session_id": "..."
}
```

**Se retornar HTML:**
- ❌ Problema de configuração do servidor

## 📋 Checklist de Correção

- [ ] **Corrigir URL no `apiService.ts`** (remover `/novaedu`)
- [ ] **Verificar estrutura no servidor** (API em `/api/`, não `/novaedu/api/`)
- [ ] **Verificar `.htaccess` na raiz** (excluir `/api/`)
- [ ] **Criar `.htaccess` na pasta `/api/`** (permitir PHP)
- [ ] **Testar `test-api-json.php`** (deve retornar JSON)
- [ ] **Rebuild do frontend** (`npm run build`)
- [ ] **Upload do novo `dist/`** para servidor
- [ ] **Testar login** no frontend

## 🎯 Passo a Passo Rápido

1. **Corrigir `src/services/apiService.ts`**:
   ```typescript
   const API_BASE_URL = 'https://www.novaedubncc.com.br/api';
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Upload:**
   - Upload da pasta `dist/` para servidor
   - Upload da pasta `api/` para `/api/` (raiz)

4. **Testar:**
   - `https://www.novaedubncc.com.br/api/test-api-json.php`
   - Login no frontend

---

**💡 Dica**: O problema principal é a URL `/novaedu/api` no frontend. Mude para `/api` e deve funcionar!
