# 🧪 Testar API na Hostinger

## ✅ Status Atual

- ✅ Banco criado: `u985723830_novaedu`
- ✅ API configurada: `api/config/database.php`
- ✅ Pasta `api/` enviada para o servidor
- 🌐 Domínio: `https://www.novaedubncc.com.br/`

## 🧪 Testes a Fazer

### 1. Testar PHP Funciona

**URL**: `https://www.novaedubncc.com.br/api/test-direto.php`

**Resultado esperado:**
```
PHP FUNCIONANDO DIRETO!
```

**Se funcionar**: ✅ PHP está OK, pode continuar
**Se não funcionar**: ❌ Verificar se arquivo foi enviado corretamente

### 2. Testar Conexão com Banco

**URL**: `https://www.novaedubncc.com.br/api/test-connection.php`

**Resultado esperado:**
```json
{
    "status": "success",
    "message": "Conexão com banco de dados OK!",
    "database": "u985723830_novaedu",
    "server_time": "2024-...",
    "php_version": "8.x"
}
```

**Se funcionar**: ✅ Banco conectado, tudo OK!
**Se não funcionar**: ❌ Verificar:
- Credenciais em `api/config/database.php`
- Host do MySQL (pode não ser `localhost`)
- Banco foi criado corretamente

### 3. Testar API Básica

**URL**: `https://www.novaedubncc.com.br/api/test.php`

**Resultado esperado:**
```json
{
    "status": "success",
    "message": "API funcionando!",
    "timestamp": "..."
}
```

### 4. Testar Endpoint de Login

**URL**: `https://www.novaedubncc.com.br/api/auth/login.php`

**Método**: POST

**Body (JSON)**:
```json
{
    "email": "teste@teste.com",
    "password": "senha123"
}
```

**Resultado esperado:**
- Se usuário não existe: `{"error": true, "message": "Credenciais inválidas"}`
- Se usuário existe: `{"success": true, "user": {...}}`

## 🔍 Verificar Estrutura

**Estrutura esperada no servidor:**
```
/
├── api/
│   ├── .htaccess
│   ├── config/
│   │   ├── database.php
│   │   ├── cors.php
│   │   └── auth.php
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── me.php
│   ├── users/
│   │   └── index.php
│   ├── test.php
│   ├── test-direto.php
│   └── test-connection.php
```

## ⚠️ Problemas Comuns

### 1. Erro 404 - Arquivo não encontrado

**Causa**: Caminho incorreto ou arquivo não enviado

**Solução**:
- Verificar se arquivo existe no servidor
- Verificar caminho correto: `/api/test-direto.php`
- Verificar permissões (644 para arquivos)

### 2. Erro 500 - Erro interno do servidor

**Causa**: Erro no PHP ou configuração

**Solução**:
- Verificar logs de erro do PHP
- Verificar se `database.php` tem credenciais corretas
- Verificar se extensões PHP estão habilitadas (PDO, MySQLi)

### 3. Erro de Conexão com Banco

**Causa**: Credenciais incorretas ou host errado

**Solução**:
- Verificar host do MySQL no painel da Hostinger
- Pode ser `localhost` ou outro (ex: `mysql.hostinger.com`)
- Verificar se banco foi criado
- Verificar se usuário tem permissões

### 4. CORS Error (no navegador)

**Causa**: CORS não configurado

**Solução**:
- Verificar `api/config/cors.php`
- Verificar se headers estão sendo enviados

## 📋 Checklist de Testes

- [ ] PHP funciona: `test-direto.php`
- [ ] Conexão com banco: `test-connection.php`
- [ ] API básica: `test.php`
- [ ] Estrutura de pastas correta
- [ ] Arquivos com permissões corretas (644)
- [ ] `.htaccess` na pasta `api/` (se necessário)

## 🎯 Próximos Passos

Após confirmar que a API está funcionando:

1. ✅ Executar estrutura do banco (`database-structure-pt.sql`)
2. ✅ Gerar hash de senha e inserir usuário root
3. ✅ Fazer upload do frontend (pasta `dist/`)
4. ✅ Configurar `.htaccess` na raiz
5. ✅ Testar login completo

## 💡 Dicas

- **Teste primeiro** a conexão com banco antes de continuar
- **Verifique logs** se houver erros
- **Use Postman ou Insomnia** para testar endpoints POST
- **Verifique permissões** dos arquivos (644 para arquivos, 755 para pastas)

---

**💡 Comece testando**: `https://www.novaedubncc.com.br/api/test-direto.php`

Se esse funcionar, teste a conexão com banco!
