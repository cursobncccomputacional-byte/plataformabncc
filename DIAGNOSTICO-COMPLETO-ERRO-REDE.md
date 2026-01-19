# 🔍 Diagnóstico Completo: Erro de Rede Persistente

## 📊 Situação Atual

**Sintomas:**
- ❌ Não funciona no navegador normal (mesmo após limpar cache)
- ✅ Funciona na guia anônima
- ✅ Funciona no celular (às vezes)
- ❌ Erro: "NetworkError when attempting to fetch resource"
- ❌ URL tentada: `https://novaedubncc.com.br/api/auth/login`

**O que já foi feito:**
- ✅ Limpeza de cache
- ✅ URL relativa `/api` implementada
- ✅ CORS configurado dinamicamente
- ✅ Retry automático implementado

---

## 🎯 Possíveis Causas (Por Probabilidade)

### 1. **Build Antigo no Servidor** (MAIS PROVÁVEL) 🔴

**Problema:**
- O JavaScript compilado no servidor ainda tem a URL antiga hardcoded
- Mesmo que o código fonte esteja correto, o build antigo está sendo servido

**Como verificar:**
1. Acesse: `https://novaedubncc.com.br/assets/index-*.js` (substitua * pelo hash)
2. Procure por: `novaedubncc.com.br` ou `www.novaedubncc.com.br`
3. Se encontrar URL absoluta hardcoded → Build antigo ainda está no servidor

**Solução:**
- Fazer rebuild: `npm run build`
- Deletar pasta `assets/` antiga no servidor
- Fazer upload completo da nova pasta `dist/`

---

### 2. **Extensões do Navegador Bloqueando** 🟡

**Problema:**
- AdBlock, Privacy Badger, uBlock Origin podem estar bloqueando requisições
- Extensões de privacidade podem bloquear cookies/credentials

**Como verificar:**
1. Desativar todas as extensões temporariamente
2. Testar login novamente
3. Se funcionar → Alguma extensão está bloqueando

**Extensões comuns que bloqueiam:**
- AdBlock / uBlock Origin
- Privacy Badger
- Ghostery
- HTTPS Everywhere (pode causar problemas com certificados)

---

### 3. **Cookies de Terceiros Bloqueados** 🟡

**Problema:**
- Navegador pode estar bloqueando cookies mesmo com `credentials: 'include'`
- Configurações de privacidade do navegador

**Como verificar:**
1. Chrome: Configurações > Privacidade e segurança > Cookies
2. Verificar se "Bloquear cookies de terceiros" está ativado
3. Testar com cookies permitidos

**Solução:**
- Permitir cookies para `novaedubncc.com.br`
- Ou usar `credentials: 'same-origin'` temporariamente (mas pode quebrar sessão)

---

### 4. **DNS/Cache de DNS** 🟡

**Problema:**
- DNS pode estar resolvendo para IP antigo ou incorreto
- Cache de DNS no sistema operacional

**Como verificar:**
```bash
# Windows
ipconfig /flushdns

# Linux/Mac
sudo dscacheutil -flushcache
# ou
sudo systemd-resolve --flush-caches
```

**Testar DNS:**
```bash
nslookup novaedubncc.com.br
ping novaedubncc.com.br
```

---

### 5. **Service Worker Registrado** 🟢

**Problema:**
- Service Worker antigo pode estar interceptando requisições
- Pode estar em cache mesmo após limpar cache do navegador

**Como verificar:**
1. Abrir DevTools (F12)
2. Aba "Application" > "Service Workers"
3. Verificar se há service workers registrados
4. Se houver, clicar em "Unregister"

---

### 6. **CSP (Content Security Policy)** 🟢

**Problema:**
- Headers CSP podem estar bloqueando requisições
- Verificar headers HTTP da resposta

**Como verificar:**
1. DevTools > Network
2. Fazer requisição
3. Verificar headers da resposta
4. Procurar por `Content-Security-Policy`

---

### 7. **Problema no Servidor (Menos Provável)** 🟢

**Problema:**
- Servidor pode estar bloqueando requisições de certas origens
- Firewall do servidor

**Como verificar:**
- Testar diretamente: `https://novaedubncc.com.br/api/auth/login`
- Se retornar erro de método (405) → API está acessível
- Se não conectar → Problema no servidor/rede

---

## 🛠️ Plano de Ação (Ordem de Prioridade)

### Passo 1: Verificar Build no Servidor (URGENTE)

```bash
# 1. Fazer rebuild
npm run build

# 2. Verificar arquivo gerado
# Abrir: dist/assets/index-*.js
# Procurar por: "novaedubncc" ou "/api"
# Deve encontrar: "/api" (URL relativa)
# NÃO deve encontrar: "https://novaedubncc.com.br/api" (URL absoluta)
```

### Passo 2: Testar com Extensões Desativadas

1. Abrir navegador em modo de extensões desativadas
2. Ou desativar manualmente todas as extensões
3. Testar login

### Passo 3: Verificar Service Workers

1. DevTools > Application > Service Workers
2. Desregistrar todos
3. Testar login

### Passo 4: Testar Diretamente a API

Abrir no navegador:
```
https://novaedubncc.com.br/api/auth/login
```

**Resultado esperado:**
- JSON com erro "Método não permitido" (405) → API está acessível ✅
- Erro de conexão → Problema no servidor/rede ❌

### Passo 5: Adicionar Logs Detalhados

Adicionar logs no código para ver exatamente o que está acontecendo.

---

## 📝 Próximos Passos

1. **Verificar build no servidor** (mais provável)
2. **Testar com extensões desativadas**
3. **Verificar service workers**
4. **Testar API diretamente**
5. **Adicionar logs detalhados se necessário**

---

**Data**: 2024
**Versão**: 1.0
