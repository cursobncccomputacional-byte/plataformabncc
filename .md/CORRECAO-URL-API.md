# ✅ Correção Aplicada: URL da API

## 🔧 O Que Foi Corrigido

### 1. URL da API no Frontend

**Arquivo**: `src/services/apiService.ts`

**ANTES:**
```typescript
const API_BASE_URL = 'https://www.novaedubncc.com.br/novaedu/api';
```

**DEPOIS:**
```typescript
const API_BASE_URL = 'https://www.novaedubncc.com.br/api';
```

### 2. Tratamento de Erro Melhorado

**Adicionado verificação de Content-Type:**
- Verifica se a resposta é JSON antes de fazer parse
- Mostra erro claro se API retornar HTML
- Evita erro `SyntaxError: Unexpected token '<'`

## 📋 Próximos Passos

### 1. Rebuild do Frontend

```bash
npm run build
```

### 2. Upload para Servidor

**Upload:**
- Pasta `dist/` → servidor (substituir arquivos existentes)
- Pasta `api/` → `/api/` no servidor (se ainda não estiver)

### 3. Verificar Estrutura no Servidor

**Estrutura correta:**
```
public_html/ (ou DocumentRoot)
├── index.html
├── assets/
└── api/
    ├── auth/
    │   └── login.php
    ├── config/
    └── test-api-json.php
```

### 4. Testar

**Teste 1: API direto**
```
https://www.novaedubncc.com.br/api/test-api-json.php
```
**Esperado:** JSON ✅

**Teste 2: Login no frontend**
- Abrir `https://www.novaedubncc.com.br`
- Tentar fazer login
- Verificar console (não deve ter erro de JSON)

## ⚠️ Se Ainda Der Erro

### Erro: "API não está retornando JSON"

**Causas possíveis:**
1. API não está em `/api/` no servidor
2. `.htaccess` está redirecionando `/api/` para `index.html`
3. Arquivo PHP não existe no servidor

**Solução:**
1. Verificar estrutura via FileZilla
2. Verificar `.htaccess` na raiz
3. Testar `test-api-json.php` diretamente

### Erro: 404 Not Found

**Causa:** API não está no lugar certo

**Solução:**
- Mover pasta `api/` para raiz do servidor
- Verificar caminho: deve ser `/api/`, não `/novaedu/api/`

## ✅ Checklist

- [x] URL corrigida no `apiService.ts`
- [x] Tratamento de erro melhorado
- [ ] Rebuild do frontend (`npm run build`)
- [ ] Upload do `dist/` para servidor
- [ ] Verificar API em `/api/` no servidor
- [ ] Testar `test-api-json.php`
- [ ] Testar login no frontend

---

**💡 Dica**: Após o rebuild e upload, limpe o cache do navegador (Ctrl+Shift+R) para garantir que está usando a nova versão!
