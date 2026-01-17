# 🗄️ Criar Banco de Dados na Hostinger

## 📋 Passo a Passo

### 1. Acessar PHPMyAdmin

1. **Login no painel da Hostinger** (hPanel)
2. **Ir em "Banco de Dados"** ou "MySQL Databases"
3. **Clicar em "PHPMyAdmin"** ou acessar diretamente

### 2. Criar Banco de Dados

**No painel da Hostinger (antes do PHPMyAdmin):**

1. **Criar novo banco de dados:**
   - Nome: `plataforma_bncc` (ou o nome que preferir)
   - Clique em "Criar" ou "Add Database"

2. **Criar usuário do banco:**
   - Usuário: `plataforma_bncc_user` (ou o nome que preferir)
   - Senha: (gerar senha forte ou criar uma)
   - **ANOTAR** essas credenciais!

3. **Associar usuário ao banco:**
   - Dar todas as permissões (ALL PRIVILEGES)
   - Salvar

### 3. Anotar Credenciais

**Você precisará de:**
- ✅ **Host do MySQL**: Geralmente `localhost` (ou IP fornecido)
- ✅ **Nome do banco**: `plataforma_bncc` (ou o que você criou)
- ✅ **Usuário**: `plataforma_bncc_user` (ou o que você criou)
- ✅ **Senha**: (a senha que você criou)

**💡 Dica**: Salve essas informações em um arquivo seguro!

### 4. Executar Script SQL

**No PHPMyAdmin:**

1. **Selecionar o banco** criado (no menu lateral esquerdo)
2. **Clicar na aba "SQL"** (no topo)
3. **Copiar e colar** o conteúdo do arquivo `database-structure-pt.sql`
4. **Clicar em "Executar"** ou pressionar F5

**Arquivo a usar**: `database-structure-pt.sql`

### 5. Verificar Tabelas Criadas

**Após executar o script:**

1. **Verificar se as tabelas foram criadas:**
   - Deve aparecer no menu lateral:
     - ✅ `users`
     - ✅ `school_years`
     - ✅ `bncc_axes`
     - ✅ `knowledge_objects`
     - ✅ `skills`
     - ✅ `activities`
     - ✅ `video_courses`
     - ✅ `documents`
     - ✅ `user_progress`
     - ✅ `activity_logs`

2. **Verificar estrutura:**
   - Clicar em uma tabela (ex: `users`)
   - Verificar se os campos estão corretos

### 6. Criar Usuário Root

**Ainda no PHPMyAdmin:**

1. **Clicar na aba "SQL"** novamente
2. **Copiar e colar** o conteúdo do arquivo `database-insert-root-user.sql`
3. **MODIFICAR** antes de executar:
   - Trocar o hash da senha por um hash real
   - Ou usar o script PHP para gerar o hash

**Opção 1: Usar script PHP para gerar hash**

Criar arquivo `gerar-hash-senha.php`:
```php
<?php
$senha = 'sua_senha_aqui';
echo password_hash($senha, PASSWORD_DEFAULT);
?>
```

**Opção 2: Usar hash direto**

O script já tem um hash de exemplo, mas você deve gerar um novo.

### 7. Atualizar Configuração da API

**Arquivo**: `api/config/database.php`

**Atualizar com as credenciais da Hostinger:**
```php
$db_config = [
    'host' => 'localhost', // Ou IP fornecido pela Hostinger
    'dbname' => 'plataforma_bncc', // Nome do banco criado
    'username' => 'plataforma_bncc_user', // Usuário criado
    'password' => 'senha_criada', // Senha criada
    'charset' => 'utf8mb4'
];
```

## 📝 Checklist

- [ ] Acessar PHPMyAdmin
- [ ] Criar banco de dados
- [ ] Criar usuário do banco
- [ ] Associar usuário ao banco
- [ ] Anotar credenciais (host, banco, usuário, senha)
- [ ] Executar `database-structure-pt.sql`
- [ ] Verificar tabelas criadas
- [ ] Criar usuário root (com hash de senha)
- [ ] Atualizar `api/config/database.php`
- [ ] Testar conexão

## 🔧 Scripts SQL Necessários

### 1. Estrutura do Banco
**Arquivo**: `database-structure-pt.sql`
- Cria todas as tabelas
- Cria índices
- Cria relacionamentos

### 2. Usuário Root
**Arquivo**: `database-insert-root-user.sql`
- **ATENÇÃO**: Precisa gerar hash de senha antes!

## ⚠️ Importante

### Hash de Senha

**O hash da senha deve ser gerado com PHP:**
```php
<?php
echo password_hash('sua_senha', PASSWORD_DEFAULT);
?>
```

**NÃO use senha em texto plano!**

### Credenciais

**Mantenha as credenciais seguras:**
- ✅ Não commite no Git
- ✅ Use arquivo `.env` ou similar
- ✅ Não compartilhe publicamente

## 🧪 Testar Conexão

**Após configurar tudo:**

1. **Criar arquivo de teste**: `api/test-connection.php`
2. **Conteúdo:**
```php
<?php
require_once __DIR__ . '/config/database.php';
echo json_encode(['status' => 'success', 'message' => 'Conexão OK']);
?>
```

3. **Acessar**: `https://www.novaedubncc.com.br/api/test-connection.php`
4. **Resultado esperado**: `{"status":"success","message":"Conexão OK"}`

## 💡 Próximos Passos

Após criar o banco:
1. ✅ Configurar API (`api/config/database.php`)
2. ✅ Fazer upload dos arquivos
3. ✅ Testar conexão
4. ✅ Testar login
5. ✅ Verificar se tudo funciona

---

**💡 Dica**: Se você já tem experiência com Hostinger, o processo deve ser familiar. Use o mesmo padrão dos seus outros projetos!
