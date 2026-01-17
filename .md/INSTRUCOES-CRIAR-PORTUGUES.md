# 🇧🇷 Criar Banco com Nomes em Português - Guia

## ✅ O Que Este Script Faz

O arquivo `database-structure-portugues.sql` cria todas as tabelas **diretamente em português**:
- ✅ Nomes das tabelas em português
- ✅ Nomes dos campos em português
- ✅ Comentários explicativos em português
- ✅ Estrutura completa do banco

## 🚀 Como Usar

### Passo 1: Acessar PHPMyAdmin
1. Acesse o PHPMyAdmin
2. Selecione o banco `supernerds3`

### Passo 2: Executar Script
1. Clique na aba **"SQL"**
2. Abra o arquivo **`database-structure-portugues.sql`**
3. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
4. **Cole** no editor SQL do PHPMyAdmin (Ctrl+V)
5. Clique em **"Executar"** ou **"Go"**

### Passo 3: Verificar Resultado
Você deve ver:
- ✅ Mensagem de sucesso
- ✅ 10 tabelas criadas com nomes em português:
  - `usuarios`
  - `anos_escolares`
  - `eixos_bncc`
  - `objetos_conhecimento`
  - `habilidades`
  - `atividades`
  - `cursos_video`
  - `documentos`
  - `progresso_usuario`
  - `logs_atividade`

## 📋 Mapeamento de Nomes

### Tabelas:
- `users` → `usuarios`
- `school_years` → `anos_escolares`
- `bncc_axes` → `eixos_bncc`
- `knowledge_objects` → `objetos_conhecimento`
- `skills` → `habilidades`
- `activities` → `atividades`
- `video_courses` → `cursos_video`
- `documents` → `documentos`
- `user_progress` → `progresso_usuario`
- `activity_logs` → `logs_atividade`

### Campos Principais (exemplo - tabela usuarios):
- `name` → `nome`
- `password` → `senha`
- `role` → `nivel_acesso`
- `school` → `escola`
- `subjects` → `materias`
- `created_at` → `data_criacao`
- `is_active` → `ativo`

## ⚠️ IMPORTANTE: Ajustes no Código

Após criar o banco com nomes em português, você **PRECISARÁ** ajustar o código:

### Arquivos que Precisam de Ajuste:
- `src/contexts/LocalAuthContext.tsx`
- `src/types/bncc.ts`
- Qualquer arquivo que faça queries SQL
- API backend (quando criada)

### Exemplo de Ajuste:
```typescript
// ANTES (inglês)
SELECT * FROM users WHERE email = ?

// DEPOIS (português)
SELECT * FROM usuarios WHERE email = ?
```

## 🔐 Próximo Passo: Atualizar Senhas

Após criar o banco, atualize as senhas dos usuários iniciais:

1. Execute o arquivo `atualizar-senhas.php` (ajustando os nomes das tabelas)
2. Ou use o PHPMyAdmin para atualizar manualmente

## ✅ Vantagens

- ✅ Mais fácil de entender no PHPMyAdmin
- ✅ Nomes descritivos em português
- ✅ Comentários explicativos completos

## ⚠️ Desvantagens

- ⚠️ Exige ajustes no código TypeScript/JavaScript
- ⚠️ Pode causar problemas de compatibilidade
- ⚠️ Não é o padrão da indústria

---

**💡 Dica**: Se precisar de ajuda para ajustar o código após criar o banco, me avise!
