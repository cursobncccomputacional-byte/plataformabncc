# 🔧 Resolução: Erro 404 na API

## ✅ Progresso

**Erro anterior (CORS):** ✅ **RESOLVIDO**
- Não aparece mais erro de CORS no console
- URL correta sendo usada (sem www)

**Erro atual (404):** ❌ **PRECISA CORRIGIR**
- Requisição para `/api/auth/login` retorna 404
- API retornando HTML em vez de JSON

## 🔍 Causa do Problema

O erro 404 indica que:
1. **O `.htaccess` não está no servidor** ou não está funcionando
2. **A API não está no caminho correto** no servidor
3. **A requisição está sendo redirecionada** para `index.html` do React

## ✅ Solução

### Passo 1: Verificar Estrutura no Servidor

**Via FileZilla, verificar se existe:**

```
/public_html/
├── index.html          ✅ (React)
├── assets/             ✅ (React)
├── .htaccess           ❓ (PRECISA ESTAR AQUI)
└── api/                ❓ (PRECISA ESTAR AQUI)
    ├── .htaccess       ❓ (PRECISA ESTAR AQUI)
    ├── auth/
    │   └── login.php   ❓ (PRECISA ESTAR AQUI)
    └── config/
        ├── cors.php
        └── database.php
```

### Passo 2: Upload do `.htaccess` na Raiz

**Arquivo**: `.htaccess` (na raiz, junto com `index.html`)

**Conteúdo:**
```apache
# Configuração para Aplicação React (Vite) + API PHP
DirectoryIndex index.html

# Configuração para SPA React
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # REGRA 1: Se começa com /api/, PARAR (não redirecionar)
  RewriteCond %{REQUEST_URI} ^/api [NC]
  RewriteRule ^ - [L]
  
  # REGRA 2: Se arquivo existe fisicamente, PARAR (servir arquivo)
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule ^ - [L]
  
  # REGRA 3: Se diretório existe fisicamente, PARAR (servir diretório)
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # REGRA 4: Redirecionar resto para index.html (SPA React)
  RewriteRule ^ index.html [L]
</IfModule>

# MIME Types
<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType application/javascript .mjs
  AddType text/css .css
  AddType application/json .json
</IfModule>
```

**Localização no servidor:**
- `/public_html/.htaccess` (na raiz, mesmo nível que `index.html`)

### Passo 3: Upload do `.htaccess` na Pasta API

**Arquivo**: `api/.htaccess`

**Conteúdo:**
```apache
# Permitir execução de PHP
<IfModule mod_php.c>
  php_flag engine on
</IfModule>

# Permitir acesso aos arquivos PHP
<FilesMatch "\.php$">
  SetHandler application/x-httpd-php
</FilesMatch>

# Headers CORS (backup, caso cors.php não funcione)
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-Session-ID"
  Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

**Localização no servidor:**
- `/public_html/api/.htaccess`

### Passo 4: Verificar se API Está no Servidor

**Verificar via FileZilla:**

1. **Pasta `api/` existe?**
   - Caminho: `/public_html/api/`
   - Deve estar no mesmo nível que `index.html`

2. **Arquivo `login.php` existe?**
   - Caminho: `/public_html/api/auth/login.php`
   - Permissão: 644

3. **Pasta `auth/` existe?**
   - Caminho: `/public_html/api/auth/`
   - Permissão: 755

### Passo 5: Testar Acesso Direto

**Após upload, testar no navegador:**

1. **Testar API básica:**
   ```
   https://novaedubncc.com.br/api/test.php
   ```
   - Se retornar JSON → ✅ API está acessível
   - Se retornar 404 → ❌ API não está no lugar certo

2. **Testar login diretamente:**
   ```
   https://novaedubncc.com.br/api/auth/login.php
   ```
   - Se retornar JSON (mesmo que erro de método) → ✅ Arquivo existe
   - Se retornar 404 → ❌ Arquivo não existe

## 📋 Checklist de Upload

- [ ] `.htaccess` na raiz (`/public_html/.htaccess`)
- [ ] `.htaccess` na pasta API (`/public_html/api/.htaccess`)
- [ ] Pasta `api/` existe em `/public_html/api/`
- [ ] Arquivo `api/auth/login.php` existe
- [ ] Pasta `api/config/` existe
- [ ] Arquivo `api/config/cors.php` existe
- [ ] Arquivo `api/config/database.php` existe

## 🧪 Teste Após Correção

**No console do navegador (F12):**

```javascript
fetch('https://novaedubncc.com.br/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'marcus.lopes',
    password: '?&,6bsMrD08a'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Resultado esperado:**
- ✅ Retorna JSON (não HTML)
- ✅ Não retorna 404
- ✅ Login funciona

---

**💡 O problema agora é de estrutura/roteamento no servidor, não mais de CORS!**
