# 📋 Escolha da Versão do Script SQL

## Duas Versões Disponíveis

### 1. `database-structure.sql` (Original)
- Nomes em inglês (padrão da indústria)
- Melhor para integração com código
- Recomendado para desenvolvimento

### 2. `database-structure-pt.sql` (Nova - Com Comentários em Português)
- **Nomes das tabelas e campos em inglês** (mantido para compatibilidade)
- **Comentários completos em português** em todos os campos
- Facilita muito a compreensão ao trabalhar no PHPMyAdmin
- **Recomendado para uso!**

## 🎯 Recomendação

**Use o arquivo `database-structure-pt.sql`** - Ele tem:
- ✅ Todos os comentários explicativos em português
- ✅ Descrição clara de cada campo
- ✅ Explicação dos relacionamentos
- ✅ Mantém compatibilidade com o código

## 📝 Exemplo de Comentários

No arquivo `database-structure-pt.sql`, cada campo tem comentários como:

```sql
role ENUM('root', 'admin', 'professor', 'aluno') NOT NULL 
COMMENT 'Nível de acesso: root (gerenciamento total), admin (gerencia professores e alunos), professor (assiste vídeos e baixa documentos), aluno (acessa atividades e jogos)'
```

Isso facilita muito ao visualizar a estrutura no PHPMyAdmin!

## ⚠️ Importante

- Os **nomes das tabelas e campos** permanecem em inglês (padrão)
- Apenas os **comentários** estão em português
- Isso mantém a compatibilidade com o código TypeScript/JavaScript
- No PHPMyAdmin, você verá os comentários ao visualizar a estrutura das tabelas

---

**💡 Dica**: Execute o `database-structure-pt.sql` no PHPMyAdmin para ter a melhor experiência!
