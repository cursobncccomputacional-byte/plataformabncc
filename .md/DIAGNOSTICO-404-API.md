# 🔍 Diagnóstico: 404 na API

## ❌ Erro Identificado

**Console mostra:**
```
Failed to load resource: the server responded with a status of 404
/api/auth/login
```

**Isso significa:**
- O servidor não está encontrando o arquivo `/api/auth/login.php`
- Pode ser problema de estrutura de pastas ou `.htaccess`

## 🔍 Verificações Necessárias

### Verificação 1: Estrutura no Servidor

**Via FileZilla, verificar:**

**Caminho esperado:**
```
/home/supernerd/novaedu/api/auth/login.php
```

**OU (se DocumentRoot é diferente):**
```
/public_html/api/auth/login.php
```

**Verificar:**
- [ ] A pasta `api/` existe?
- [ ] A pasta `api/auth/` existe?
- [ ] O arquivo `login.php` existe dentro de `api/auth/`?

### Verificação 2: URL Correta

**No código frontend:**
- URL configurada: `https://www.novaedubncc.com.br/api`
- Endpoint: `/auth/login`
- URL completa: `https://www.novaedubncc.com.br/api/auth/login`

**No servidor:**
- Caminho físico deve corresponder à URL
- Se URL é `/api/auth/login`, arquivo deve estar em `/api/auth/login.php`

### Verificação 3: .htaccess Bloqueando

**Teste direto no navegador:**
```
https://www.novaedubncc.com.br/api/test.php
```

**Se retornar 404:**
- `.htaccess` pode estar bloqueando
- Ou arquivo não existe

**Se retornar JSON:**
- `.htaccess` está OK
- Problema é no caminho `/auth/login`

## ✅ Soluções

### Solução 1: Verificar Estrutura Real

**Me informe:**
1. Qual é o **DocumentRoot** do servidor?
   - Pode ser `/home/supernerd/novaedu/`
   - Ou `/public_html/`
   - Ou outro

2. Onde está a pasta `api/`?
   - Caminho completo no servidor

3. O arquivo `login.php` existe?
   - Caminho completo

### Solução 2: Testar Acesso Direto

**Criar arquivo de teste:**

**Arquivo**: `api/test-direto.php`

```php
<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'OK',
    'message' => 'API está acessível!',
    'path' => __FILE__
]);
```

**Acessar:**
```
https://www.novaedubncc.com.br/api/test-direto.php
```

**Se funcionar:**
- API está acessível
- Problema é no caminho `/auth/login`

**Se não funcionar:**
- Problema é na estrutura ou `.htaccess`

### Solução 3: Verificar .htaccess

**Arquivo**: `dist/.htaccess` (na raiz)

**Deve ter (já corrigido):**
```apache
# NÃO redirecionar /api/
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^ - [L]
```

**Arquivo**: `api/.htaccess`

**Deve ter:**
```apache
RewriteEngine Off
```

## 🧪 Testes Rápidos

### Teste A: API Básica
```
https://www.novaedubncc.com.br/api/test.php
```

### Teste B: API Auth
```
https://www.novaedubncc.com.br/api/auth/login.php
```

### Teste C: Verificar Headers
**Via cURL:**
```bash
curl -I https://www.novaedubncc.com.br/api/test.php
```

## 📋 Informações Necessárias

**Preciso saber:**
1. Qual é o **DocumentRoot** do domínio?
2. Onde está a pasta `api/` no servidor? (caminho completo)
3. O arquivo `login.php` existe? (caminho completo)
4. O que retorna ao acessar `https://www.novaedubncc.com.br/api/test.php`?

Com essas informações, consigo identificar exatamente o problema!

---

**💡 Dica**: O 404 indica que o arquivo não está sendo encontrado. Precisamos verificar a estrutura real no servidor.
