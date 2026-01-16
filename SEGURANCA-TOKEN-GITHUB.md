# 🔐 Segurança: Personal Access Token

## ⚠️ IMPORTANTE: Token é Confidencial!

**Personal Access Tokens são como senhas:**
- ❌ **NÃO compartilhe** em chats públicos
- ❌ **NÃO commite** no código
- ❌ **NÃO envie** por e-mail não seguro
- ✅ Use apenas para autenticação local

## 🚨 Se o Token Foi Exposto

Se você compartilhou o token acidentalmente:

1. **Revogue o token imediatamente:**
   - GitHub > Settings > Developer settings > Personal access tokens
   - Encontre o token
   - Clique em "Revoke"

2. **Crie um novo token:**
   - Generate new token
   - Use o novo token

## ✅ Usar o Token Agora

O token que você criou está pronto para usar. Vamos fazer o push:

```bash
git push -u origin master
```

Quando pedir credenciais:
- **Username**: `cursobncccomputacional-byte`
- **Password**: Cole o token (crie um novo no GitHub Settings > Developer settings > Personal access tokens)

## 🔒 Boas Práticas

1. **Não compartilhe tokens** em conversas
2. **Revogue tokens** que não usa mais
3. **Use tokens com expiração** quando possível
4. **Armazene tokens** em gerenciadores de senha seguros
5. **Use SSH keys** para projetos de longo prazo (mais seguro)

## 💡 Dica

Para projetos futuros, considere usar **SSH keys** em vez de tokens - é mais seguro e não expira.

---

**⚠️ Lembre-se:** Tokens são confidenciais. Mantenha-os seguros!
