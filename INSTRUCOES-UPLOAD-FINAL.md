# 📋 Instruções Finais: Upload para Resolver 404

## ✅ Status Atual

- ✅ API está acessível (`/api/test.php` funciona)
- ✅ PHP está funcionando
- ✅ CORS resolvido
- ❌ `/api/auth/login` retorna 404

## 🔍 Causa do Problema

A requisição vai para `/api/auth/login` (sem `.php`), mas o servidor precisa mapear isso para `login.php`. Além disso, o `.htaccess` na raiz precisa garantir que requisições para `/api/` não sejam redirecionadas para `index.html`.

## 📦 Arquivos que PRECISAM ser Enviados

### 1. `.htaccess` na Raiz (ATUALIZADO)

**Arquivo:** `dist/.htaccess`

**Localização no servidor:**
- `/public_html/.htaccess`

**O que faz:**
- Impede que requisições para `/api/` sejam redirecionadas para `index.html`
- Permite que o React funcione como SPA

### 2. `.htaccess` na Pasta API

**Arquivo:** `api/.htaccess`

**Localização no servidor:**
- `/public_html/api/.htaccess`

**O que faz:**
- Garante que arquivos PHP sejam executados
- Configura headers CORS

### 3. `.htaccess` na Pasta Auth (NOVO!)

**Arquivo:** `api/auth/.htaccess`

**Localização no servidor:**
- `/public_html/api/auth/.htaccess`

**O que faz:**
- Mapeia `/api/auth/login` → `/api/auth/login.php`
- Mapeia `/api/auth/logout` → `/api/auth/logout.php`
- Mapeia `/api/auth/me` → `/api/auth/me.php`

### 4. Pasta `api/` Completa

**Verificar se todos os arquivos estão no servidor:**
- `/public_html/api/auth/login.php` ✅
- `/public_html/api/auth/logout.php` ✅
- `/public_html/api/auth/me.php` ✅
- `/public_html/api/config/cors.php` ✅
- `/public_html/api/config/database.php` ✅

## 📤 Passo a Passo de Upload

### Via FileZilla:

1. **Conectar ao servidor**

2. **Upload `.htaccess` da raiz:**
   - Local: `dist/.htaccess`
   - Servidor: `/public_html/.htaccess`
   - Substituir se existir

3. **Upload `.htaccess` da API:**
   - Local: `api/.htaccess`
   - Servidor: `/public_html/api/.htaccess`
   - Substituir se existir

4. **Upload `.htaccess` da Auth (NOVO!):**
   - Local: `api/auth/.htaccess`
   - Servidor: `/public_html/api/auth/.htaccess`
   - Criar se não existir

5. **Verificar permissões:**
   - Arquivos `.htaccess`: 644
   - Arquivos PHP: 644
   - Pastas: 755

## 🧪 Testes Após Upload

### Teste 1: Verificar se `.htaccess` está funcionando

**Acessar no navegador:**
```
https://novaedubncc.com.br/api/test.php
```
- ✅ Deve retornar JSON (já funciona)

### Teste 2: Verificar se login.php existe

**Acessar no navegador:**
```
https://novaedubncc.com.br/api/auth/login.php
```
- ✅ Deve retornar JSON (mesmo que erro de método POST)
- ❌ Se retornar 404 → arquivo não existe no servidor

### Teste 3: Verificar se rewrite funciona

**Acessar no navegador:**
```
https://novaedubncc.com.br/api/auth/login
```
- ✅ Deve retornar JSON (não 404)
- ❌ Se retornar 404 → `.htaccess` na pasta `auth/` não está funcionando

### Teste 4: Testar login completo

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
```json
{
  "error": false,
  "user": {
    "id": "root-marcus-001",
    "name": "Marcus Lopes",
    "email": "marcus.lopes",
    "role": "root",
    ...
  },
  "session_id": "..."
}
```

## ✅ Checklist Final

- [ ] `.htaccess` na raiz (`/public_html/.htaccess`)
- [ ] `.htaccess` na API (`/public_html/api/.htaccess`)
- [ ] `.htaccess` na Auth (`/public_html/api/auth/.htaccess`) ⚠️ NOVO!
- [ ] Arquivo `login.php` existe (`/public_html/api/auth/login.php`)
- [ ] Teste `/api/test.php` funciona
- [ ] Teste `/api/auth/login.php` funciona
- [ ] Teste `/api/auth/login` (sem .php) funciona
- [ ] Login completo funciona no frontend

## 🎯 Resumo

**Problema:** 404 em `/api/auth/login`

**Solução:**
1. Criado `.htaccess` em `api/auth/` para mapear URLs sem extensão
2. Atualizado `.htaccess` na raiz para melhor bloqueio de `/api/`

**Ação:** Fazer upload dos 3 arquivos `.htaccess` para o servidor

---

**💡 Após fazer upload, o login deve funcionar!**
