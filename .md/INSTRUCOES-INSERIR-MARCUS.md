# 📋 Instruções: Inserir Usuário Root - Marcus Lopes

## 🎯 Script Criado

**Arquivo**: `database-insert-marcus-root.sql`

**Dados do usuário:**
- **ID**: `root-marcus-001`
- **Nome**: `Marcus Lopes`
- **Usuário**: `marcus.lopes`
- **Hash**: `$2a$12$LSJq5QenvGRC3irGi6WXxueWPucOWQNQ8d9hih4BIRMaRDupdXwy6`
- **Senha**: `?&,6bsMrD08a`
- **Nível**: `root`
- **Ativo**: `TRUE`

## 📋 Passo a Passo

### 1. Acessar PHPMyAdmin

1. **Login no painel da Hostinger** (hPanel)
2. **Ir em "Banco de Dados"** → "MySQL Databases"
3. **Clicar em "PHPMyAdmin"**

### 2. Selecionar Banco

1. **No menu lateral**, clicar no banco: `u985723830_novaedu`
2. O banco será selecionado

### 3. Executar Script SQL

1. **Clicar na aba "SQL"** (no topo)
2. **Abrir arquivo**: `database-insert-marcus-root.sql`
3. **Copiar TODO o conteúdo** do arquivo
4. **Colar na área SQL** do PHPMyAdmin
5. **Clicar em "Executar"** ou pressionar F5

### 4. Verificar Resultado

**Após executar, você deve ver:**

✅ **Mensagem de sucesso**: "1 linha afetada" ou similar

✅ **Resultado do SELECT**: Deve mostrar o usuário inserido:
```
id: root-marcus-001
nome: Marcus Lopes
usuario: marcus.lopes
nivel_acesso: root
ativo: 1
```

### 5. Testar Hash (Opcional)

**Acesse no navegador:**
```
https://www.novaedubncc.com.br/api/test-hash-marcus.php
```

**O que verifica:**
- ✅ Se o hash está correto
- ✅ Se o usuário existe no banco
- ✅ Se o hash no banco corresponde à senha

## 🧪 Testar Login

### Via API

**URL**: `https://www.novaedubncc.com.br/api/auth/login`  
**Método**: `POST`  
**Body (JSON)**:
```json
{
  "email": "marcus.lopes",
  "password": "?&,6bsMrD08a"
}
```

**Resultado esperado:**
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

### Via Script de Teste

**Acesse:**
```
https://www.novaedubncc.com.br/api/test-login.php
```

**Altere no código** (se necessário):
- `$testUsuario = 'marcus.lopes';`
- `$testSenha = '?&,6bsMrD08a';`

## ⚠️ Se Der Erro

### Erro: "Duplicate entry"

**Causa**: Usuário já existe no banco

**Solução**: O script usa `ON DUPLICATE KEY UPDATE`, então ele atualizará o usuário existente. Isso é normal!

### Erro: "Table 'usuarios' doesn't exist"

**Causa**: Tabela ainda não foi criada

**Solução**: Execute primeiro o script `database-structure-portugues-hostinger.sql`

### Erro: "Hash está incorreto" no teste

**Causa**: Hash copiado incorretamente ou senha diferente

**Solução**: 
1. Verifique se o hash foi copiado completamente
2. Execute `test-hash-marcus.php` para validar

## ✅ Checklist

- [ ] Script SQL executado com sucesso
- [ ] Usuário aparece no SELECT
- [ ] Hash validado via `test-hash-marcus.php`
- [ ] Login funciona via API

## 🎯 Próximo Passo

Após inserir o usuário:

1. **Testar login** via API
2. **Testar no frontend** React
3. **Verificar permissões** (deve ter acesso root)

---

**💡 Dica**: Use `test-hash-marcus.php` para verificar se tudo está correto antes de testar o login!
