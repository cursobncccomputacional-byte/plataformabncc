# 🔄 Migração: Usar o Mesmo Banco do Domínio Principal

## 📋 Situação Atual

- **Sistema Principal**: Banco `supernerds3` (tabela `usuarios`)
- **Módulo Cursos**: Banco `u985723830_ead` (tabelas `cursos`, `aulas`, `inscricoes`, `progresso_aulas`)

## ✅ Recomendação: Usar o Mesmo Banco

### Vantagens:
1. ✅ **Usuários compartilhados** - Já usamos a mesma tabela `usuarios` via API
2. ✅ **Simplicidade** - Uma única conexão, menos configurações
3. ✅ **Integridade** - Dados relacionados ficam juntos
4. ✅ **Performance** - Menos overhead de conexões
5. ✅ **Backup** - Um único backup cobre tudo
6. ✅ **Manutenção** - Mais fácil de gerenciar

---

## 🚀 Passos para Migração

### 1. **Criar Tabelas no Banco Principal**

Execute os scripts SQL no banco `supernerds3`:

```sql
-- Criar tabelas do módulo cursos no banco principal
USE supernerds3;

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS cursos (
  id VARCHAR(255) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  categoria VARCHAR(100) DEFAULT NULL,
  nome_instrutor VARCHAR(255) DEFAULT NULL,
  bio_instrutor TEXT,
  preco DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('rascunho', 'publicado', 'arquivado') DEFAULT 'rascunho',
  duracao_total INT DEFAULT 0,
  total_aulas INT DEFAULT 0,
  alunos_inscritos INT DEFAULT 0,
  avaliacao DECIMAL(3, 2) DEFAULT 0.00,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS aulas (
  id VARCHAR(255) PRIMARY KEY,
  curso_id VARCHAR(255) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  video_url VARCHAR(500) DEFAULT NULL,
  duracao_video INT DEFAULT 0,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  ordem INT DEFAULT 0,
  modulo ENUM('I', 'II') DEFAULT 'I',
  eh_preview BOOLEAN DEFAULT FALSE,
  recursos JSON,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso_id (curso_id),
  INDEX idx_modulo (curso_id, modulo, ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL,
  curso_id VARCHAR(255) NOT NULL,
  inscrito_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  concluido_em TIMESTAMP NULL DEFAULT NULL,
  progresso_percentual DECIMAL(5, 2) DEFAULT 0.00,
  ultimo_acesso_em TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY unique_inscricao (usuario_id, curso_id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_curso_id (curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Progresso das Aulas
CREATE TABLE IF NOT EXISTS progresso_aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL,
  curso_id VARCHAR(255) NOT NULL,
  aula_id VARCHAR(255) NOT NULL,
  segundos_assistidos INT DEFAULT 0,
  total_segundos INT DEFAULT 0,
  esta_concluida BOOLEAN DEFAULT FALSE,
  concluida_em TIMESTAMP NULL DEFAULT NULL,
  ultima_visualizacao_em TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY unique_progresso (usuario_id, curso_id, aula_id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
  INDEX idx_usuario_curso (usuario_id, curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. **Migrar Dados (se houver dados no banco EAD)**

Se você já tem dados no banco `u985723830_ead`, migre:

```sql
-- Conectar ao banco EAD antigo
USE u985723830_ead;

-- Exportar dados (exemplo)
SELECT * FROM cursos INTO OUTFILE '/tmp/cursos.csv';
SELECT * FROM aulas INTO OUTFILE '/tmp/aulas.csv';
SELECT * FROM inscricoes INTO OUTFILE '/tmp/inscricoes.csv';
SELECT * FROM progresso_aulas INTO OUTFILE '/tmp/progresso_aulas.csv';

-- Conectar ao banco principal
USE supernerds3;

-- Importar dados
LOAD DATA INFILE '/tmp/cursos.csv' INTO TABLE cursos;
LOAD DATA INFILE '/tmp/aulas.csv' INTO TABLE aulas;
LOAD DATA INFILE '/tmp/inscricoes.csv' INTO TABLE inscricoes;
LOAD DATA INFILE '/tmp/progresso_aulas.csv' INTO TABLE progresso_aulas;
```

**OU** use um script PHP de migração (mais seguro):

```php
<?php
// migrate-ead-data.php
$eadDb = new PDO('mysql:host=...;dbname=u985723830_ead', ...);
$mainDb = new PDO('mysql:host=...;dbname=supernerds3', ...);

// Migrar cursos
$cursos = $eadDb->query("SELECT * FROM cursos")->fetchAll();
foreach ($cursos as $curso) {
    $mainDb->prepare("INSERT INTO cursos (...) VALUES (...)")->execute(...);
}

// Repetir para outras tabelas...
```

### 3. **Atualizar Configuração do Módulo Cursos**

Edite `cursos/config-database-ead.php`:

```php
<?php
/**
 * Configuração do Banco de Dados - Usando o mesmo banco do sistema principal
 */

return [
    'host' => 'localhost', // ou IP do servidor (mesmo do sistema principal)
    'database' => 'supernerds3', // MESMO BANCO DO SISTEMA PRINCIPAL
    'username' => 'supernerds3', // Mesmo usuário do sistema principal
    'password' => '*.BDnovaedu2026!', // Mesma senha do sistema principal
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];
```

### 4. **Testar**

1. Verificar se as tabelas foram criadas:
   ```sql
   USE supernerds3;
   SHOW TABLES LIKE 'cursos%';
   SHOW TABLES LIKE 'aulas%';
   SHOW TABLES LIKE 'inscricoes%';
   SHOW TABLES LIKE 'progresso_aulas%';
   ```

2. Testar API do módulo cursos:
   ```bash
   curl https://cursos.novaedubncc.com.br/api/courses/index.php
   ```

3. Testar login e acesso aos cursos

---

## ⚠️ Alternativa: Manter Banco Separado

Se preferir manter o banco separado (não recomendado, mas possível):

### Vantagens:
- ✅ Isolamento de dados
- ✅ Backup independente
- ✅ Escalabilidade independente

### Desvantagens:
- ❌ Mais complexo de gerenciar
- ❌ Usuários precisam ser sincronizados (ou usar API)
- ❌ Mais conexões de banco
- ❌ Backup precisa incluir ambos

### Se optar por manter separado:
- Mantenha a configuração atual (`u985723830_ead`)
- Continue usando a API do sistema principal para gestão de usuários
- Configure backups separados

---

## 📝 Checklist

- [ ] Criar tabelas no banco principal
- [ ] Migrar dados (se houver)
- [ ] Atualizar `cursos/config-database-ead.php`
- [ ] Testar conexão
- [ ] Testar API de cursos
- [ ] Testar login e acesso
- [ ] Fazer backup antes de migrar
- [ ] (Opcional) Remover banco EAD antigo após validação

---

## 🎯 Recomendação Final

**USE O MESMO BANCO** - É mais simples, eficiente e alinhado com a arquitetura atual onde já compartilhamos usuários.
