# ⚡ Teste Rápido de Login

## 🎯 Teste Mais Simples

### 1. Teste via Script PHP

**Acesse no navegador:**
```
https://www.novaedubncc.com.br/api/test-login.php
```

**O que faz:**
- ✅ Verifica conexão com banco
- ✅ Verifica se tabela existe
- ✅ Verifica se usuário existe
- ✅ Testa hash de senha
- ✅ Simula login completo

**Resultado esperado:**
- Todas as verificações passam (✅)
- Mostra dados do usuário
- Mostra exemplo de requisição

### 2. Teste via Formulário HTML

**Acesse no navegador:**
```
https://www.novaedubncc.com.br/api/test-login-html.html
```

**O que faz:**
- Formulário interativo
- Testa login via API
- Mostra resultado visual

**Como usar:**
1. Abra a URL acima
2. Preencha usuário e senha
3. Clique em "Testar Login"
4. Veja o resultado

### 3. Teste via cURL (Terminal)

```bash
curl -X POST https://www.novaedubncc.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"root","password":"root123"}'
```

**Resultado esperado:**
```json
{
  "error": false,
  "user": {
    "id": "root001",
    "name": "Root Administrator",
    "email": "root",
    "role": "root",
    ...
  },
  "session_id": "..."
}
```

## ⚠️ Se Der Erro

### Erro: "Credenciais inválidas"

**Verificar:**
1. Usuário existe? Execute no PHPMyAdmin:
   ```sql
   SELECT * FROM usuarios WHERE usuario = 'root';
   ```

2. Hash está correto? Execute no PHPMyAdmin:
   ```sql
   SELECT usuario, senha FROM usuarios WHERE usuario = 'root';
   ```
   
   O hash deve começar com `$2y$` ou `$2a$`

3. Usuário está ativo?
   ```sql
   SELECT ativo FROM usuarios WHERE usuario = 'root';
   ```
   
   Deve retornar `1` (TRUE)

### Erro: 404 Not Found

**Verificar:**
- Arquivo existe no servidor? `/api/auth/login.php`
- Caminho correto? Deve ser `/api/` (não `/novaedu/api/`)

### Erro: 500 Internal Server Error

**Verificar:**
- Conexão com banco: `api/test-connection.php`
- Permissões dos arquivos (644)
- Logs de erro do PHP

## ✅ Checklist

- [ ] `test-login.php` passa todas as verificações
- [ ] Login via API retorna usuário
- [ ] Session ID é retornado
- [ ] Dados do usuário estão corretos

## 🎯 Próximo Passo

Após confirmar que o login funciona:

1. **Testar no frontend React**
2. **Verificar persistência de sessão**
3. **Testar outras rotas da API**

---

**💡 Dica**: Comece pelo `test-login.php` - ele mostra exatamente onde está o problema!
