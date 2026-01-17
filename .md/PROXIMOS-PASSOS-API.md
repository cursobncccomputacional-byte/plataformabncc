# 🚀 Próximos Passos: Criar API Backend

## ✅ O Que Já Temos

- ✅ Banco de dados criado com nomes em português
- ✅ Código TypeScript funcionando (localStorage)
- ✅ Estrutura de níveis de acesso implementada
- ✅ Frontend completo

## 🎯 Próximo Passo: API Backend PHP

Quando estivermos prontos para criar a API, precisaremos:

### 1. Estrutura da API

```
api/
├── config/
│   └── database.php          # Configuração do banco
├── auth/
│   ├── login.php             # POST /api/auth/login
│   └── logout.php            # POST /api/auth/logout
├── users/
│   ├── index.php             # GET /api/users
│   ├── create.php            # POST /api/users
│   ├── update.php            # PUT /api/users/:id
│   └── delete.php            # DELETE /api/users/:id
├── activities/
│   └── index.php             # GET /api/activities
├── videos/
│   └── index.php             # GET /api/videos
└── documents/
    └── index.php             # GET /api/documents
```

### 2. Mapeamento Português ↔ Inglês

A API fará a conversão:
- **Recebe**: Dados em inglês do TypeScript
- **Converte**: Para português do banco
- **Retorna**: Dados em inglês para o TypeScript

### 3. Exemplo de Endpoint

```php
// api/users/index.php
<?php
require_once '../config/database.php';

// Buscar usuários
$stmt = $pdo->query("SELECT * FROM usuarios WHERE ativo = 1");
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Converter para inglês
$response = array_map(function($u) {
    return [
        'id' => $u['id'],
        'name' => $u['nome'],
        'email' => $u['email'],
        'role' => $u['nivel_acesso'],
        'school' => $u['escola'],
        'subjects' => json_decode($u['materias'] ?? '[]'),
        'created_at' => $u['data_criacao'],
        'is_active' => $u['ativo'],
    ];
}, $usuarios);

header('Content-Type: application/json');
echo json_encode($response);
```

## 📋 Checklist para API

- [ ] Criar estrutura de pastas
- [ ] Configurar conexão com banco
- [ ] Criar endpoints de autenticação
- [ ] Criar endpoints de usuários
- [ ] Criar endpoints de conteúdo
- [ ] Implementar mapeamento português ↔ inglês
- [ ] Adicionar validação de permissões
- [ ] Testar integração frontend ↔ backend

## ⏳ Quando Criar?

Você pode:
1. **Continuar com localStorage** por enquanto
2. **Criar a API depois** quando precisar de dados reais
3. **Criar agora** se quiser começar a integração

---

**💡 Recomendação**: Por enquanto, o código TypeScript **não precisa de alterações**. Quando criarmos a API, faremos o mapeamento lá!
