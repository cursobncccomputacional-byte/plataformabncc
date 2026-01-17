# 🔧 Correção: URL sem www

## ❌ Problema Identificado

**Erro no console:**
```
net::ERR_CERT_COMMON_NAME_INVALID
Redirecting navigation www.novaedubncc.com.br -> novaedubncc.com.br because the server presented a certificate valid for novaedubncc.com.br but not for www.novaedubncc.com.br
```

**Causa:**
- Certificado SSL é válido apenas para `novaedubncc.com.br` (sem www)
- Código estava usando `www.novaedubncc.com.br` (com www)
- Isso causa erro de certificado

## ✅ Correção Aplicada

### 1. URL da API Corrigida

**Arquivo**: `src/services/apiService.ts`

**ANTES:**
```typescript
const API_BASE_URL = 'https://www.novaedubncc.com.br/api';
```

**DEPOIS:**
```typescript
const API_BASE_URL = 'https://novaedubncc.com.br/api';
```

### 2. CORS Atualizado

**Arquivo**: `api/config/cors.php`

**Alterado:**
- `novaedubncc.com.br` agora é o primeiro na lista
- Mantém `www.novaedubncc.com.br` como fallback

## 📋 Próximos Passos

### 1. Rebuild do Frontend

```bash
npm run build
```

### 2. Upload para Servidor

**Upload:**
- Pasta `dist/` → servidor
- Arquivo `api/config/cors.php` → servidor

### 3. Testar

**Após rebuild e upload:**
1. Limpar cache do navegador
2. Acessar: `https://novaedubncc.com.br` (sem www)
3. Testar login

## 🎯 Alternativa: Configurar Certificado para www

**Se preferir usar www:**

**No painel Hostinger:**
1. Verificar se certificado inclui `www.novaedubncc.com.br`
2. Se não incluir, reinstalar certificado
3. Ou configurar redirecionamento `www` → sem `www`

## ✅ Vantagem da Solução Atual

**Usar sem www:**
- ✅ Certificado já funciona
- ✅ Não precisa reinstalar SSL
- ✅ Funciona imediatamente após rebuild

---

**💡 Importante**: Após rebuild e upload, o login deve funcionar! O problema era o `www` na URL da API.
