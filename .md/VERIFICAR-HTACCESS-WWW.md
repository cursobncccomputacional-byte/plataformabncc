# 🔍 Verificar .htaccess do Site Supernerds (/www/)

## 📁 Estrutura Confirmada

```
/home/supernerd/
  ├── www/              (Site Principal - supernerds.com.br)
  │   ├── index.html
  │   ├── assets/
  │   ├── favicon.ico
  │   └── .htaccess     ← PODE ESTAR INTERFERINDO!
  └── novaedu/          (Site Extra - novaedubncc.com.br)
      ├── .htaccess
      ├── index.html
      └── api/
          └── .htaccess
```

## 🔍 Verificação Necessária

### Passo 1: Verificar .htaccess em /www/

**Via FileZilla:**
1. Navegue até `/home/supernerd/www/`
2. Verifique se há arquivo `.htaccess`
3. **Se encontrar:**
   - Baixe o arquivo
   - Verifique o conteúdo
   - **Procure por:**
     - `RewriteBase /` (pode afetar tudo)
     - Regras de rewrite sem restrição de diretório
     - Regras que não são específicas para `/www/`

### Passo 2: Verificar .htaccess na Raiz

**Via FileZilla:**
1. Navegue até `/home/supernerd/` (raiz)
2. Verifique se há arquivo `.htaccess`
3. **Se encontrar:**
   - Baixe o arquivo
   - Verifique o conteúdo

## ⚠️ Problema Comum

Se o `.htaccess` em `/www/` tiver:
```apache
RewriteBase /
```

Isso pode fazer o Apache aplicar regras para **todos** os diretórios, incluindo `/novaedu/`.

## ✅ Soluções

### Solução 1: Corrigir .htaccess do Site Supernerds

**Se o `.htaccess` de `/www/` tiver `RewriteBase /`:**

Mude para:
```apache
RewriteBase /www/
```

Ou adicione exceção no início:
```apache
# Não aplicar regras para /novaedu/
RewriteCond %{REQUEST_URI} ^/novaedu/ [NC]
RewriteRule ^ - [L]
```

### Solução 2: Garantir Isolamento do .htaccess de NovaEdu

O `.htaccess` em `/novaedu/.htaccess` já está configurado com:
- `RewriteBase /novaedu/` (específico)
- Regras específicas para `/api/`
- `RewriteEngine Off` no `.htaccess` da API

### Solução 3: Fazer Upload do .htaccess Atualizado

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
