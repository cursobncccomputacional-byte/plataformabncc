# 🧪 Guia: Testar Acesso à API

## 📋 Pré-requisitos

✅ Tabelas criadas no banco (em português)  
✅ Usuários inseridos no banco  
✅ Hash de senha gerado e inserido  

## 🧪 Teste 1: Verificar Conexão e Estrutura

### Via PHP (Script de Teste)

**Arquivo**: `api/test-login.php`

**Acessar via navegador:**
```
https://www.novaedubncc.com.br/api/test-login.php
```

**O que o script verifica:**
1. ✅ Conexão com banco de dados
2. ✅ Existência da tabela `usuarios`
3. ✅ Existência do usuário de teste
4. ✅ Validação do hash de senha
5. ✅ Simulação de login completo

**Resultado esperado:**
- Todas as verificações devem passar (✅)
- Mostra dados do usuário encontrado
- Mostra exemplo de requisição para API

## 🧪 Teste 2: Testar Login via API

### Opção A: Via cURL (Terminal)

```bash
curl -X POST https://www.novaedubncc.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root",
    "password": "root123"
  }'
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

### Opção B: Via Postman

1. **Método**: `POST`
2. **URL**: `https://www.novaedubncc.com.br/api/auth/login`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
   ```json
   {
     "email": "root",
     "password": "root123"
   }
   ```
5. **Enviar** e verificar resposta

### Opção C: Via JavaScript (Console do Navegador)

Abra o console do navegador (F12) e execute:

```javascript
fetch('https://www.novaedubncc.com.br/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'root',
    password: 'root123'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

## 🧪 Teste 3: Verificar Usuário Atual (GET /api/auth/me)

**⚠️ Requer login anterior** (sessão ativa)

### Via cURL

```bash
curl -X GET https://www.novaedubncc.com.br/api/auth/me \
  -H "Cookie: PHPSESSID=SEU_SESSION_ID_AQUI"
```

**Ou com cookie automático:**

Após fazer login via navegador (que salva cookie), acesse:
```
https://www.novaedubncc.com.br/api/auth/me
```

## 🧪 Teste 4: Listar Usuários (GET /api/users)

**⚠️ Requer permissão admin ou root**

### Via cURL

```bash
curl -X GET https://www.novaedubncc.com.br/api/users \
  -H "Cookie: PHPSESSID=SEU_SESSION_ID_AQUI"
```

## ❌ Possíveis Erros e Soluções

### Erro: "Credenciais inválidas"

**Causas possíveis:**
1. Usuário não existe no banco
2. Hash de senha incorreto
3. Usuário inativo (`ativo = 0`)

**Solução:**
- Verificar se usuário existe: `SELECT * FROM usuarios WHERE usuario = 'root'`
- Verificar se está ativo: `SELECT ativo FROM usuarios WHERE usuario = 'root'`
- Gerar novo hash e atualizar: `UPDATE usuarios SET senha = 'NOVO_HASH' WHERE usuario = 'root'`

### Erro: "Erro ao conectar com o banco de dados"

**Causas possíveis:**
1. Credenciais incorretas em `api/config/database.php`
2. Banco não existe
3. Host incorreto

**Solução:**
- Verificar `api/config/database.php`
- Testar conexão: `api/test-connection.php`

### Erro: 404 Not Found

**Causas possíveis:**
1. Arquivo não está no servidor
2. Caminho incorreto
3. `.htaccess` redirecionando incorretamente

**Solução:**
- Verificar se `api/auth/login.php` existe no servidor
- Verificar caminho: deve ser `/api/auth/login.php` (não `/novaedu/api/...`)

### Erro: 500 Internal Server Error

**Causas possíveis:**
1. Erro de sintaxe PHP
2. Erro de conexão com banco
3. Permissões incorretas

**Solução:**
- Verificar logs de erro do PHP
- Testar `api/test-connection.php`
- Verificar permissões (644 para arquivos, 755 para pastas)

## ✅ Checklist de Testes

- [ ] Teste 1: `test-login.php` passa todas as verificações
- [ ] Teste 2: Login via API retorna usuário e session_id
- [ ] Teste 3: GET /api/auth/me retorna usuário autenticado
- [ ] Teste 4: GET /api/users retorna lista (se admin/root)

## 🎯 Próximos Passos

Após confirmar que os testes passam:

1. **Testar no frontend**: Fazer login pela interface React
2. **Verificar sessão**: Confirmar que sessão persiste
3. **Testar logout**: Confirmar que logout funciona
4. **Testar outras rotas**: Verificar outras funcionalidades da API

---

**💡 Dica**: Use o script `test-login.php` primeiro para diagnosticar problemas antes de testar a API diretamente!
