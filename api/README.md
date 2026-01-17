# 🔌 API Backend - Plataforma BNCC

## 📁 Estrutura

```
api/
├── config/
│   ├── database.php      # Conexão com banco
│   ├── cors.php          # Configuração CORS
│   └── auth.php          # Funções de autenticação
├── auth/
│   ├── login.php         # POST /api/auth/login
│   ├── logout.php        # POST /api/auth/logout
│   └── me.php            # GET /api/auth/me
├── users/
│   └── index.php         # GET /api/users
└── .htaccess             # Configuração Apache
```

## 🚀 Endpoints Disponíveis

### Autenticação

#### POST `/api/auth/login`
Login do usuário

**URL**: `https://www.novaedubncc.com.br/api/auth/login`

**Body:**
```json
{
  "email": "marcus.lopes",
  "password": "?&,6bsMrD08a"
}
```

**Response:**
```json
{
  "error": false,
  "user": {
    "id": "root-marcus-001",
    "name": "Marcus Lopes",
    "email": "marcus.lopes",
    "role": "root",
    ...
  },
  "session_id": "..."
}
```

#### POST `/api/auth/logout`
Logout do usuário

#### GET `/api/auth/me`
Obter usuário atual autenticado

### Usuários

#### GET `/api/users`
Listar todos os usuários (requer admin ou root)

## 🔐 Autenticação

A API usa **sessões PHP** para autenticação. Após o login, o `session_id` é retornado e deve ser enviado nas próximas requisições (via cookie ou header).

## 📋 Mapeamento Português ↔ Inglês

A API faz conversão automática:
- **Recebe**: Dados em inglês do TypeScript
- **Converte**: Para português do banco
- **Retorna**: Dados em inglês para o TypeScript

## ⚙️ Configuração

1. **Ajustar `api/config/database.php`** se necessário (host, etc)
2. **Upload da pasta `api/`** para `/api/` na raiz do servidor (não em `/novaedu/api/`)
3. **Configurar permissões** (chmod 755 para pastas, 644 para arquivos)
4. **Upload do `.htaccess`** para `/api/.htaccess`

## 📍 Localização no Servidor

A API está em `/api/` (raiz), **fora** da pasta do frontend:

```
/home/supernerd/
├── novaedu/     (Frontend React)
└── api/         (API PHP - FORA do frontend)
```

**URL Base**: `https://www.novaedubncc.com.br/api/`

## 🔒 Segurança

- ✅ Senhas hasheadas (bcrypt)
- ✅ Validação de permissões
- ✅ Prepared statements (SQL injection protection)
- ✅ CORS configurado

## 📝 Próximos Endpoints
