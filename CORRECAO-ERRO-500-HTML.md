# 🔧 Correção: Erro 500 - API Retornando HTML em vez de JSON

## ❌ Problema Identificado

A API está retornando HTML (`text/html`) em vez de JSON (`application/json`), causando erro 500.

**Erro no console:**
```
/api/users/:1 Failed to load resource: the server responded with a status of 500
API retornou HTML em vez de JSON. Status: 500
Content-Type recebido: text/html; charset=UTF-8
```

## ✅ Correções Aplicadas

### 1. **Arquivo `api/config/auth.php`**
- Adicionado tratamento de buffer de saída
- Garantido que sempre retorna JSON, mesmo em erro 401

### 2. **Arquivo `api/config/database.php`**
- Adicionado tratamento de buffer de saída
- Garantido que sempre retorna JSON em caso de erro de conexão

### 3. **Arquivo `api/users/index.php`**
- Headers JSON definidos ANTES de incluir outros arquivos
- Ordem de includes ajustada (database antes de auth)

### 4. **Arquivo `api/.htaccess` (NOVO)**
- Criado para garantir que PHP seja executado corretamente
- Desabilitado display de erros HTML
- Configurado para sempre usar JSON

## 📦 Arquivos para Enviar ao Servidor

Após fazer `npm run build`, envie:

1. **Pasta `api/` completa** (incluindo o novo `api/.htaccess`)
2. **Pasta `dist/` completa** (frontend)

## 🔍 Verificação

Após o deploy, teste:

1. **Acesse no navegador:**
   ```
   https://novaedubncc.com.br/api/test-api-json.php
   ```
   Deve retornar JSON, não HTML.

2. **Verifique no console do navegador:**
   - Não deve mais aparecer "API retornou HTML em vez de JSON"
   - O Content-Type deve ser `application/json`

## ⚠️ Importante

Se ainda retornar HTML após o deploy:

1. **Verifique se o `.htaccess` na raiz não está redirecionando `/api/`**
   - O `.htaccess` na raiz deve excluir a pasta `/api/`:
   ```apache
   RewriteCond %{REQUEST_URI} ^/api [NC]
   RewriteRule ^ - [L]
   ```

2. **Verifique se os arquivos PHP estão sendo executados**
   - Acesse diretamente: `https://novaedubncc.com.br/api/test-api-json.php`
   - Se retornar HTML, o PHP não está sendo executado

3. **Verifique permissões dos arquivos**
   - Arquivos PHP devem ter permissão 644
   - Pastas devem ter permissão 755
