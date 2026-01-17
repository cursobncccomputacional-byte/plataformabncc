# 🧪 Como Testar a API Corretamente

## ✅ Teste Correto

### 1. Testar via Navegador (GET)

**Acesse diretamente:**
```
https://www.novaedubncc.com.br/novaedu/api/test.php
```

**O que deve aparecer:**
```json
{
  "status": "OK",
  "message": "API está acessível!",
  "php_version": "7.4.33",
  "server": "Apache/2.4.65",
  "timestamp": "2026-01-15 12:00:00"
}
```

**Se aparecer HTML ou erro:**
- A API não está configurada corretamente
- Ou o arquivo não foi enviado

### 2. Testar Login via Console do Navegador

**Abra o console (F12) e execute:**
```javascript
fetch('https://www.novaedubncc.com.br/novaedu/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'marcus.lopes',
    password: '?&,6bsMrD08a'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

**Resposta esperada:**
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

### 3. Testar via cURL (Terminal)

```bash
curl -X POST https://www.novaedubncc.com.br/novaedu/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marcus.lopes","password":"?&,6bsMrD08a"}'
```

## ⚠️ Problemas Comuns

### Erro: Retorna HTML em vez de JSON

**Causa**: Servidor está redirecionando ou arquivo não existe

**Solução**:
1. Verifique se o arquivo `test.php` existe em `/novaedu/api/`
2. Verifique permissões (644)
3. Verifique se o `.htaccess` da API está correto

### Erro: CORS

**Causa**: CORS não configurado

**Solução**: Verifique `api/config/cors.php`

### Erro: 500 Internal Server Error

**Causa**: Erro no PHP ou banco de dados

**Solução**: 
1. Verifique `api/config/database.php`
2. Verifique logs de erro do PHP

---

**💡 Dica**: O `test.php` é apenas para teste. Após confirmar que funciona, você pode removê-lo por segurança.
