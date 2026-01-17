# 📋 Instruções: Executar SQL em Português

## 🎯 Script Criado

**Arquivo**: `database-structure-portugues-hostinger.sql`

**Características:**
- ✅ Tabelas em português (`usuarios`, `atividades`, etc.)
- ✅ Campos em português (`nome`, `usuario`, `senha`, etc.)
- ✅ Banco configurado: `u985723830_novaedu`
- ✅ Sem erros de COMMENT em INDEX/FOREIGN KEY

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
2. **Abrir arquivo**: `database-structure-portugues-hostinger.sql`
3. **Copiar TODO o conteúdo** do arquivo
4. **Colar na área SQL** do PHPMyAdmin
5. **Clicar em "Executar"** ou pressionar F5

### 4. Verificar Resultado

**Após executar, você deve ver:**

✅ **Mensagem de sucesso**: "X consultas executadas com sucesso"

✅ **Resultado do `SHOW TABLES`**: Deve mostrar 10 tabelas em português:
- usuarios
- anos_escolares
- eixos_bncc
- objetos_conhecimento
- habilidades
- atividades
- cursos_video
- documentos
- progresso_usuario
- logs_atividade

### 5. Verificar Estrutura

**Para verificar uma tabela:**
```sql
DESCRIBE usuarios;
```

**Deve mostrar** a estrutura com campos em português:
- `nome` (não `name`)
- `usuario` (não `email`)
- `senha` (não `password`)
- `nivel_acesso` (não `role`)

## 📋 Tabelas e Campos em Português

### Tabelas:
- `usuarios` (não `users`)
- `anos_escolares` (não `school_years`)
- `eixos_bncc` (não `bncc_axes`)
- `objetos_conhecimento` (não `knowledge_objects`)
- `habilidades` (não `skills`)
- `atividades` (não `activities`)
- `cursos_video` (não `video_courses`)
- `documentos` (não `documents`)
- `progresso_usuario` (não `user_progress`)
- `logs_atividade` (não `activity_logs`)

### Campos Principais (tabela usuarios):
- `nome` (não `name`)
- `usuario` (não `email`)
- `senha` (não `password`)
- `nivel_acesso` (não `role`)
- `escola` (não `school`)
- `materias` (não `subjects`)
- `data_criacao` (não `created_at`)
- `ativo` (não `is_active`)

## ⚠️ Importante: Ajustar API

**Após criar as tabelas em português, você precisará ajustar a API!**

A API atual usa nomes em inglês. Será necessário atualizar:
- `api/auth/login.php` - usar `usuario` em vez de `email`
- `api/config/database.php` - queries com nomes em português
- Outros arquivos da API que fazem queries

## 🎯 Próximo Passo

**Após executar o script:**
1. Gerar hash de senha
2. Executar script para inserir usuário root
3. Ajustar API para usar nomes em português

---

**💡 Dica**: Execute o script e depois me avise que eu ajudo a ajustar a API para usar os nomes em português!
