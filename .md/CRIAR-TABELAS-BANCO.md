# 🗄️ Criar Tabelas do Banco de Dados

## 📋 Script SQL

**Arquivo**: `database-structure-pt.sql`

Este script cria todas as tabelas necessárias para a Plataforma BNCC.

## 🎯 Como Executar

### Opção 1: Via PHPMyAdmin (Recomendado)

1. **Acessar PHPMyAdmin** (pelo painel da Hostinger)
2. **Selecionar banco**: `u985723830_novaedu`
3. **Clicar na aba "SQL"**
4. **Copiar e colar** o conteúdo completo de `database-structure-pt.sql`
5. **Clicar em "Executar"** ou pressionar F5

### Opção 2: Via Linha de Comando

```bash
mysql -u u985723830_novaedu_root -p u985723830_novaedu < database-structure-pt.sql
```

## ✅ Tabelas que Serão Criadas

1. **users** - Usuários do sistema
2. **school_years** - Anos escolares (BNCC)
3. **bncc_axes** - Eixos da BNCC
4. **knowledge_objects** - Objetos de conhecimento
5. **skills** - Habilidades/Competências
6. **activities** - Atividades educacionais
7. **video_courses** - Cursos de vídeo
8. **documents** - Documentos (PDFs, etc)
9. **user_progress** - Progresso dos usuários
10. **activity_logs** - Logs de atividades

## ⚠️ Importante

- ✅ Execute o script no banco correto: `u985723830_novaedu`
- ✅ Verifique se todas as tabelas foram criadas
- ✅ Após criar, execute o script para inserir usuário root

## 📋 Após Executar

1. **Verificar tabelas criadas:**
   ```sql
   SHOW TABLES;
   ```

2. **Verificar estrutura de uma tabela:**
   ```sql
   DESCRIBE users;
   ```

3. **Inserir usuário root:**
   - Executar `database-insert-root-user-hostinger.sql`
   - (Precisa gerar hash de senha antes)

---

**💡 Dica**: Execute o script completo de uma vez no PHPMyAdmin!
