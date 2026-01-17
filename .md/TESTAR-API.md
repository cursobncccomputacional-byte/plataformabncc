# 🧪 Como Testar a API

## 📋 Pré-requisitos

1. ✅ Banco de dados criado
2. ✅ Usuário root inserido (marcus.lopes)
3. ✅ API PHP no servidor

## 🚀 Testar Endpoints

### 1. Testar Login

**Comando curl:**
```bash
curl -X POST https://www.novaedubncc.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marcus.lopes","password":"?&,6bsMrD08a"}'
```

**Com Postman:**
- Método: POST
- URL: `https://www.novaedubncc.com.br/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "marcus.lopes",
  "password": "?&,6bsMrD08a"
}
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

### 2. Testar Obter Usuário Atual

**Com curl (com cookie de sessão):**
```bash
curl -X GET https://www.novaedubncc.com.br/api/auth/me \
  -H "Cookie: PHPSESSID=SEU_SESSION_ID"
```

### 3. Testar Listar Usuários

**Com curl:**
```bash
curl -X GET https://www.novaedubncc.com.br/api/users/ \
  -H "Cookie: PHPSESSID=SEU_SESSION_ID"
```

## 🔍 Verificar no PHPMyAdmin

1. Acesse o PHPMyAdmin
2. Selecione o banco `supernerds3`
3. Tabela `usuarios`
4. Verifique se o usuário `marcus.lopes` existe

## ⚠️ Troubleshooting

### Erro 500
- Verifique se o PHP está configurado
- Verifique logs de erro do PHP
- Verifique conexão com banco

### Erro 401 (Não autenticado)
- Verifique se o email/senha estão corretos
- Verifique se o usuário está ativo no banco

### Erro 403 (Acesso negado)
- Verifique se o usuário tem permissão
- Verifique se a sessão está ativa

---

**💡 Dica**: Use o Postman para facilitar os testes!
