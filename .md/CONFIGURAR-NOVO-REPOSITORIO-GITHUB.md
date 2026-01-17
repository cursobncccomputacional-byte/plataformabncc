# 🔧 Configurar Novo Repositório GitHub

## ✅ Informações do Novo Repositório

- **Username/Organização**: `cursobncccomputacional-byte`
- **Repositório**: `plataformabncc`
- **URL**: `https://github.com/cursobncccomputacional-byte/plataformabncc.git`

## 🚀 Opções de Configuração

### Opção 1: Substituir Remote Atual (Recomendado)

Substitui o remote antigo pelo novo:

```bash
# Remover remote antigo
git remote remove origin

# Adicionar novo remote
git remote add origin https://github.com/cursobncccomputacional-byte/plataformabncc.git

# Verificar
git remote -v

# Fazer push
git push -u origin master
```

### Opção 2: Manter Ambos (Backup)

Mantém o repositório antigo como backup:

```bash
# Renomear remote atual para backup
git remote rename origin backup

# Adicionar novo remote como origin
git remote add origin https://github.com/cursobncccomputacional-byte/plataformabncc.git

# Verificar
git remote -v

# Fazer push para o novo
git push -u origin master
```

## 📋 Passo a Passo Completo

### 1. Preparar Arquivos para Commit

Primeiro, adicione os arquivos novos:

```bash
# Adicionar todos os arquivos
git add .

# Ou adicionar arquivos específicos
git add CONFIGURAR-*.md SOLUCAO-*.md *.md
```

### 2. Fazer Commit

```bash
git commit -m "Adicionar documentação e configurações de deploy"
```

### 3. Configurar Novo Remote

```bash
# Remover remote antigo
git remote remove origin

# Adicionar novo remote
git remote add origin https://github.com/cursobncccomputacional-byte/plataformabncc.git
```

### 4. Verificar Configuração

```bash
git remote -v
```

Deve mostrar:
```
origin  https://github.com/cursobncccomputacional-byte/plataformabncc.git (fetch)
origin  https://github.com/cursobncccomputacional-byte/plataformabncc.git (push)
```

### 5. Fazer Push

```bash
# Push inicial
git push -u origin master

# Se der erro de branch, tente:
git push -u origin master:main
```

## ⚠️ Possíveis Problemas

### Erro: "Repository not found"

**Causa:** Repositório não existe ou não tem acesso

**Solução:**
1. Verifique se o repositório existe no GitHub
2. Verifique se está logado na conta correta
3. Verifique permissões do repositório

### Erro: "Authentication failed"

**Causa:** Credenciais incorretas

**Solução:**
1. Use Personal Access Token em vez de senha
2. Ou configure SSH keys

### Erro: "Branch name mismatch"

**Causa:** Branch local é `master` mas remoto é `main`

**Solução:**
```bash
# Renomear branch local
git branch -M main

# Ou fazer push para main
git push -u origin master:main
```

## 🔐 Autenticação

### Opção 1: Personal Access Token (Recomendado)

1. GitHub > Settings > Developer settings > Personal access tokens
2. Generate new token
3. Dê permissões: `repo`
4. Use o token como senha ao fazer push

### Opção 2: SSH Keys

1. Gerar chave SSH
2. Adicionar ao GitHub
3. Usar URL SSH: `git@github.com:cursobncccomputacional-byte/plataformabncc.git`

## 📦 Estrutura Final

Após configurar:

```
GitHub: cursobncccomputacional-byte/plataformabncc
    ↓
Local: c:\projetos\PlataformaBNCC
    ↓
Remote: origin → https://github.com/cursobncccomputacional-byte/plataformabncc.git
```

## ✅ Checklist

- [ ] Repositório criado no GitHub
- [ ] Remote configurado
- [ ] Arquivos commitados
- [ ] Push realizado com sucesso
- [ ] Verificado no GitHub

---

**💡 Dica:** Use a Opção 1 (substituir remote) se não precisar mais do repositório antigo!
