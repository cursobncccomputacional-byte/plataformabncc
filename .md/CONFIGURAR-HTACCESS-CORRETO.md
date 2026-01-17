# 🔧 Configurar .htaccess Corretamente

## ✅ Situação Atual

- ✅ PHP funciona na raiz (`test-direto.php` funciona)
- ⚠️ Precisamos garantir que:
  - Arquivos PHP funcionem
  - Pasta `/api/` funcione
  - Rotas do React SPA redirecionem para `index.html`

## 📋 .htaccess Correto

**Arquivo**: `dist/.htaccess`

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

## ✅ Como Funciona

1. **Se URL começa com `/api/`** → Para (não faz nada, deixa PHP executar)
2. **Se arquivo existe** → Para (serve o arquivo, incluindo `.php`)
3. **Se diretório existe** → Para (serve o diretório)
4. **Resto** → Redireciona para `index.html` (SPA React)

## 📤 Fazer Upload

**Após testar a API:**
1. Fazer upload do `.htaccess` para `/home/supernerd/novaedu/.htaccess`
2. Permissão: 644
3. Testar novamente

---

**💡 Use este .htaccess após confirmar que a API funciona!**
