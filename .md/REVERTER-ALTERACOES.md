# 🔄 Reverter Alterações e Corrigir Problemas

## ❌ Problemas Identificados

1. **404 Not Found** para `/api/auth/login`
2. **SSL "Inseguro"** (mas estava funcionando antes)
3. **API retornando HTML** em vez de JSON

## 🔍 Diagnóstico

O erro **404** indica que a API não está sendo encontrada. Isso pode ser causado por:

1. **API não está no lugar certo** no servidor
2. **`.htaccess` bloqueando** a pasta `/api/`
3. **Estrutura de pastas incorreta**

## ✅ Soluções Imediatas

### Solução 1: Verificar Estrutura no Servidor

**Via FileZilla, verificar:**

**Estrutura esperada:**
```
public_html/ (ou DocumentRoot)
├── index.html
├── assets/
└── api/
    ├── auth/
    │   └── login.php
    ├── config/
    └── .htaccess
```

**Verificar:**
- A pasta `/api/` existe na raiz?
- O arquivo `/api/auth/login.php` existe?
- O caminho está correto?

### Solução 2: Simplificar .htaccess

**Arquivo**: `dist/.htaccess` (na raiz)

**Versão simplificada (sem forçar HTTPS por enquanto):**

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

### Solução 3: Verificar .htaccess da API

**Arquivo**: `api/.htaccess`

**Deve conter apenas:**

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

**Acessar diretamente:**
```
https://www.novaedubncc.com.br/api/test-api-json.php
```

**Ou:**
```
https://www.novaedubncc.com.br/api/test.php
```

**Resultado esperado:**
- JSON ✅
- HTML ❌ (problema)

### Teste 2: Verificar caminho da API

**No console do navegador (F12):**
```javascript
fetch('https://www.novaedubncc.com.br/api/test.php')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error)
```

**Se retornar 404:**
- API não está no lugar certo
- Ou `.htaccess` está bloqueando

## 📋 Checklist de Verificação

- [ ] Pasta `/api/` existe na raiz do servidor?
- [ ] Arquivo `/api/auth/login.php` existe?
- [ ] `.htaccess` na raiz não bloqueia `/api/`?
- [ ] `.htaccess` na pasta `/api/` permite PHP?
- [ ] Teste direto da API funciona?

## 🎯 Próximos Passos

1. **Verificar estrutura** via FileZilla
2. **Simplificar `.htaccess`** (remover regras de HTTPS por enquanto)
3. **Testar API diretamente** no navegador
4. **Corrigir caminho** se necessário

---

**💡 Importante**: O problema principal é o 404. Vamos focar em fazer a API funcionar primeiro, depois corrigimos o SSL.
