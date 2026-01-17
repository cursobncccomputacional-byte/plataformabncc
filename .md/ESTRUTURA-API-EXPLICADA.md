# 📁 Estrutura da API - Explicação

## 🎯 Por que `index.php` em cada pasta?

A estrutura da API segue o padrão REST, onde cada pasta representa um **recurso** e o `index.php`` é o arquivo padrão que responde às requisições.

### Como Funciona

```
api/
├── auth/
│   ├── login.php      → POST /api/auth/login
│   ├── logout.php     → POST /api/auth/logout
│   └── me.php         → GET /api/auth/me
│
├── users/
│   └── index.php      → GET /api/users/ (lista todos os usuários)
│
└── config/
    └── (arquivos de configuração, não são endpoints)
```

## 📋 Endpoints e Arquivos

### Pasta `auth/`
- `login.php` → Endpoint específico: `/api/auth/login`
- `logout.php` → Endpoint específico: `/api/auth/logout`
- `me.php` → Endpoint específico: `/api/auth/me`

### Pasta `users/`
- `index.php` → Endpoint padrão: `/api/users/` (lista usuários)

**Por que `index.php`?**
- É o arquivo padrão que o servidor executa quando você acessa uma pasta
- `/api/users/` automaticamente chama `/api/users/index.php`
- É uma convenção comum em APIs REST

## 🔄 Alternativa (Se Preferir)

Se quiser ser mais explícito, podemos renomear:

```
users/
├── index.php    → GET /api/users/ (lista)
├── create.php   → POST /api/users/ (criar)
├── update.php   → PUT /api/users/:id (editar)
└── delete.php   → DELETE /api/users/:id (deletar)
```

Mas por enquanto, `index.php` está correto para listar usuários!

## ✅ Estrutura Atual (Correta)

```
api/
├── auth/
│   ├── login.php      ✅ Endpoint de login
│   ├── logout.php     ✅ Endpoint de logout
│   └── me.php         ✅ Endpoint de usuário atual
│
├── users/
│   └── index.php      ✅ Endpoint de listar usuários
│
└── config/
    ├── database.php   ✅ Configuração do banco
    ├── cors.php       ✅ Configuração CORS
    └── auth.php       ✅ Funções de autenticação
```

## 💡 Resumo

- **`index.php` em `users/`** = Endpoint para listar usuários
- **É normal e correto** ter `index.php` em pastas de recursos
- **Funciona assim**: `/api/users/` → executa `/api/users/index.php`

---

**✅ Tudo está correto!** O `index.php` dentro de `users/` é o endpoint que lista todos os usuários quando você acessa `/api/users/`.
