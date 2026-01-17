# 🚀 Guia Rápido: Criar Banco na Hostinger

## 📋 Passo a Passo Rápido

### 1. Criar Banco e Usuário (Painel Hostinger)

1. **Login no hPanel**
2. **Ir em "Banco de Dados"** → "MySQL Databases"
3. **Criar banco:**
   - Nome: `plataforma_bncc`
   - Criar
4. **Criar usuário:**
   - Usuário: `plataforma_bncc_user`
   - Senha: (criar senha forte)
   - Criar
5. **Associar usuário ao banco:**
   - Dar todas as permissões
   - Salvar

### 2. Anotar Credenciais

```
Host: localhost (ou IP fornecido)
Banco: plataforma_bncc
Usuário: plataforma_bncc_user
Senha: [senha criada]
```

### 3. Executar SQL (PHPMyAdmin)

1. **Abrir PHPMyAdmin**
2. **Selecionar banco** criado
3. **Aba "SQL"**
4. **Copiar e colar**: `database-structure-pt.sql`
5. **Executar**

### 4. Gerar Hash de Senha

**Opção 1: Via PHP (recomendado)**
- Fazer upload de `gerar-hash-senha-simples.php`
- Acessar via navegador
- Copiar o hash gerado

**Opção 2: Via linha de comando**
```bash
php gerar-hash-senha-simples.php
```

### 5. Inserir Usuário Root

1. **Abrir**: `database-insert-root-user-hostinger.sql`
2. **Substituir**: `HASH_DA_SENHA_AQUI` pelo hash gerado
3. **Executar** no PHPMyAdmin

### 6. Atualizar API

**Arquivo**: `api/config/database.php`

```php
$db_config = [
    'host' => 'localhost',
    'dbname' => 'plataforma_bncc',
    'username' => 'plataforma_bncc_user',
    'password' => 'senha_criada',
    'charset' => 'utf8mb4'
];
```

## ✅ Checklist Rápido

- [ ] Banco criado
- [ ] Usuário criado
- [ ] Credenciais anotadas
- [ ] SQL estrutura executado
- [ ] Hash de senha gerado
- [ ] Usuário root inserido
- [ ] API configurada
- [ ] Teste de conexão OK

## 🧪 Testar

**Criar**: `api/test-connection.php`
```php
<?php
require_once __DIR__ . '/config/database.php';
echo json_encode(['status' => 'success']);
?>
```

**Acessar**: `https://www.novaedubncc.com.br/api/test-connection.php`

---

**💡 Dica**: Se já conhece a Hostinger, o processo é o mesmo dos seus outros projetos!
