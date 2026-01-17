# 📋 Instruções: Executar SQL no PHPMyAdmin

## 🎯 Objetivo

Criar todas as tabelas do banco de dados na Hostinger.

## 📋 Passo a Passo

### 1. Acessar PHPMyAdmin

1. **Login no painel da Hostinger** (hPanel)
2. **Ir em "Banco de Dados"** → "MySQL Databases"
3. **Clicar em "PHPMyAdmin"** ou acessar diretamente

### 2. Selecionar Banco

1. **No menu lateral esquerdo**, clicar no banco: `u985723830_novaedu`
2. O banco será selecionado

### 3. Executar Script SQL

1. **Clicar na aba "SQL"** (no topo)
2. **Abrir arquivo**: `database-structure-hostinger.sql`
3. **Copiar TODO o conteúdo** do arquivo
4. **Colar na área SQL** do PHPMyAdmin
5. **Clicar em "Executar"** ou pressionar F5

### 4. Verificar Resultado

**Após executar, você deve ver:**

✅ **Mensagem de sucesso**: "X consultas executadas com sucesso"

✅ **Resultado do `SHOW TABLES`**: Deve mostrar 10 tabelas:
- users
- school_years
- bncc_axes
- knowledge_objects
- skills
- activities
- video_courses
- documents
- user_progress
- activity_logs

### 5. Verificar Estrutura

**Para verificar uma tabela:**
```sql
DESCRIBE users;
```

**Deve mostrar** a estrutura da tabela com todos os campos.

## ⚠️ Se Der Erro

### Erro: "Table already exists"
- ✅ **Normal!** Significa que tabelas já existem
- Pode continuar ou ignorar

### Erro: "Unknown database"
- ❌ Banco não foi criado
- Criar banco primeiro no painel da Hostinger

### Erro: "Access denied"
- ❌ Credenciais incorretas
- Verificar usuário e senha do banco

## 📋 Checklist

- [ ] Acessar PHPMyAdmin
- [ ] Selecionar banco `u985723830_novaedu`
- [ ] Abrir aba "SQL"
- [ ] Copiar conteúdo de `database-structure-hostinger.sql`
- [ ] Colar e executar
- [ ] Verificar que 10 tabelas foram criadas
- [ ] Verificar estrutura da tabela `users`

## 🎯 Próximo Passo

**Após criar as tabelas:**
1. Gerar hash de senha para usuário root
2. Executar script para inserir usuário root
3. Testar conexão da API com banco

---

**💡 Dica**: Execute o script completo de uma vez. Se der erro de "table already exists", pode ignorar (tabelas já existem).
