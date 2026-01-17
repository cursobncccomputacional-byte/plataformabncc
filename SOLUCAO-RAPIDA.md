# ⚡ Solução Rápida - API Retornando HTML

## 🔴 Problema

A API ainda retorna HTML em vez de JSON, mesmo após fazer build e enviar arquivos.

## ✅ Solução em 3 Passos

### Passo 1: Enviar `.htaccess` para a Raiz

**Arquivo:** `dist/.htaccess` (já criado)

**Envie este arquivo para a raiz do servidor** (mesmo nível que `index.html`)

**⚠️ IMPORTANTE:** Se já existe um `.htaccess` na raiz, **SUBSTITUA** pelo novo!

### Passo 2: Verificar se Arquivos Foram Enviados

**Via FTP, verifique:**

- [ ] `api/.htaccess` existe? (criado recentemente)
- [ ] `api/users/index.php` foi atualizado? (data recente)
- [ ] `api/test-debug.php` existe? (novo arquivo)
- [ ] `.htaccess` na raiz foi atualizado?

### Passo 3: Testar

**1. Limpe o cache do navegador:**
   - `Ctrl + Shift + R` (Windows)
   - `Cmd + Shift + R` (Mac)

**2. Teste a API diretamente:**
   ```
   https://novaedubncc.com.br/api/test-debug.php
   ```

   **Se retornar JSON:** ✅ Funcionou!
   
   **Se retornar HTML:** ❌ O `.htaccess` na raiz não foi atualizado ou não está no lugar certo

## 🔍 Diagnóstico

### Se `test-debug.php` retorna HTML:

**Causa:** O `.htaccess` na raiz está redirecionando `/api/` para `index.html`

**Solução:**
1. Via FTP, acesse a raiz do servidor
2. Baixe o `.htaccess` atual (backup)
3. Envie o novo `dist/.htaccess` para a raiz
4. Teste novamente

### Se `test-debug.php` retorna JSON mas `/api/users/` retorna HTML:

**Causa:** Os arquivos PHP não foram atualizados

**Solução:**
1. Envie novamente a pasta `api/` completa
2. Certifique-se de que `api/users/index.php` foi substituído
3. Teste novamente

## 📦 Arquivos para Enviar AGORA

1. **`dist/.htaccess`** → Raiz do servidor (substituir o existente)
2. **`api/` completa** → Pasta `/api/` no servidor
3. **`dist/` completa** → Raiz do servidor

## ⚠️ Checklist Final

- [ ] `.htaccess` na raiz foi substituído
- [ ] Pasta `api/` foi enviada completamente
- [ ] Cache do navegador foi limpo
- [ ] `test-debug.php` retorna JSON
- [ ] `/api/users/` retorna JSON (não HTML)

---

**Se ainda não funcionar após isso, o problema pode ser:**
- Permissões de arquivos incorretas
- Servidor não suporta mod_rewrite
- PHP não está habilitado
