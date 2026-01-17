# 🔍 Diagnóstico: API Retornando HTML em vez de JSON

## ❌ Problema Identificado

**Erro no console:**
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Causa:**
A API está retornando HTML (`<!DOCTYPE html>`) em vez de JSON. Isso significa que:
- ❌ O PHP **NÃO está sendo executado**
- ❌ O servidor está retornando o `index.html` do React
- ❌ Ou há um redirecionamento incorreto

## 🔍 Diagnóstico Passo a Passo

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
- ❌ `.htaccess` está redirecionando incorretamente
- ❌ Servidor não está executando PHP

### Teste 2: Verificar estrutura de arquivos

**Via FileZilla, verificar:**
1. A pasta `/api/` existe na raiz do servidor?
2. O arquivo `/api/auth/login.php` existe?
3. O caminho está correto?

**Estrutura esperada:**
```
public_html/
├── index.html (React)
├── assets/ (React)
└── api/
    ├── auth/
    │   └── login.php
    ├── config/
    └── test-api-json.php
```

### Teste 3: Verificar .htaccess

**Verificar se existe `.htaccess` na raiz que está interferindo:**

**Problema comum:**
```apache
# .htaccess na raiz redirecionando TUDO para index.html
FallbackResource /index.html
```

**Solução:**
O `.htaccess` na raiz deve **EXCLUIR** a pasta `/api/`:

```apache
# Não redirecionar pasta /api/
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^ - [L]

# Redirecionar resto para index.html (SPA)
RewriteRule ^ index.html [L]
```

### Teste 4: Verificar URL da API no Frontend

**Verificar no código React:**
- A URL da API está correta?
- Está usando `/api/auth/login` ou `https://www.novaedubncc.com.br/api/auth/login`?

## ✅ Soluções

### Solução 1: Verificar .htaccess na Raiz

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

### Solução 2: Verificar Localização da API

**A API deve estar em:**
- ✅ `/api/` (raiz do servidor, mesmo nível que `index.html`)
- ❌ NÃO em `/novaedu/api/`
- ❌ NÃO dentro da pasta do React

**Verificar via FileZilla:**
```
public_html/
├── index.html
└── api/
    └── auth/
        └── login.php
```

### Solução 3: Criar .htaccess na Pasta API

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

### Solução 4: Testar Acesso Direto

**Acesse diretamente:**
```
https://www.novaedubncc.com.br/api/test-api-json.php
```

**Se retornar JSON:**
- ✅ PHP está funcionando
- ✅ Problema está no `.htaccess` da raiz

**Se retornar HTML:**
- ❌ Arquivo não está no lugar certo
- ❌ Ou servidor não executa PHP

## 🧪 Testes Rápidos

### Teste A: Acesso Direto ao PHP

```
https://www.novaedubncc.com.br/api/test-api-json.php
```

**Esperado:** JSON  
**Se HTML:** Problema de localização ou `.htaccess`

### Teste B: Acesso ao Login

```
https://www.novaedubncc.com.br/api/auth/login.php
```

**Esperado:** JSON (erro de método, mas JSON)  
**Se HTML:** Problema de redirecionamento

### Teste C: Verificar Headers

**Via cURL:**
```bash
curl -I https://www.novaedubncc.com.br/api/test-api-json.php
```

**Verificar:**
- `Content-Type: application/json` ✅
- `Content-Type: text/html` ❌ (problema)

## 📋 Checklist

- [ ] Arquivo `test-api-json.php` retorna JSON?
- [ ] Arquivo `login.php` existe em `/api/auth/`?
- [ ] `.htaccess` na raiz exclui `/api/`?
- [ ] `.htaccess` na pasta `/api/` permite PHP?
- [ ] Estrutura de pastas está correta?

## 🎯 Próximo Passo

1. **Testar** `test-api-json.php` no navegador
2. **Verificar** estrutura de arquivos via FileZilla
3. **Ajustar** `.htaccess` se necessário
4. **Testar** login novamente

---

**💡 Dica**: O erro `<!DOCTYPE` indica que o servidor está servindo HTML. O problema está na configuração do servidor ou `.htaccess`, não no código PHP!
