# 🗄️ Configuração do Banco de Dados - PHPMyAdmin

## ✅ Credenciais Recebidas

- **Banco de Dados**: `supernerds3`
- **Usuário**: `supernerds3`
- **Senha**: `*.BDnovaedu2026!`
- **Host**: (geralmente `localhost` ou IP do servidor)

## 🚀 Passo a Passo para Criar o Banco

### 1. Acessar PHPMyAdmin

1. Acesse o PHPMyAdmin (geralmente via painel da Hostnet)
2. Faça login com as credenciais:
   - **Usuário**: `supernerds3`
   - **Senha**: `*.BDnovaedu2026!`

### 2. Selecionar/Criar Banco

1. No menu lateral, selecione o banco `supernerds3`
2. Ou crie um novo banco se não existir:
   - Clique em "Novo" ou "New"
   - Nome: `supernerds3`
   - Collation: `utf8mb4_unicode_ci`
   - Clique em "Criar"

### 3. Executar Script SQL

1. No PHPMyAdmin, clique na aba **"SQL"**
2. Abra o arquivo `database-structure.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole** no editor SQL do PHPMyAdmin
5. Clique em **"Executar"** ou **"Go"**

### 4. Verificar Criação

Após executar, verifique:

1. **Tabelas criadas**: Deve aparecer 10 tabelas:
   - `users`
   - `school_years`
   - `bncc_axes`
   - `knowledge_objects`
   - `skills`
   - `activities`
   - `video_courses`
   - `documents`
   - `user_progress`
   - `activity_logs`

2. **Usuários iniciais**: Verifique se os usuários root e admin foram criados

## ⚠️ IMPORTANTE: Senhas

As senhas no script estão como `PLACEHOLDER_PASSWORD_HASH`. Você precisa:

1. **Gerar hash das senhas** usando PHP:
```php
<?php
// Gerar hash para root
echo password_hash('root123', PASSWORD_DEFAULT);
// Copie o hash gerado

// Gerar hash para admin
echo password_hash('admin123', PASSWORD_DEFAULT);
// Copie o hash gerado
```

2. **Atualizar no banco**:
```sql
-- Atualizar senha do root
UPDATE users 
SET password = 'HASH_GERADO_AQUI' 
WHERE email = 'root@plataformabncc.com';

-- Atualizar senha do admin
UPDATE users 
SET password = 'HASH_GERADO_AQUI' 
WHERE email = 'admin@plataformabncc.com';
```

## 📋 Estrutura Criada

### Tabelas Principais

1. **users** - Usuários do sistema (root, admin, professor, aluno)
2. **school_years** - Anos escolares (Educação Infantil, Anos Iniciais, etc.)
3. **bncc_axes** - Eixos da BNCC
4. **knowledge_objects** - Objetos de conhecimento
5. **skills** - Habilidades da BNCC
6. **activities** - Atividades educacionais
7. **video_courses** - Cursos de vídeo
8. **documents** - Documentos (PDFs, DOCX, PPTX)
9. **user_progress** - Progresso dos usuários
10. **activity_logs** - Logs de atividades

## 🔐 Segurança

- ✅ Senhas serão hasheadas (não em texto plano)
- ✅ Índices criados para performance
- ✅ Foreign keys para integridade
- ✅ Charset UTF8MB4 para suporte completo a caracteres

## 📝 Próximos Passos

Após criar o banco:

1. ✅ Verificar se todas as tabelas foram criadas
2. ✅ Atualizar senhas dos usuários iniciais
3. ⏳ Criar API backend para conectar com o banco
4. ⏳ Migrar dados do localStorage (se necessário)
5. ⏳ Testar integração frontend/backend

## 🧪 Testar Conexão

Após criar o banco, você pode testar a conexão usando o arquivo `testar-conexao.php`:

1. **Via PHP CLI** (se tiver acesso):
   ```bash
   php testar-conexao.php
   ```

2. **Via navegador** (upload no servidor):
   - Faça upload do arquivo `testar-conexao.php` para o servidor
   - Acesse via navegador: `https://seudominio.com/testar-conexao.php`

3. **IMPORTANTE**: Após testar, **DELETE** o arquivo `testar-conexao.php` do servidor por segurança!

## 🔐 Atualizar Senhas

Após criar o banco, você precisa atualizar as senhas dos usuários iniciais:

### Opção 1: Script PHP (Recomendado)
1. Faça upload do arquivo `atualizar-senhas.php` para o servidor
2. Execute via navegador ou CLI: `php atualizar-senhas.php`
3. **DELETE** o arquivo após usar!

### Opção 2: Manual (PHPMyAdmin)
1. Execute o arquivo `gerar-hashes-senhas.php` localmente
2. Copie os comandos SQL gerados
3. Execute no PHPMyAdmin na aba SQL

---

**💡 Dica:** Execute o script SQL no PHPMyAdmin e depois atualize as senhas dos usuários iniciais!
