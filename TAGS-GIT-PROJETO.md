# 🏷️ Tags do Projeto - Plataforma BNCC

## 📋 Tags Criadas

### v1.0.0-deploy-hostnet
**Data:** Hoje  
**Descrição:** Deploy na Hostnet e configuração do repositório GitHub - Site funcionando em produção

**O que inclui:**
- ✅ Deploy completo na Hostnet
- ✅ Configuração do servidor NGINX
- ✅ Site funcionando em produção
- ✅ Repositório GitHub configurado
- ✅ Documentação completa de deploy

## 🏷️ Como Usar Tags

### Ver Todas as Tags
```bash
git tag -l
```

### Ver Detalhes de uma Tag
```bash
git show v1.0.0-deploy-hostnet
```

### Criar Nova Tag
```bash
# Tag anotada (recomendada)
git tag -a v1.1.0 -m "Descrição da versão"

# Tag simples
git tag v1.1.0
```

### Fazer Push de Tags
```bash
# Push de uma tag específica
git push origin v1.1.0

# Push de todas as tags
git push origin --tags
```

### Deletar Tag
```bash
# Local
git tag -d v1.1.0

# Remoto
git push origin --delete v1.1.0
```

## 📌 Convenção de Versionamento

### Formato: vMAJOR.MINOR.PATCH-descrição

- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs
- **descrição**: Descrição opcional (ex: -deploy-hostnet)

### Exemplos:
- `v1.0.0-deploy-hostnet` - Primeira versão em produção
- `v1.1.0` - Nova funcionalidade
- `v1.1.1` - Correção de bug
- `v2.0.0` - Versão major com breaking changes

## 🎯 Próximas Tags Sugeridas

- `v1.1.0` - Novas funcionalidades
- `v1.2.0` - Melhorias de UI/UX
- `v2.0.0` - Refatoração major
- `v1.0.1` - Hotfix de produção

## 📦 Criar Release no GitHub

Após criar a tag, você pode criar um Release no GitHub:

1. Acesse: https://github.com/cursobncccomputacional-byte/plataformabncc/releases
2. Clique em "Draft a new release"
3. Selecione a tag: `v1.0.0-deploy-hostnet`
4. Adicione título e descrição
5. Publique o release

---

**💡 Dica:** Use tags para marcar versões importantes do projeto!
