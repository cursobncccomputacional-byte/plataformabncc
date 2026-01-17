# 🗄️ Preparação para Criação do Banco de Dados

## ✅ Implementação Atual Concluída

A estrutura de níveis de acesso foi implementada e está funcionando com dados locais (localStorage).

## 📋 O Que Será Necessário Quando Tiver o Banco

### 1. Estrutura de Tabelas

#### Tabela: `users`
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hash da senha
  role ENUM('root', 'admin', 'professor', 'aluno') NOT NULL,
  school VARCHAR(255),
  subjects JSON, -- Array de matérias
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  bio TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabela: `activities`
```sql
CREATE TABLE activities (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('plugada', 'desplugada') NOT NULL,
  school_years JSON, -- Array de IDs dos anos
  axis_id VARCHAR(255),
  knowledge_object_id VARCHAR(255),
  skill_ids JSON, -- Array de IDs de habilidades
  duration INT, -- em minutos
  difficulty ENUM('facil', 'medio', 'dificil'),
  materials JSON, -- Array de materiais
  objectives JSON, -- Array de objetivos
  thumbnail_url VARCHAR(500),
  video_url VARCHAR(500),
  document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `video_courses`
```sql
CREATE TABLE video_courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  video_url VARCHAR(500) NOT NULL,
  duration INT NOT NULL, -- em segundos
  school_years JSON, -- Array de IDs dos anos
  activities JSON, -- Array de IDs de atividades relacionadas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `documents`
```sql
CREATE TABLE documents (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type ENUM('pdf', 'docx', 'pptx') NOT NULL,
  school_years JSON, -- Array de IDs dos anos
  activities JSON, -- Array de IDs de atividades relacionadas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `user_progress`
```sql
CREATE TABLE user_progress (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  video_id VARCHAR(255),
  activity_id VARCHAR(255),
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress_percentage INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabela: `activity_logs`
```sql
CREATE TABLE activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  activity ENUM('login', 'logout', 'view_activity', 'view_document', 'view_video', 'download', 'search', 'filter') NOT NULL,
  resource_type ENUM('activity', 'document', 'video', 'page'),
  resource_id VARCHAR(255),
  resource_title VARCHAR(255),
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. Índices Recomendados

```sql
-- Índices para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_video ON user_progress(video_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
```

### 3. Usuário Inicial Root

```sql
-- Criar usuário root inicial
-- IMPORTANTE: Trocar a senha por um hash seguro!
INSERT INTO users (id, name, email, password, role, school, is_active, created_at)
VALUES (
  'root001',
  'Root Administrator',
  'root@plataformabncc.com',
  '$2y$10$...', -- Hash da senha (use password_hash do PHP)
  'root',
  'Sistema Educacional BNCC',
  TRUE,
  NOW()
);
```

### 4. Migração de Dados Locais

Quando o banco estiver pronto, será necessário:

1. **Migrar usuários** do localStorage para o banco
2. **Migrar progresso** dos usuários
3. **Migrar logs** de atividades
4. **Configurar autenticação** no backend

### 5. Backend Necessário

Você precisará criar uma API backend (PHP) com endpoints:

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/users` - Listar usuários (com permissões)
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Editar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `GET /api/activities` - Listar atividades
- `GET /api/videos` - Listar vídeos
- `GET /api/documents` - Listar documentos
- `GET /api/progress/:userId` - Progresso do usuário
- `POST /api/progress` - Atualizar progresso

### 6. Configuração de Segurança

- ✅ Hash de senhas (password_hash do PHP)
- ✅ Validação de permissões no backend
- ✅ Proteção contra SQL Injection (prepared statements)
- ✅ Validação de inputs
- ✅ Rate limiting para login

## 📝 Checklist Quando Tiver o Banco

- [ ] Criar estrutura de tabelas
- [ ] Criar índices
- [ ] Criar usuário root inicial
- [ ] Configurar conexão com banco no backend
- [ ] Criar API endpoints
- [ ] Migrar dados do localStorage (se houver)
- [ ] Testar autenticação
- [ ] Testar permissões de cada nível
- [ ] Configurar variáveis de ambiente

## 🔐 Segurança Importante

- **NUNCA** armazene senhas em texto plano
- Use `password_hash()` e `password_verify()` do PHP
- Valide permissões no backend, não apenas no frontend
- Use prepared statements para todas as queries
- Implemente rate limiting para login

---

**💡 Dica:** Quando tiverem o PHPMyAdmin, podemos criar um script SQL completo para criar toda a estrutura de uma vez!
