# 🔧 Solução Final: .htaccess Redirecionando API

## ❌ Problema

A API foi movida para `/novaedu/api/`, mas ainda dá **404**. Isso indica que o `.htaccess` da raiz (`/novaedu/.htaccess`) está **redirecionando** a pasta `api/` para `index.html`.

## 🔍 Causa

O `.htaccess` em `/novaedu/.htaccess` tem regras de rewrite para SPA React que estão redirecionando **TUDO** para `index.html`, incluindo a pasta `api/`.

## ✅ Solução: Atualizar .htaccess da Raiz

O `.htaccess` precisa ter uma regra para **NÃO redirecionar** a pasta `api/` ANTES da regra de SPA.

### Conteúdo do .htaccess Atualizado

```apache
# Configuração para Aplicação React (Vite)
DirectoryIndex index.html index.php

# CRÍTICO: Desabilitar rewrite para arquivos PHP ANTES de qualquer outra regra
<FilesMatch "\.php$">
    # Não fazer rewrite para arquivos PHP - deixar executar normalmente
</FilesMatch>

# Configuração para SPA React
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # CRÍTICO: NÃO redirecionar pasta api/ (deixar PHP executar)
  # Se a requisição for para api/, parar aqui e não redirecionar
  RewriteCond %{REQUEST_URI} ^.*/api/.*$ [NC]
  RewriteRule ^ - [L]
  
  # CRÍTICO: NÃO redirecionar arquivos PHP
  # Verificar se é arquivo .php e parar processamento
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteCond %{REQUEST_FILENAME} \.php$ [NC]
  RewriteRule ^ - [L]
  
  # IMPORTANTE: NÃO redirecionar arquivos existentes!
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Redirecionar apenas rotas não encontradas para index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# MIME Types
<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType application/javascript .mjs
  AddType text/css .css
  AddType application/json .json
</IfModule>
```

## 📤 Passo a Passo

### Passo 1: Fazer Upload do .htaccess Atualizado

1. **Arquivo local**: `dist/.htaccess` (já atualizado)
2. **Upload para**: `/novaedu/.htaccess`
3. **IMPORTANTE**: **SUBSTITUIR** o arquivo existente
4. **Permissão**: 644

### Passo 2: Verificar .htaccess da API

O arquivo `/novaedu/api/.htaccess` também deve existir:

```apache
# Configuração para API PHP
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# Headers CORS
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-Session-ID"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>
```

### Passo 3: Limpar Cache do Navegador

- Pressione `Ctrl + Shift + Delete`
- Ou `Ctrl + F5` para recarregar forçado

### Passo 4: Testar

Acesse:
```
https://www.novaedubncc.com.br/novaedu/api/test-php.php
```

**Resultado esperado:**
- ✅ Mostra "PHP FUNCIONANDO!" → **Sucesso!** 🎉
- ❌ Ainda mostra 404 → Verificar se arquivo está realmente em `/novaedu/api/`
- ❌ Mostra HTML → `.htaccess` ainda está redirecionando

## 🔍 Verificações Adicionais

### Verificar se Arquivo Está no Lugar Certo

**Via FileZilla:**
1. Navegue até `/novaedu/api/`
2. Verifique se `test-php.php` está lá
3. Caminho completo deve ser: `/home/supernerd/novaedu/api/test-php.php`

### Verificar Permissões

- **Pastas**: 755
- **Arquivos PHP**: 644
- **`.htaccess`**: 644

## 📋 Checklist

- [ ] `.htaccess` atualizado em `/novaedu/.htaccess`
- [ ] `.htaccess` existe em `/novaedu/api/.htaccess`
- [ ] Arquivo `test-php.php` está em `/novaedu/api/`
- [ ] Permissões corretas (755/644)
- [ ] Cache do navegador limpo
- [ ] Testar: `https://www.novaedubncc.com.br/novaedu/api/test-php.php`

---

**💡 Dica**: O problema mais comum é que o `.htaccess` da raiz não tem a regra para excluir `/api/` do rewrite. Certifique-se de que a regra está ANTES da regra de SPA!
