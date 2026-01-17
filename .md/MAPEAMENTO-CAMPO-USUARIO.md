# 🔄 Mapeamento: Campo `usuario` ↔ `email`

## 📋 Alteração Realizada

O campo no banco de dados foi alterado de `email` para `usuario`:

### Banco de Dados (Português)
- **Campo**: `usuario` (VARCHAR, UNIQUE, NOT NULL)
- **Uso**: Login do usuário (ex: "marcus.lopes")

### Frontend/API (Inglês)
- **Campo**: `email` (mantido para compatibilidade)
- **Uso**: Mesmo campo, mas mapeado do `usuario` do banco

## 🔄 Mapeamento

| Banco de Dados | API/Frontend |
|---------------|--------------|
| `usuario` | `email` |

## 📝 Como Funciona

### 1. Login
**Frontend envia:**
```json
{
  "email": "marcus.lopes",
  "password": "..."
}
```

**API busca no banco:**
```sql
SELECT * FROM usuarios WHERE usuario = 'marcus.lopes'
```

**API retorna:**
```json
{
  "user": {
    "email": "marcus.lopes"  // Mapeado do campo usuario
  }
}
```

### 2. Estrutura do Banco

**Tabela `usuarios`:**
- `id` → `id`
- `nome` → `name`
- `usuario` → `email` (mapeado)
- `senha` → `password` (não retornado)
- `nivel_acesso` → `role`
- etc...

## ✅ Vantagens

- ✅ Banco usa nome descritivo em português (`usuario`)
- ✅ Frontend mantém compatibilidade (`email`)
- ✅ API faz mapeamento automático
- ✅ Não precisa alterar código TypeScript

## 📋 Scripts Disponíveis

1. **`database-alter-email-to-usuario.sql`** - Para bancos já criados
2. **`database-structure-portugues.sql`** - Já atualizado com `usuario`
3. **`database-insert-root-user.sql`** - Já atualizado com `usuario`

---

**💡 Nota**: O frontend continua usando `email` nos formulários, mas a API mapeia automaticamente para o campo `usuario` do banco!
