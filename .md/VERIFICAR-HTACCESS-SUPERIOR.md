# 🔍 Verificar .htaccess em Nível Superior

## 🎯 Problema

Com múltiplos sites na mesma conta, pode haver `.htaccess` em nível superior que está interferindo.

## 📁 Estrutura do Servidor

```
/home/supernerd/
  ├── .htaccess         ← PODE ESTAR INTERFERINDO!
  ├── www/              (Site Principal - supernerds.com.br)
  │   └── .htaccess     ← PODE ESTAR INTERFERINDO!
  └── novaedu/          (Site Extra - novaedubncc.com.br)
      ├── .htaccess     ← Este precisa estar correto
      └── api/
          └── .htaccess ← Este precisa estar correto
```

## 🔍 Verificações Necessárias

### Passo 1: Verificar .htaccess na Raiz

**Via FileZilla:**
1. Navegue até `/home/supernerd/` (pasta pai)
2. Procure por arquivo `.htaccess`
3. **Se encontrar:**
   - Baixe o arquivo
   - Verifique se tem regras de rewrite
   - Se tiver, pode estar interferindo
   - **Solução**: Adicionar exceção para `/novaedu/` ou remover regras problemáticas

### Passo 2: Verificar .htaccess do Site Principal

**Via FileZilla:**
1. Navegue até `/home/supernerd/www/`
2. Verifique se há arquivo `.htaccess`
3. **Se encontrar:**
   - Baixe o arquivo
   - Verifique se tem regras que afetam outros diretórios
   - Regras com `RewriteBase /` podem afetar tudo

### Passo 3: Verificar .htaccess do NovaEdu

**Via FileZilla:**
1. Navegue até `/home/supernerd/novaedu/`
2. Verifique o arquivo `.htaccess`
3. **Deve ter:**
   ```apache
   RewriteCond %{REQUEST_URI} ^.*/api/.*$ [NC]
   RewriteRule ^ - [L]
   ```
   - Esta regra ANTES da regra de SPA

### Passo 4: Verificar .htaccess da API

**Via FileZilla:**
1. Navegue até `/home/supernerd/novaedu/api/`
2. Verifique o arquivo `.htaccess`
3. **Deve ter:**
   ```apache
   RewriteEngine Off
   ```

## ✅ Soluções

### Se Há .htaccess na Raiz Interferindo

**Opção 1: Adicionar Exceção**

No `.htaccess` da raiz (`/home/supernerd/.htaccess`), adicione:

```apache
# Não aplicar regras para /novaedu/
RewriteCond %{REQUEST_URI} ^/novaedu/ [NC]
RewriteRule ^ - [L]
```

**Opção 2: Remover Regras Problemáticas**

Se o `.htaccess` da raiz tiver regras de rewrite que afetam tudo, considere removê-las ou restringi-las apenas ao site principal.

### Se Há .htaccess no Site Principal Interferindo

**No `.htaccess` de `/home/supernerd/www/`:**

Se tiver `RewriteBase /`, mude para:

```apache
RewriteBase /www/
```

Ou adicione exceção:

```apache
# Não aplicar para /novaedu/
RewriteCond %{REQUEST_URI} ^/novaedu/ [NC]
RewriteRule ^ - [L]
```

## 📋 Checklist

- [ ] Verificar se há `.htaccess` em `/home/supernerd/` (raiz)
- [ ] Verificar se há `.htaccess` em `/home/supernerd/www/` (site principal)
- [ ] Verificar conteúdo do `.htaccess` em `/home/supernerd/novaedu/`
- [ ] Verificar conteúdo do `.htaccess` em `/home/supernerd/novaedu/api/`
- [ ] Se houver interferência, adicionar exceções ou corrigir regras

## 💡 Informações Necessárias

**Me informe:**
1. Há `.htaccess` em `/home/supernerd/` (raiz)? Se sim, qual o conteúdo?
2. Há `.htaccess` em `/home/supernerd/www/`? Se sim, qual o conteúdo?
3. O conteúdo do `.htaccess` em `/home/supernerd/novaedu/`?

Com essas informações, consigo identificar exatamente qual `.htaccess` está interferindo e como corrigir!

---

**💡 Dica**: Com múltiplos sites, é comum que `.htaccess` em nível superior interfira. A solução é garantir que cada site tenha seu próprio `.htaccess` isolado ou adicionar exceções.
