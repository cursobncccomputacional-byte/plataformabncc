# 🗑️ Excluir Todas as Tabelas do Banco - Guia

## ⚠️ ATENÇÃO

Este script **EXCLUI TODAS AS TABELAS E SEUS DADOS** do banco `supernerds3`.

**Use apenas se:**
- ✅ Quer recriar tudo do zero
- ✅ Não tem dados importantes no banco
- ✅ Quer começar com uma estrutura limpa

## 🚀 Como Usar

### Passo 1: Acessar PHPMyAdmin
1. Acesse o PHPMyAdmin
2. Selecione o banco `supernerds3`

### Passo 2: Executar Script
1. Clique na aba **"SQL"**
2. Abra o arquivo **`database-drop-all-tables.sql`**
3. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
4. **Cole** no editor SQL do PHPMyAdmin (Ctrl+V)
5. Clique em **"Executar"** ou **"Go"**

### Passo 3: Verificar
Você deve ver:
- Mensagem de sucesso
- Lista de tabelas vazia (SHOW TABLES deve retornar vazio)

## 📋 O Que Será Excluído

Todas as tabelas serão removidas:
- ✅ `users` / `usuarios`
- ✅ `school_years` / `anos_escolares`
- ✅ `bncc_axes` / `eixos_bncc`
- ✅ `knowledge_objects` / `objetos_conhecimento`
- ✅ `skills` / `habilidades`
- ✅ `activities` / `atividades`
- ✅ `video_courses` / `cursos_video`
- ✅ `documents` / `documentos`
- ✅ `user_progress` / `progresso_usuario`
- ✅ `activity_logs` / `logs_atividade`
- ✅ Qualquer outra tabela existente

## 🔄 Próximo Passo

Após excluir, você pode:

1. **Recriar com estrutura em inglês:**
   - Execute `database-structure.sql`

2. **Recriar com comentários em português:**
   - Execute `database-structure-pt.sql`

3. **Recriar e renomear para português:**
   - Execute `database-structure.sql`
   - Depois execute `database-renomear-pt-corrigido.sql`

## ⚠️ Importante

- **Backup**: Se tiver dados importantes, faça backup antes!
- **Irreversível**: A exclusão não pode ser desfeita
- **Dados perdidos**: Todos os dados serão perdidos permanentemente

## 💡 Dica

Se quiser apenas limpar os dados mas manter a estrutura:
```sql
-- Limpar dados mas manter tabelas
TRUNCATE TABLE users;
TRUNCATE TABLE activities;
-- etc...
```

---

**⚠️ Certifique-se de que realmente quer excluir tudo antes de executar!**
