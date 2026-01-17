# 🔧 Solução Alternativa: .htaccess Mais Simples

## ⚠️ Se PHP Funciona SEM .htaccess

Se o teste mostrar que PHP funciona sem `.htaccess`, então o problema é com as regras do `.htaccess`.

## ✅ Solução: .htaccess Mínimo

Criar um `.htaccess` MÍNIMO que só redireciona para `index.html` quando necessário:

```apache
# .htaccess MÍNIMO - Só redireciona rotas do React
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # NÃO redirecionar se arquivo existe
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule ^ - [L]
  
  # NÃO redirecionar se diretório existe
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # NÃO redirecionar pasta /api/
  RewriteCond %{REQUEST_URI} ^/api [NC]
  RewriteRule ^ - [L]
  
  # Redirecionar resto para index.html
  RewriteRule ^ index.html [L]
</IfModule>
```

**Por que funciona:**
- Verifica se arquivo existe ANTES de redirecionar
- Se arquivo existe (incluindo `.php`), não redireciona
- Só redireciona se arquivo NÃO existe

## 📤 Fazer Upload

**Após restaurar `.htaccess`**, substituir pelo conteúdo acima.

**Testar novamente**: `https://www.novaedubncc.com.br/test-php-simples.php`

---

**💡 Use esta solução se PHP funcionar sem .htaccess!**
