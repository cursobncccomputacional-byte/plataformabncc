# 🚨 Rebuild Urgente: Erro CORS Persistente

## ❌ Problema Atual

**Erro no console:**
```
Access to fetch at 'https://www.novaedubncc.com.br/api/auth/login' 
from origin 'https://novaedubncc.com.br' has been blocked by CORS policy
```

**Causa:**
- Build antigo ainda está no servidor
- Requisição ainda vai para `www.novaedubncc.com.br` (com www)
- Frontend está em `novaedubncc.com.br` (sem www)
- São origens diferentes → CORS bloqueia

## ✅ Solução: Rebuild e Upload Completo

### 1. Verificar Código (Já Está Correto)

**Arquivo**: `src/services/apiService.ts`
```typescript
const API_BASE_URL = 'https://novaedubncc.com.br/api'; // ✅ SEM www
```

### 2. Fazer Rebuild

**Execute:**
```bash
npm run build
```

**Isso vai:**
- ✅ Compilar código com URL `novaedubncc.com.br` (sem www)
- ✅ Gerar novos arquivos em `dist/`
- ✅ Substituir build antigo

### 3. Upload Completo (CRÍTICO)

**Via FTP, fazer upload:**

**Pasta `dist/` → `/public_html/`:**
- ✅ **DELETAR** pasta `assets/` antiga primeiro
- ✅ Upload de **TODA** pasta `dist/` (substituir tudo)
- ✅ `.htaccess` (substituir)
- ✅ `index.html` (substituir)
- ✅ Nova pasta `assets/` (substituir)

**Arquivo `api/config/cors.php`:**
- ✅ Upload para `/public_html/api/config/cors.php`

### 4. Limpar Cache do Navegador

**Método 1: Limpar Cache**
1. **Ctrl+Shift+Delete**
2. **Selecionar**: "Imagens e arquivos em cache"
3. **Período**: "Todo o período"
4. **Limpar dados**

**Método 2: Modo Anônimo (Recomendado)**
- **Ctrl+Shift+N** (Chrome)
- Acessar: `https://novaedubncc.com.br`
- Testar login

**Método 3: Hard Refresh**
- **Ctrl+Shift+R** (Chrome)
- Ou **Ctrl+F5**

### 5. Verificar Build

**Após upload, verificar:**

**1. Abrir arquivo JavaScript:**
- Acessar: `https://novaedubncc.com.br/assets/index-*.js`
- Procurar por: `novaedubncc.com.br`
- **Se encontrar `www.novaedubncc.com.br`**: Build antigo ainda está no servidor
- **Se encontrar `novaedubncc.com.br` (sem www)**: Build novo está correto

**2. Verificar data de modificação:**
- Via FTP, verificar data dos arquivos em `assets/`
- Se data antiga → upload não foi feito

## 🎯 Teste Após Correção

**1. Acessar SEM www:**
```
https://novaedubncc.com.br
```

**2. Abrir console (F12)**

**3. Tentar login:**
- Usuário: `marcus.lopes`
- Senha: `?&,6bsMrD08a`

**4. Verificar no console:**
- ✅ Requisição deve ir para: `https://novaedubncc.com.br/api/auth/login` (sem www)
- ✅ Sem erro de CORS
- ✅ Sem erro de SSL
- ✅ Resposta JSON

## ⚠️ Se Ainda Não Funcionar

### Verificar 1: Build foi feito?

**Comando:**
```bash
npm run build
```

**Verificar:**
- Pasta `dist/` foi atualizada?
- Data de modificação dos arquivos?

### Verificar 2: Upload foi completo?

**Via FTP:**
- Verificar se pasta `assets/` foi substituída
- Verificar data de modificação
- Se data antiga → upload não foi feito

### Verificar 3: Cache do navegador?

**Testar em modo anônimo:**
- Se funcionar em anônimo → problema é cache
- Limpar cache completamente

### Verificar 4: CORS no servidor

**Se build estiver correto mas CORS ainda falhar:**

**Verificar arquivo**: `/public_html/api/.htaccess`

**Deve ter:**
```apache
# Headers CORS
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-Session-ID"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>
```

## 📋 Checklist Completo

- [ ] Código verificado (já está correto)
- [ ] `npm run build` executado
- [ ] Pasta `dist/` atualizada
- [ ] Upload completo feito (substituir tudo)
- [ ] Pasta `assets/` antiga deletada
- [ ] Nova pasta `assets/` enviada
- [ ] `.htaccess` atualizado
- [ ] `api/config/cors.php` atualizado
- [ ] Cache do navegador limpo
- [ ] Testado em modo anônimo
- [ ] Requisição vai para URL sem www
- [ ] Login funciona

---

**💡 IMPORTANTE**: O problema é que o build antigo ainda está no servidor. Execute `npm run build` AGORA e faça upload completo substituindo TUDO!
