# 🔍 Verificação de Deploy - Checklist

## ❌ Problema: Alterações não aparecem após deploy

Se você fez o build e enviou os arquivos mas não viu alterações, verifique:

### 1. ✅ Arquivos foram enviados corretamente?

**Verifique via FTP/FileZilla:**

- [ ] A pasta `api/` foi enviada completamente?
- [ ] O arquivo `api/.htaccess` existe no servidor?
- [ ] O arquivo `api/users/index.php` foi atualizado?
- [ ] Os arquivos em `dist/assets/` foram substituídos?

**⚠️ IMPORTANTE:** Os arquivos em `dist/assets/` têm nomes únicos a cada build. Se você não substituir, o navegador continuará usando os antigos!

### 2. 🔄 Cache do Navegador

**Limpe o cache:**
- Chrome/Edge: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Ou abra em modo anônimo: `Ctrl + Shift + N`

### 3. 🔍 Verificar se PHP está funcionando

**Teste 1: Acesse no navegador:**
```
https://novaedubncc.com.br/api/test-debug.php
```

**Resultado esperado:** JSON com informações de debug

**Se retornar HTML:**
- ❌ PHP não está sendo executado
- ❌ `.htaccess` na raiz está redirecionando `/api/` para `index.html`

**Teste 2: Acesse:**
```
https://novaedubncc.com.br/api/test-api-json.php
```

**Resultado esperado:** JSON simples

### 4. 📝 Verificar .htaccess na Raiz

**Se existe `.htaccess` na raiz do servidor, ele DEVE ter:**

```apache
# NÃO redirecionar pasta /api/
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^ - [L]

# Redirecionar resto para index.html (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

**❌ NÃO deve ter:**
```apache
# ERRADO - redireciona TUDO, incluindo /api/
FallbackResource /index.html
```

### 5. 🔧 Verificar Permissões

**Via FTP, verifique permissões:**
- Arquivos PHP: `644` ou `755`
- Pastas: `755`
- `.htaccess`: `644`

### 6. 📦 Verificar Estrutura no Servidor

**Estrutura correta:**
```
public_html/ (ou htdocs/)
├── index.html          ← De dist/
├── assets/             ← De dist/assets/
├── images/             ← De dist/images/
├── logo/               ← De dist/logo/
├── pdf/                ← De dist/pdf/
├── favicon.png         ← De dist/
└── api/                ← Pasta api/ completa
    ├── .htaccess       ← NOVO! Deve existir
    ├── auth/
    ├── config/
    ├── users/
    │   └── index.php   ← Deve estar atualizado
    └── test-debug.php  ← NOVO! Para teste
```

### 7. 🐛 Debug Passo a Passo

**1. Verifique se os arquivos foram atualizados:**
```bash
# Acesse via FTP e verifique a data de modificação dos arquivos
# api/users/index.php deve ter data recente
```

**2. Teste a API diretamente:**
```bash
# No navegador, acesse:
https://novaedubncc.com.br/api/test-debug.php
```

**3. Verifique o console do navegador:**
- Abra F12 → Console
- Limpe o console (ícone de limpar)
- Recarregue a página (Ctrl+Shift+R)
- Veja se ainda aparece "API retornou HTML"

**4. Verifique a aba Network:**
- F12 → Network
- Recarregue a página
- Clique em `/api/users/`
- Veja a aba "Response" - deve mostrar JSON, não HTML

### 8. ⚡ Solução Rápida

**Se nada funcionar, tente:**

1. **Renomeie temporariamente o `index.html` na raiz:**
   ```
   index.html → index.html.bak
   ```

2. **Acesse a API:**
   ```
   https://novaedubncc.com.br/api/test-debug.php
   ```

3. **Se funcionar:** O problema é o `.htaccess` na raiz redirecionando tudo

4. **Restaure o `index.html`** e corrija o `.htaccess`

### 9. 📞 Informações para Suporte

Se ainda não funcionar, forneça:

1. **Resultado de:** `https://novaedubncc.com.br/api/test-debug.php`
2. **Screenshot do console do navegador**
3. **Conteúdo do `.htaccess` na raiz** (se existir)
4. **Estrutura de pastas no servidor** (via FTP)

---

**Última atualização:** $(date)
