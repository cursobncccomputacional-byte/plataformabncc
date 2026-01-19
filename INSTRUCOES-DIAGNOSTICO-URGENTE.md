# 🚨 Instruções Urgentes: Diagnosticar Erro de Firewall

## ⚠️ Situação

Você subiu os arquivos atualizados, mas ainda dá erro de "firewall". Isso pode ser:

1. **Cache do navegador** (mais provável - 80% dos casos)
2. **.htaccess não foi enviado** ou está incorreto
3. **JavaScript antigo ainda em cache** no servidor

## 🔍 DIAGNÓSTICO RÁPIDO (FAZER AGORA)

### Passo 1: Verificar URL no Console

**No computador que está dando erro:**

1. Abrir: `https://novaedubncc.com.br`
2. Abrir DevTools (F12)
3. Ir na aba **Network** (Rede)
4. Tentar fazer login
5. Procurar pela requisição `/auth/login`
6. Clicar nela
7. **Verificar a URL completa** que aparece em "Request URL"

**O que você deve ver:**
- ✅ `https://novaedubncc.com.br/api/auth/login` → **CORRETO**
- ❌ `https://www.novaedubncc.com.br/api/auth/login` → **ERRADO** (com www)
- ❌ `https://novaedubncc.com.br/novaedu/api/auth/login` → **ERRADO** (com /novaedu/)

**Me envie:**
- Qual URL aparece?
- Qual é o Status HTTP? (200, 404, CORS error, etc.)

### Passo 2: Limpar Cache Completamente

**IMPORTANTE:** Fazer isso ANTES de testar:

1. **Chrome/Edge:**
   - Pressionar `Ctrl + Shift + Delete`
   - Marcar "Imagens e arquivos em cache"
   - Período: "Todo o período"
   - Clicar em "Limpar dados"

2. **Firefox:**
   - Pressionar `Ctrl + Shift + Delete`
   - Marcar "Cache"
   - Período: "Tudo"
   - Clicar em "Limpar agora"

3. **Ou usar modo anônimo/privado:**
   - `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Firefox)
   - Tentar fazer login

### Passo 3: Verificar .htaccess no Servidor

**Via FileZilla/FTP:**

1. Conectar ao servidor
2. Navegar até a **raiz do site** (onde está o `index.html`)
3. Verificar se existe arquivo `.htaccess`
4. Se existir, abrir e verificar se tem a regra:

```apache
# REGRA 1: Se começa com /api/, PARAR (não redirecionar)
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^ - [L]
```

**Se não tiver essa regra:**
- Fazer upload do arquivo `dist/.htaccess` que acabei de criar
- Substituir o existente

### Passo 4: Verificar JavaScript no Servidor

**Via navegador:**

1. Abrir: `https://novaedubncc.com.br`
2. Abrir DevTools (F12) → aba **Network**
3. Recarregar a página (F5)
4. Procurar pelo arquivo `index-*.js` (o JavaScript compilado)
5. Clicar nele
6. Na aba **Response** ou **Preview**, procurar por: `novaedubncc.com.br/api`

**O que você deve encontrar:**
- ✅ `https://novaedubncc.com.br/api` → **CORRETO**
- ❌ `https://www.novaedubncc.com.br/api` → **ERRADO** (versão antiga)
- ❌ `https://novaedubncc.com.br/novaedu/api` → **ERRADO** (versão antiga)

**Se encontrar URL errada:**
- O upload não funcionou corretamente
- Fazer upload novamente da pasta `dist/` completa

## 🛠️ SOLUÇÃO RÁPIDA

### Se o problema for cache:

1. **Limpar cache** (Passo 2 acima)
2. **Fechar TODOS os navegadores**
3. **Abrir novamente** em modo anônimo
4. **Testar login**

### Se o problema for .htaccess:

1. **Fazer upload** do arquivo `dist/.htaccess` para a raiz do servidor
2. **Substituir** o existente
3. **Aguardar 2-3 minutos**
4. **Testar novamente**

### Se o problema for JavaScript antigo:

1. **Deletar TODOS os arquivos** da pasta `assets/` no servidor
2. **Fazer upload novamente** da pasta `dist/` completa
3. **Limpar cache** e testar

## 📋 CHECKLIST

- [ ] Cache limpo completamente
- [ ] Testado em modo anônimo/privado
- [ ] URL verificada no console (Network)
- [ ] .htaccess verificado no servidor
- [ ] JavaScript verificado (URL correta)
- [ ] Upload feito novamente (se necessário)

## 💬 INFORMAÇÕES QUE PRECISO

**Para resolver definitivamente, preciso que você me envie:**

1. **Print do console** (F12 → Network) mostrando:
   - A requisição `/auth/login`
   - A URL completa
   - O Status HTTP
   - A resposta (se houver)

2. **Resultado do teste direto:**
   - Acessar: `https://novaedubncc.com.br/api/auth/me`
   - O que aparece? (JSON, HTML, erro?)

3. **Se o .htaccess existe no servidor:**
   - Sim ou não?
   - Se sim, qual é o conteúdo?

---

**Com essas informações, consigo identificar EXATAMENTE o problema e resolver!**
