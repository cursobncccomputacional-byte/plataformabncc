# 🔧 Solução: .htaccess do Site Supernerds Interferindo

## 📁 Estrutura Confirmada

```
/home/supernerd/
  ├── www/              (Site Principal - supernerds.com.br)
  │   ├── index.html
  │   ├── assets/
  │   └── .htaccess     ← PODE ESTAR INTERFERINDO!
  └── novaedu/          (Site Extra - novaedubncc.com.br)
      ├── .htaccess
      ├── index.html
      └── api/
          └── .htaccess
```

## 🔍 Problema Possível

O `.htaccess` em `/home/supernerd/www/` pode ter regras de rewrite que estão afetando **todos** os diretórios, incluindo `/novaedu/`.

## ✅ Soluções

### Solução 1: Verificar .htaccess do Site Supernerds

**Via FileZilla:**
1. Navegue até `/home/supernerd/www/`
2. Verifique se há arquivo `.htaccess`
3. **Se encontrar:**
   - Baixe o arquivo
   - Verifique se tem `RewriteBase /` (pode afetar tudo)
   - Verifique se tem regras que não são específicas para `/www/`

**Se o `.htaccess` de `/www/` tiver `RewriteBase /`:**
- Isso pode fazer o Apache aplicar regras para **todos** os diretórios
- **Solução**: Mudar para `RewriteBase /www/` ou adicionar exceção para `/novaedu/`

### Solução 2: Garantir que .htaccess de NovaEdu Tem Prioridade

O `.htaccess` em `/novaedu/.htaccess` deve ter regras **mais específicas** que sobrescrevam qualquer regra de nível superior.

**Já atualizado com:**
- `RewriteBase /novaedu/` (específico para este site)
- Regras específicas para `/api/`
- `RewriteEngine Off` no `.htaccess` da API

### Solução 3: Adicionar Exceção no .htaccess do Site Supernerds

**Se houver `.htaccess` em `/www/`**, adicione no início:

```apache
# Não aplicar regras para /novaedu/
RewriteCond %{REQUEST_URI} ^/novaedu/ [NC]
RewriteRule ^ - [L]
```

## 🔍 Verificações Necessárias

### Passo 1: Verificar .htaccess do Site Supernerds

**Via FileZilla:**
1. Navegue até `/home/supernerd/www/`
2. Verifique se há `.htaccess`
3. **Se houver**, baixe e verifique:
   - Tem `RewriteBase /`?
   - Tem regras de rewrite?
   - As regras são específicas para `/www/` ou afetam tudo?

### Passo 2: Verificar .htaccess na Raiz

**Via FileZilla:**
1. Navegue até `/home/supernerd/` (raiz)
2. Verifique se há `.htaccess`
3. **Se houver**, baixe e verifique o conteúdo

### Passo 3: Fazer Upload do .htaccess Atualizado do NovaEdu

1. **Arquivo**: `dist/.htaccess` (já atualizado)
2. **Upload para**: `/novaedu/.htaccess`
3. **Substituir** o existente
4. **Permissão**: 644

## 📋 Checklist

- [ ] Verificar se há `.htaccess` em `/home/supernerd/www/`
- [ ] Se houver, verificar conteúdo (tem `RewriteBase /`?)
- [ ] Verificar se há `.htaccess` em `/home/supernerd/` (raiz)
- [ ] Fazer upload do `.htaccess` atualizado para `/novaedu/.htaccess`
- [ ] Fazer upload do `.htaccess` atualizado para `/novaedu/api/.htaccess`
- [ ] Testar: `https://www.novaedubncc.com.br/novaedu/api/test-php.php`

## 💡 Informações Necessárias

**Me informe:**
1. Há `.htaccess` em `/home/supernerd/www/`? Se sim, qual o conteúdo?
2. Há `.htaccess` em `/home/supernerd/` (raiz)? Se sim, qual o conteúdo?

Com essas informações, consigo identificar exatamente qual `.htaccess` está interferindo e como corrigir!

---

**💡 Dica**: Com múltiplos sites, é muito comum que `.htaccess` de um site interfira no outro. A solução é garantir que cada site tenha seu próprio `.htaccess` isolado ou adicionar exceções.
