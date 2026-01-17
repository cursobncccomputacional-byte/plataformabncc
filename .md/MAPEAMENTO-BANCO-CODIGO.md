# 🔄 Mapeamento: Banco de Dados (Português) ↔ Código (TypeScript)

## 📋 Situação Atual

- **Banco de Dados**: Nomes em **PORTUGUÊS** ✅
- **Código TypeScript**: Nomes em **INGLÊS** (interfaces)
- **Status**: Funcionando com localStorage (não precisa ajuste agora)

## 🎯 Quando Criar a API Backend

Quando criarmos a API PHP, precisaremos fazer o mapeamento entre:
- **Código TypeScript** (inglês) → **API PHP** → **Banco de Dados** (português)

## 📊 Mapeamento Completo

### Tabelas

| TypeScript/Interface | Banco de Dados (Português) |
|---------------------|---------------------------|
| `users` | `usuarios` |
| `school_years` | `anos_escolares` |
| `bncc_axes` | `eixos_bncc` |
| `knowledge_objects` | `objetos_conhecimento` |
| `skills` | `habilidades` |
| `activities` | `atividades` |
| `video_courses` | `cursos_video` |
| `documents` | `documentos` |
| `user_progress` | `progresso_usuario` |
| `activity_logs` | `logs_atividade` |

### Campos - Tabela `usuarios`

| TypeScript Interface | Banco de Dados |
|---------------------|----------------|
| `id` | `id` |
| `name` | `nome` |
| `email` | `email` |
| `password` | `senha` |
| `role` | `nivel_acesso` |
| `school` | `escola` |
| `subjects` | `materias` |
| `bio` | `biografia` |
| `created_at` | `data_criacao` |
| `last_login` | `ultimo_login` |
| `is_active` | `ativo` |
| `updated_at` | `data_atualizacao` |

### Campos - Tabela `atividades`

| TypeScript Interface | Banco de Dados |
|---------------------|----------------|
| `id` | `id` |
| `title` | `titulo` |
| `description` | `descricao` |
| `type` | `tipo` |
| `schoolYears` | `anos_escolares` |
| `axisId` | `id_eixo` |
| `knowledgeObjectId` | `id_objeto_conhecimento` |
| `skillIds` | `ids_habilidades` |
| `duration` | `duracao` |
| `difficulty` | `dificuldade` |
| `materials` | `materiais` |
| `objectives` | `objetivos` |
| `thumbnail_url` | `url_miniatura` |
| `video_url` | `url_video` |
| `document_url` | `url_documento` |
| `created_at` | `data_criacao` |

### Campos - Tabela `cursos_video`

| TypeScript Interface | Banco de Dados |
|---------------------|----------------|
| `id` | `id` |
| `title` | `titulo` |
| `description` | `descricao` |
| `thumbnail_url` | `url_miniatura` |
| `video_url` | `url_video` |
| `duration` | `duracao` |
| `schoolYears` | `anos_escolares` |
| `activities` | `atividades` |
| `created_at` | `data_criacao` |

### Campos - Tabela `documentos`

| TypeScript Interface | Banco de Dados |
|---------------------|----------------|
| `id` | `id` |
| `title` | `titulo` |
| `description` | `descricao` |
| `file_url` | `url_arquivo` |
| `file_type` | `tipo_arquivo` |
| `schoolYears` | `anos_escolares` |
| `activities` | `atividades` |
| `created_at` | `data_criacao` |

## 🔧 Estratégia de Implementação

### Opção 1: Mapeamento na API (Recomendado)
- Manter interfaces TypeScript em inglês
- API PHP faz o mapeamento ao receber/enviar dados
- Mais fácil de manter

### Opção 2: Adaptador/Helper
- Criar funções helper que convertem nomes
- Usar em todas as chamadas de API

## 📝 Exemplo de Mapeamento na API

```php
// Receber dados do TypeScript (inglês)
$data = json_decode(file_get_contents('php://input'), true);

// Converter para nomes do banco (português)
$usuario = [
    'nome' => $data['name'],
    'email' => $data['email'],
    'senha' => password_hash($data['password'], PASSWORD_DEFAULT),
    'nivel_acesso' => $data['role'],
    'escola' => $data['school'] ?? null,
    'materias' => json_encode($data['subjects'] ?? []),
];

// Inserir no banco
$stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, nivel_acesso, escola, materias) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([...]);

// Retornar dados convertidos para inglês
$response = [
    'id' => $usuario['id'],
    'name' => $usuario['nome'],
    'email' => $usuario['email'],
    'role' => $usuario['nivel_acesso'],
    // ...
];
```

## ✅ Próximos Passos

1. **Agora**: Código TypeScript continua funcionando (localStorage)
2. **Depois**: Criar API PHP com mapeamento português ↔ inglês
3. **Integração**: API faz a conversão automaticamente

---

**💡 Conclusão**: Por enquanto, **não precisa alterar o código TypeScript**. Quando criarmos a API backend, faremos o mapeamento lá!
