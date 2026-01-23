# 📋 Instruções para Atualizar o Banco de Dados

## 🎯 Objetivo

Atualizar o banco de dados `u985723830_novaedu` para suportar:
- ✅ Novo perfil `professor_cursos` (Formação Continuada)
- ✅ Tabelas do módulo cursos
- ✅ Sistema de permissões por curso

---

## 📝 Passo a Passo

### 1. **Fazer Backup do Banco**

**IMPORTANTE:** Sempre faça backup antes de executar scripts SQL!

```sql
-- No phpMyAdmin ou cliente MySQL:
-- 1. Selecionar o banco: u985723830_novaedu
-- 2. Clicar em "Exportar"
-- 3. Escolher método: "Rápido"
-- 4. Clicar em "Executar"
```

### 2. **Executar Script de Atualização**

**Opção A: Via phpMyAdmin**
1. Acessar phpMyAdmin
2. Selecionar banco: `u985723830_novaedu`
3. Clicar na aba "SQL"
4. Copiar e colar o conteúdo de `update-database-complete.sql`
5. Clicar em "Executar"

**Opção B: Via Linha de Comando**
```bash
mysql -u u985723830_novaedu_root -p u985723830_novaedu < cursos/.sql/update-database-complete.sql
```

**Opção C: Via Cliente MySQL (MySQL Workbench, DBeaver, etc.)**
1. Conectar ao banco `u985723830_novaedu`
2. Abrir arquivo `update-database-complete.sql`
3. Executar script

### 3. **Verificar Resultado**

O script exibirá mensagens de status. Verifique se apareceu:
- ✅ "Tabela usuarios atualizada com sucesso!"
- ✅ "Tabela cursos criada/verificada!"
- ✅ "Tabela aulas criada/verificada!"
- ✅ "Tabela permissoes_cursos criada/verificada!"
- ✅ "Tabela inscricoes criada/verificada!"
- ✅ "Tabela progresso_aulas criada/verificada!"
- ✅ "ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"

### 4. **Verificação Manual (Opcional)**

Execute estas queries para confirmar:

```sql
-- Verificar ENUM atualizado
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
AND TABLE_NAME = 'usuarios' 
AND COLUMN_NAME = 'nivel_acesso';
-- Deve mostrar: enum('root','admin','professor','aluno','professor_cursos')

-- Verificar tabelas criadas
SHOW TABLES LIKE 'cursos%';
SHOW TABLES LIKE 'aulas%';
SHOW TABLES LIKE 'permissoes_cursos%';
SHOW TABLES LIKE 'inscricoes%';
SHOW TABLES LIKE 'progresso_aulas%';

-- Verificar estrutura da tabela aulas (deve ter campo modulo)
DESCRIBE aulas;
```

---

## ⚠️ Possíveis Erros e Soluções

### Erro: "Table 'usuarios' doesn't exist"
**Solução:** A tabela ainda não foi criada. Execute primeiro o script de criação inicial do banco.

### Erro: "Duplicate column name 'modulo'"
**Solução:** O campo `modulo` já existe. Isso é normal, o script detecta e ignora.

### Erro: "Cannot add foreign key constraint"
**Solução:** Verifique se a tabela `cursos` existe antes de criar `aulas`. O script cria na ordem correta.

### Erro de permissões
**Solução:** Certifique-se de que o usuário `u985723830_novaedu_root` tem permissões de ALTER e CREATE.

---

## ✅ Checklist Pós-Atualização

- [ ] Backup realizado
- [ ] Script executado sem erros
- [ ] ENUM `nivel_acesso` contém `professor_cursos`
- [ ] Tabela `cursos` existe
- [ ] Tabela `aulas` existe e tem campo `modulo`
- [ ] Tabela `permissoes_cursos` existe
- [ ] Tabela `inscricoes` existe
- [ ] Tabela `progresso_aulas` existe
- [ ] Teste de criação de usuário `professor_cursos` funcionando

---

## 🚀 Próximos Passos

Após atualizar o banco:

1. **Testar criação de usuário:**
   - Login como Root
   - Criar usuário com perfil "Formação Continuada"
   - Verificar se foi salvo corretamente

2. **Criar curso de teste:**
   ```sql
   INSERT INTO cursos (id, titulo, status) 
   VALUES ('teste-curso', 'Curso de Teste', 'publicado');
   ```

3. **Associar usuário ao curso:**
   ```sql
   INSERT INTO permissoes_cursos (usuario_id, curso_id) 
   VALUES ('professor_cursos-usuario-123', 'teste-curso');
   ```

4. **Testar login:**
   - Login com usuário `professor_cursos` em `cursos.novaedubncc.com.br`
   - Verificar se vê apenas o curso permitido

---

**Data**: 2024
**Versão**: 1.0
