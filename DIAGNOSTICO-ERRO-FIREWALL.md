# 🔍 Diagnóstico: Erro de Firewall Após Upload

## ⚠️ Situação

- ✅ Build feito com URL correta
- ✅ Arquivos atualizados no servidor
- ❌ Ainda dá erro de "firewall" / "Failed to fetch"

## 🔍 Possíveis Causas

### 1. Cache do Navegador (Mais Provável)

O navegador pode estar usando a versão antiga em cache.

**Solução:**
1. **Limpar cache completamente:**
   - Chrome/Edge: `Ctrl + Shift + Delete` → Marcar "Imagens e arquivos em cache" → Limpar
   - Firefox: `Ctrl + Shift + Delete` → Marcar "Cache" → Limpar
   - Ou usar modo anônimo/privado

2. **Hard Refresh:**
   - `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
   - Ou `Ctrl + F5`

3. **Limpar cache do site específico:**
   - Abrir DevTools (F12)
   - Clicar com botão direito no botão de recarregar
   - Escolher "Esvaziar cache e atualizar forçadamente"

### 2. URL Ainda Está Errada no Servidor

O arquivo JavaScript compilado pode não ter sido atualizado corretamente.

**Verificar:**
1. Abrir: `https://novaedubncc.com.br`
2. Abrir DevTools (F12) → aba **Network**
3. Tentar fazer login
4. Procurar pela requisição `/auth/login`
5. **Verificar a URL completa** que está sendo chamada

**URLs esperadas:**
- ✅ `https://novaedubncc.com.br/api/auth/login`
- ❌ `https://www.novaedubncc.com.br/api/auth/login` (com www)
- ❌ `https://novaedubncc.com.br/novaedu/api/auth/login` (com /novaedu/)

### 3. Arquivo JavaScript Não Foi Atualizado

O servidor pode estar servindo a versão antiga do JavaScript.

**Verificar:**
1. Abrir: `https://novaedubncc.com.br/assets/index-*.js`
2. Procurar por: `novaedubncc.com.br/api`
3. Verificar se está **sem www** e **sem /novaedu/**

**Se encontrar URL errada:**
- O upload não funcionou corretamente
- Fazer upload novamente, garantindo que todos os arquivos foram substituídos

### 4. Problema de CORS

O servidor pode estar bloqueando requisições de certas origens.

**Verificar:**
1. Abrir DevTools (F12) → aba **Console**
2. Tentar fazer login
3. Procurar por erros de CORS

**Erro típico:**
```
Access to fetch at 'https://novaedubncc.com.br/api/auth/login' from origin 'https://novaedubncc.com.br' has been blocked by CORS policy
```

**Solução:**
- Verificar arquivo `api/config/cors.php` no servidor
- Garantir que está permitindo `https://novaedubncc.com.br`

### 5. .htaccess Redirecionando Incorretamente

O `.htaccess` pode estar redirecionando `/api/` para `index.html`.

**Verificar:**
1. Verificar se há arquivo `.htaccess` na raiz do servidor
2. Verificar se há regra que redireciona `/api/` para `index.html`

**Solução:**
- Adicionar exceção no `.htaccess` para não redirecionar `/api/`

### 6. Problema de Certificado SSL

O certificado pode estar inválido ou expirado.

**Verificar:**
1. Acessar: `https://novaedubncc.com.br/api/auth/me`
2. Verificar se há aviso de certificado inválido

## 🛠️ Passos de Diagnóstico

### Passo 1: Verificar URL no Console

1. Abrir: `https://novaedubncc.com.br`
2. Abrir DevTools (F12) → aba **Network**
3. Tentar fazer login
4. Clicar na requisição `/auth/login`
5. Verificar:
   - **Request URL** (URL completa)
   - **Status** (200, 404, CORS error, etc.)
   - **Response** (o que a API retornou)

### Passo 2: Verificar JavaScript Compilado

1. Abrir: `https://novaedubncc.com.br`
2. Abrir DevTools (F12) → aba **Sources** ou **Network**
3. Procurar pelo arquivo `index-*.js`
4. Abrir o arquivo
5. Procurar por: `novaedubncc.com.br/api`
6. Verificar se está correto

### Passo 3: Testar API Diretamente

1. Abrir: `https://novaedubncc.com.br/api/auth/me`
2. Deve retornar JSON (mesmo que com erro 401)

**Se não funcionar:**
- Problema no servidor/API
- Verificar se pasta `api/` existe no servidor

### Passo 4: Verificar Cache

1. Abrir em **modo anônimo/privado**
2. Tentar fazer login
3. Se funcionar → problema de cache
4. Se não funcionar → problema no servidor

## 📋 Checklist de Verificação

- [ ] Cache do navegador limpo
- [ ] Testado em modo anônimo/privado
- [ ] URL verificada no console (Network)
- [ ] JavaScript compilado verificado (URL correta)
- [ ] API testada diretamente (`/api/auth/me`)
- [ ] .htaccess verificado (não redireciona `/api/`)
- [ ] CORS verificado (sem erros no console)
- [ ] Certificado SSL válido

## 🚀 Solução Rápida

**Se nada funcionar, tentar:**

1. **Deletar todos os arquivos antigos** do servidor (exceto `api/`)
2. **Fazer upload novamente** da pasta `dist/` completa
3. **Aguardar 5-10 minutos** (propagação de DNS/cache)
4. **Limpar cache** e testar novamente

## 💡 Informações Necessárias

**Para diagnosticar melhor, preciso:**

1. **Print do console** (F12 → aba Network) mostrando a requisição `/auth/login`
   - URL completa
   - Status HTTP
   - Erro (se houver)

2. **Print do console** (F12 → aba Console) mostrando erros

3. **Resultado do teste direto:**
   - Acessar: `https://novaedubncc.com.br/api/auth/me`
   - O que aparece?

4. **URL que aparece no Network:**
   - Qual é a URL exata que está sendo chamada?

---

**Com essas informações, consigo identificar exatamente o problema!**
