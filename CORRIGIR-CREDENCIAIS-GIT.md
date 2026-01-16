# 🔧 Corrigir Credenciais Git para Nova Conta

## ⚠️ Problema

O Git está usando credenciais da conta antiga (`mvpslopes`) em vez da nova (`cursobncccomputacional-byte`).

## 🚀 Soluções

### Solução 1: Limpar Cache de Credenciais (Windows)

**No PowerShell ou CMD:**

```powershell
# Limpar credenciais do Windows
cmdkey /list
cmdkey /delete:git:https://github.com
```

**Ou usar Git Credential Manager:**

```bash
git credential-manager-core erase
```

### Solução 2: Usar URL com Token na URL

**Modificar o remote para incluir o token:**

```bash
# Remover remote atual
git remote remove origin

# Adicionar com token na URL
git remote add origin https://cursobncccomputacional-byte:SEU_TOKEN_AQUI@github.com/cursobncccomputacional-byte/plataformabncc.git

# Fazer push
git push -u origin master
```

### Solução 3: Configurar Credenciais Específicas

**Configurar Git para este repositório:**

```bash
# Configurar usuário para este repo
git config user.name "cursobncccomputacional-byte"
git config user.email "seu-email-da-nova-conta@exemplo.com"

# Limpar credenciais
git credential reject https://github.com

# Tentar push novamente (vai pedir credenciais)
git push -u origin master
```

### Solução 4: Usar GitHub CLI (Mais Fácil)

Se tiver GitHub CLI instalado:

```bash
# Fazer logout
gh auth logout

# Fazer login com nova conta
gh auth login

# Selecionar GitHub.com
# Selecionar HTTPS
# Autenticar com token ou browser
```

## 📋 Passo a Passo Recomendado

### Opção Mais Rápida: URL com Token

1. **Remover remote atual:**
```bash
git remote remove origin
```

2. **Adicionar remote com token:**
```bash
git remote add origin https://cursobncccomputacional-byte:SEU_TOKEN_AQUI@github.com/cursobncccomputacional-byte/plataformabncc.git
```

3. **Fazer push:**
```bash
git push -u origin master
```

**⚠️ Atenção:** O token fica visível no histórico do Git. Após o push, considere remover e usar método mais seguro.

## 🔒 Método Mais Seguro (Após Push Inicial)

Depois que funcionar, remova o token da URL:

```bash
# Remover remote com token
git remote remove origin

# Adicionar sem token (vai pedir credenciais)
git remote add origin https://github.com/cursobncccomputacional-byte/plataformabncc.git

# Configurar credential helper
git config credential.helper manager-core

# Fazer push (vai pedir credenciais uma vez)
git push -u origin master
```

## ✅ Verificar

Após configurar:

```bash
git remote -v
```

Deve mostrar:
```
origin  https://github.com/cursobncccomputacional-byte/plataformabncc.git (fetch)
origin  https://github.com/cursobncccomputacional-byte/plataformabncc.git (push)
```

---

**💡 Dica:** Use a Solução 2 (URL com token) para resolver rapidamente, depois configure método mais seguro!
