# 🔍 Verificar Estrutura da API no Servidor

## ❌ Problema: 404 na API

O erro **404 Not Found** para `/api/auth/login` indica que o servidor não está encontrando o arquivo.

## 🔍 Verificações Urgentes

### Verificação 1: Onde está a API?

**Via FileZilla, verificar:**

**Possibilidade A: DocumentRoot é `/home/supernerd/novaedu/`**
```
/home/supernerd/novaedu/
├── index.html
├── assets/
└── api/
    ├── auth/
    │   └── login.php  ← DEVE ESTAR AQUI
    └── config/
```

**Possibilidade B: DocumentRoot é `/public_html/`**
```
/public_html/
├── index.html
├── assets/
└── api/
    ├── auth/
    │   └── login.php  ← DEVE ESTAR AQUI
    └── config/
```

### Verificação 2: Testar Acesso Direto

**Acessar no navegador:**
```
https://www.novaedubncc.com.br/api/test.php
```

**Se retornar 404:**
- API não está no lugar certo
- Ou `.htaccess` está bloqueando

**Se retornar JSON:**
- API está acessível
- Problema é no caminho `/auth/login`

### Verificação 3: Verificar Caminho Físico

**Me informe:**
1. **Qual é o DocumentRoot?**
   - Verificar no painel Hostinger
   - Ou via `phpinfo()` se tiver acesso

2. **Onde está a pasta `api/`?**
   - Caminho completo no servidor
   - Exemplo: `/home/supernerd/novaedu/api/`

3. **O arquivo `login.php` existe?**
   - Caminho completo
   - Exemplo: `/home/supernerd/novaedu/api/auth/login.php`

## ✅ Solução Rápida

### Se a API está em `/novaedu/api/`

**Opção 1: Mover para raiz**
- Mover pasta `api/` para raiz do DocumentRoot
- Se DocumentRoot é `/novaedu/`, API já está no lugar certo

**Opção 2: Ajustar URL no frontend**
- Se API está em `/novaedu/api/`, mudar URL no código:
```typescript
const API_BASE_URL = 'https://www.novaedubncc.com.br/novaedu/api';
```

### Se a API não existe

**Criar estrutura:**
1. Criar pasta `api/` na raiz do DocumentRoot
2. Criar pasta `api/auth/`
3. Fazer upload de `login.php` para `api/auth/`
4. Fazer upload de `config/` para `api/config/`

## 🧪 Teste Imediato

**Criar arquivo de teste:**

**Arquivo**: `api/test-estrutura.php`

```php
<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'OK',
    'message' => 'API está acessível!',
    'file_path' => __FILE__,
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'N/A'
]);
```

**Acessar:**
```
https://www.novaedubncc.com.br/api/test-estrutura.php
```

**Resultado esperado:**
- JSON com informações do caminho ✅
- 404 ❌ (problema de estrutura)

## 📋 Checklist

- [ ] Verificar onde está a pasta `api/` no servidor
- [ ] Verificar se `login.php` existe
- [ ] Testar `api/test.php` diretamente
- [ ] Verificar DocumentRoot
- [ ] Ajustar estrutura se necessário

---

**💡 Importante**: Preciso saber onde a API está fisicamente no servidor para corrigir o problema!
