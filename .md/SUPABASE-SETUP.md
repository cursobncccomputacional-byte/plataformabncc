# Configuração do Supabase - Plataforma BNCC

## Passo a Passo para Configurar

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta gratuita
3. Clique em "New Project"
4. Preencha:
   - **Name**: `plataforma-bncc`
   - **Database Password**: crie uma senha forte
   - **Region**: escolha a mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"
6. Aguarde a criação (2-3 minutos)

### 2. Obter Credenciais

1. No painel do Supabase, vá para **Settings > API**
2. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa)

### 3. Configurar Variáveis de Ambiente

1. Edite o arquivo `.env` na raiz do projeto
2. Substitua os valores pelos seus:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   ```

### 4. Configurar Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `database-setup.sql`
4. Cole no editor e clique em "Run"

### 5. Testar a Aplicação

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Acesse `http://localhost:5173`
3. Teste o cadastro e login

## Usuários de Teste

Após configurar, você pode:

### Criar usuário via interface:
- Email: `teste@exemplo.com`
- Senha: `123456`
- Nome: `Usuário Teste`

### Ou criar via SQL:
```sql
-- No SQL Editor do Supabase
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'teste@exemplo.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

## Estrutura do Banco

- **profiles**: Perfis dos usuários
- **video_courses**: Cursos de vídeo disponíveis
- **documents**: Documentos e materiais
- **user_progress**: Progresso dos usuários nos cursos

## Políticas de Segurança

- Usuários só podem ver/editar seus próprios dados
- Cursos e documentos são públicos para leitura
- Progresso é privado por usuário
