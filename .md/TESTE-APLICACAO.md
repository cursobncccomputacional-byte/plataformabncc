# 🧪 Como Testar a Plataforma BNCC

## ✅ Status Atual
- ✅ **Aplicação rodando** em http://localhost:5173
- ✅ **Supabase configurado** (com credenciais de exemplo)
- ✅ **Banco de dados estruturado** (SQL criado)
- ✅ **Autenticação funcional** (com fallbacks)

## 🚀 Para Testar Agora

### 1. **Teste da Interface (Funciona sem Supabase real)**
- Acesse: `http://localhost:5173`
- Navegue pela página inicial
- Clique em "Entrar" para ver a tela de login
- Teste o formulário de cadastro

### 2. **Teste com Supabase Real (Recomendado)**

#### Passo 1: Criar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto chamado "plataforma-bncc"
4. Aguarde a criação (2-3 minutos)

#### Passo 2: Configurar Credenciais
1. No painel do Supabase: **Settings > API**
2. Copie a **Project URL** e **anon public key**
3. Edite o arquivo `.env` no projeto:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

#### Passo 3: Configurar Banco
1. No Supabase: **SQL Editor**
2. Copie todo o conteúdo do arquivo `database-setup.sql`
3. Execute o script

#### Passo 4: Testar Autenticação
1. Reinicie o servidor: `npm run dev`
2. Acesse a aplicação
3. Crie uma conta de teste:
   - **Email**: `teste@exemplo.com`
   - **Senha**: `123456`
   - **Nome**: `Usuário Teste`

## 📋 Funcionalidades Disponíveis

### ✅ **Funcionando Agora:**
- Interface responsiva
- Navegação entre páginas
- Formulários de login/cadastro
- Componentes visuais

### 🔄 **Funcionará com Supabase:**
- Autenticação real
- Cadastro de usuários
- Dashboard personalizado
- Cursos de vídeo
- Documentos
- Progresso do usuário

## 🎯 Próximos Passos

1. **Teste a interface atual** (já funciona)
2. **Configure Supabase real** (para autenticação completa)
3. **Teste todas as funcionalidades**

## 📁 Arquivos Criados

- `.env` - Variáveis de ambiente
- `database-setup.sql` - Script do banco de dados
- `SUPABASE-SETUP.md` - Instruções detalhadas
- `TESTE-APLICACAO.md` - Este arquivo

## 🆘 Em Caso de Problemas

1. **Erro de conexão**: Verifique as credenciais no `.env`
2. **Erro de banco**: Execute o script SQL no Supabase
3. **Erro de autenticação**: Verifique as políticas RLS

---

**🎉 A aplicação está pronta para uso!**

