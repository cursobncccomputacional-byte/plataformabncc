# ✅ Banco Criado! Próximos Passos

## 📋 Credenciais do Banco

**Banco criado com sucesso!**

```
Host: localhost (ou verificar no painel)
Banco: u985723830_novaedu
Usuário: u985723830_novaedu_root
Senha: Y8o~f~M2r
```

## 🎯 Próximos Passos

### 1. Executar Estrutura do Banco (PHPMyAdmin)

1. **Acessar PHPMyAdmin** (pelo painel da Hostinger)
2. **Selecionar banco**: `u985723830_novaedu`
3. **Clicar na aba "SQL"**
4. **Copiar e colar** o conteúdo de `database-structure-pt.sql`
5. **Clicar em "Executar"**

**Resultado esperado:**
- ✅ 10 tabelas criadas
- ✅ Índices criados
- ✅ Relacionamentos configurados

### 2. Gerar Hash de Senha para Usuário Root

**Opção 1: Via PHP (recomendado)**
1. Fazer upload de `gerar-hash-senha-simples.php` para o servidor
2. Acessar via navegador: `https://www.novaedubncc.com.br/gerar-hash-senha-simples.php`
3. Copiar o hash gerado

**Opção 2: Via linha de comando**
```bash
php gerar-hash-senha-simples.php
```

**Senha sugerida para root**: `root123` (ou criar uma senha forte)

### 3. Inserir Usuário Root

1. **Abrir arquivo**: `database-insert-root-user-hostinger.sql`
2. **Substituir** `HASH_DA_SENHA_AQUI` pelo hash gerado
3. **Substituir** `USE nome_do_seu_banco;` por `USE u985723830_novaedu;`
4. **Executar** no PHPMyAdmin

### 4. Atualizar Configuração da API

**Arquivo**: `api/config/database.php`

**Atualizar com as credenciais:**
```php
$db_config = [
    'host' => 'localhost', // Verificar se é localhost ou outro
    'dbname' => 'u985723830_novaedu',
    'username' => 'u985723830_novaedu_root',
    'password' => 'Y8o~f~M2r',
    'charset' => 'utf8mb4'
];
```

### 5. Testar Conexão

**Criar arquivo**: `api/test-connection.php`
```php
<?php
require_once __DIR__ . '/config/database.php';
echo json_encode([
    'status' => 'success',
    'message' => 'Conexão com banco OK!',
    'database' => 'u985723830_novaedu'
]);
?>
```

**Acessar**: `https://www.novaedubncc.com.br/api/test-connection.php`

**Resultado esperado:**
```json
{
    "status": "success",
    "message": "Conexão com banco OK!",
    "database": "u985723830_novaedu"
}
```

## ✅ Checklist

- [x] Banco criado
- [x] Usuário criado
- [x] Credenciais anotadas
- [ ] Estrutura SQL executada
- [ ] Hash de senha gerado
- [ ] Usuário root inserido
- [ ] API configurada
- [ ] Teste de conexão OK

## 📝 Arquivos Necessários

1. **`database-structure-pt.sql`** - Estrutura completa do banco
2. **`database-insert-root-user-hostinger.sql`** - Inserir usuário root
3. **`gerar-hash-senha-simples.php`** - Gerar hash de senha
4. **`api/config/database.php`** - Configuração da API

## ⚠️ Importante

### Segurança

- ✅ **NÃO commite** `api/config/database.php` no Git
- ✅ **Mantenha** as credenciais seguras
- ✅ **Use senha forte** para o usuário root

### Host do MySQL

**Verificar no painel da Hostinger:**
- Pode ser `localhost`
- Pode ser um IP específico
- Pode ser `mysql.hostinger.com` ou similar

**Se não for `localhost`, atualizar em `api/config/database.php`**

## 🎯 Ordem de Execução

1. ✅ Banco criado (FEITO!)
2. ⏭️ Executar estrutura SQL
3. ⏭️ Gerar hash de senha
4. ⏭️ Inserir usuário root
5. ⏭️ Configurar API
6. ⏭️ Testar conexão

---

**💡 Dica**: Execute os passos na ordem acima. Se tiver dúvida em algum passo, me avise!
