# ✅ Implementação: Perfil Professor Cursos e Permissões por Curso

## 📋 O Que Foi Implementado

### 1. **Novo Perfil: `professor_cursos`** ✅

**Características:**
- ✅ Acesso **apenas** ao subdomínio `cursos.novaedubncc.com.br`
- ✅ **Não** acessa o domínio principal (`novaedubncc.com.br`)
- ✅ Visualiza **apenas** os cursos aos quais tem permissão
- ✅ Criado pelo Root através do painel principal

---

### 2. **Sistema de Permissões por Curso** ✅

**Tabela: `permissoes_cursos`**
- ✅ Associa usuários `professor_cursos` a cursos específicos
- ✅ Root pode gerenciar permissões
- ✅ API completa para CRUD de permissões

**Funcionalidades:**
- ✅ Criar permissão: associar usuário a curso
- ✅ Listar cursos permitidos para um usuário
- ✅ Listar usuários com acesso a um curso
- ✅ Remover permissão

---

### 3. **Validação de Acesso** ✅

**No Login:**
- ✅ `root` → Acesso a tudo
- ✅ `professor` → Acesso a todos os cursos
- ✅ `professor_cursos` → Acesso apenas aos cursos permitidos
- ❌ Outros perfis → Bloqueados

**Na API de Cursos:**
- ✅ `root` e `professor` → Veem todos os cursos
- ✅ `professor_cursos` → Veem apenas cursos permitidos
- ✅ Validação ao acessar curso específico

---

### 4. **Interface de Gestão (Root)** ✅

**No RootManagement:**
- ✅ Criar usuário com perfil `professor_cursos`
- ✅ Filtrar por perfil `professor_cursos`
- ✅ Badge visual diferenciado (indigo)

**Próximo Passo (Opcional):**
- Interface para gerenciar permissões de curso (associar/desassociar cursos)

---

## 🗄️ Estrutura do Banco de Dados

### Banco: `u985723830_novaedu`

### Tabelas Criadas:

1. **`cursos`** - Cursos disponíveis
2. **`aulas`** - Aulas dos cursos (com campo `modulo`)
3. **`permissoes_cursos`** - Permissões usuário-curso
4. **`inscricoes`** - Inscrições de usuários em cursos
5. **`progresso_aulas`** - Progresso de visualização

### Alteração na Tabela `usuarios`:

```sql
ALTER TABLE usuarios 
MODIFY COLUMN nivel_acesso ENUM('root', 'admin', 'professor', 'aluno', 'professor_cursos') 
NOT NULL DEFAULT 'professor';
```

---

## 📁 Arquivos Criados/Modificados

### Criados:
- ✅ `cursos/.sql/create-tables-and-permissions.sql` - Script completo
- ✅ `cursos/.sql/add-professor-cursos-role.sql` - Adicionar perfil
- ✅ `cursos/api/permissions/index.php` - API de permissões

### Modificados:
- ✅ `cursos/config-database-ead.php.example` - Configuração do banco
- ✅ `api/users/index.php` - Aceitar `professor_cursos`
- ✅ `cursos/src/contexts/EADAuthContext.tsx` - Validação de acesso
- ✅ `cursos/api/courses/index.php` - Filtro por permissão
- ✅ `src/types/bncc.ts` - Tipo `professor_cursos`
- ✅ `src/pages/RootManagement.tsx` - Criar usuário `professor_cursos`

---

## 🚀 Como Usar

### 1. **Executar Scripts SQL**

```sql
-- 1. Adicionar perfil professor_cursos
USE u985723830_novaedu;
SOURCE cursos/.sql/add-professor-cursos-role.sql;

-- 2. Criar tabelas do módulo cursos
SOURCE cursos/.sql/create-tables-and-permissions.sql;
```

### 2. **Criar Usuário Professor Cursos**

1. Login como **Root** no domínio principal
2. Ir para **Gerenciamento de Usuários**
3. Clicar em **Novo Usuário**
4. Preencher:
   - Nome
   - Usuário (login)
   - Senha
   - **Nível: Professor Cursos**
5. Salvar

### 3. **Associar Curso ao Usuário**

**Via API (exemplo):**

```bash
# Criar permissão
curl -X POST https://cursos.novaedubncc.com.br/api/permissions/index.php \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "professor_cursos-usuario-123",
    "course_id": "descomplicando-bncc-computacional"
  }'
```

**Ou criar interface no RootManagement (futuro):**
- Botão "Gerenciar Cursos" ao lado de usuários `professor_cursos`
- Modal para selecionar cursos permitidos

### 4. **Login e Acesso**

1. Usuário `professor_cursos` faz login em `cursos.novaedubncc.com.br`
2. Vê apenas os cursos permitidos
3. Não consegue acessar o domínio principal

---

## 📝 Exemplo de Uso

### Cenário: Curso "Descomplicando a BNCC Computacional"

1. **Root cria curso:**
   ```sql
   INSERT INTO cursos (id, titulo, status) 
   VALUES ('descomplicando-bncc-computacional', 'Descomplicando a BNCC Computacional', 'publicado');
   ```

2. **Root cria usuário:**
   - Nome: "João Silva"
   - Usuário: "joao.silva"
   - Perfil: `professor_cursos`

3. **Root associa curso ao usuário:**
   ```sql
   INSERT INTO permissoes_cursos (usuario_id, curso_id) 
   VALUES ('professor_cursos-joao.silva-abc123', 'descomplicando-bncc-computacional');
   ```

4. **Usuário acessa:**
   - Login em `cursos.novaedubncc.com.br`
   - Vê apenas o curso "Descomplicando a BNCC Computacional"
   - Pode assistir vídeos do curso

---

## ✅ Checklist de Funcionalidades

### Perfil professor_cursos:
- [x] Criado no banco de dados
- [x] Aceito na API de criação de usuários
- [x] Validação no login (acesso apenas ao subdomínio cursos)
- [x] Filtro de cursos por permissão
- [x] Interface de criação no RootManagement

### Sistema de Permissões:
- [x] Tabela `permissoes_cursos` criada
- [x] API de permissões (GET, POST, DELETE)
- [x] Validação de acesso por curso
- [x] Filtro de cursos na listagem

### Banco de Dados:
- [x] Configuração atualizada para `u985723830_novaedu`
- [x] Scripts SQL criados
- [x] Tabelas do módulo cursos criadas

---

## 🎯 Próximos Passos (Opcional)

1. **Interface de Gestão de Permissões:**
   - Adicionar botão "Gerenciar Cursos" em RootManagement
   - Modal para selecionar cursos permitidos
   - Visualizar cursos permitidos por usuário

2. **Criação de Cursos:**
   - Interface para criar cursos
   - Upload de vídeos
   - Organização em Módulo I e II

3. **Dashboard para professor_cursos:**
   - Mostrar apenas cursos permitidos
   - Estatísticas de progresso

---

**Data**: 2024
**Versão**: 1.0
