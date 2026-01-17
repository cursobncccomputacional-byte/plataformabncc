# ⚠️ AVISO IMPORTANTE: Renomeação para Português

## 📋 O Que Foi Feito

Criei o script `database-renomear-pt.sql` que renomeia:
- ✅ **Todas as tabelas** para português
- ✅ **Todos os campos** para português
- ✅ **Atualiza foreign keys** e índices
- ✅ **Mantém os dados** existentes

## 🔄 Mapeamento de Nomes

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

## ⚠️ ATENÇÃO: Ajustes Necessários no Código

Após executar este script, você **PRECISARÁ** ajustar:

### 1. Código TypeScript/JavaScript
- Todos os arquivos que fazem queries SQL
- Todos os arquivos que referenciam nomes de tabelas/campos
- Contextos de autenticação
- Serviços de API

### 2. Arquivos que Precisam de Ajuste:
- `src/contexts/LocalAuthContext.tsx`
- `src/types/bncc.ts` (se houver referências diretas)
- Qualquer arquivo que faça queries SQL
- API backend (quando criada)

## 🎯 Recomendação

**Antes de executar**, considere:

1. **Manter em inglês** (padrão da indústria)
   - ✅ Mais fácil de integrar com código
   - ✅ Evita problemas com caracteres especiais
   - ✅ Padrão internacional

2. **Renomear para português** (se preferir)
   - ✅ Mais fácil de entender no PHPMyAdmin
   - ⚠️ Exige ajustes em todo o código
   - ⚠️ Pode causar problemas de compatibilidade

## 💡 Sugestão

Se você quer **facilidade no PHPMyAdmin** mas **sem quebrar o código**:

**Use os comentários em português** (script já executado):
- Nomes técnicos em inglês (compatível com código)
- Comentários explicativos em português (fácil de entender)

## 🚀 Se Decidir Renomear

1. Execute `database-renomear-pt.sql` no PHPMyAdmin
2. Depois, me avise que eu ajudo a ajustar o código
3. Será necessário atualizar vários arquivos

---

**💡 Minha recomendação**: Mantenha os nomes em inglês e use os comentários em português. É o melhor dos dois mundos!
