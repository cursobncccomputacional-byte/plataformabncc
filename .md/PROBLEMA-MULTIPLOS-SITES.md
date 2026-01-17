# 🔍 Problema: Múltiplos Sites na Mesma Conta

## 📁 Estrutura do Servidor

Você tem **dois sites** na mesma conta:

```
/home/supernerd/
  ├── www/              (Site Principal - supernerds.com.br)
  │   └── .htaccess     ← Pode estar interferindo!
  └── novaedu/          (Site Extra - novaedubncc.com.br)
      ├── .htaccess
      ├── index.html
      └── api/          ← API aqui
```

## 🔍 Possíveis Problemas

### 1. .htaccess em Nível Superior

Pode haver um `.htaccess` em `/home/supernerd/` (raiz) que está interferindo.

**Verificar:**
- Via FileZilla, navegue até `/home/supernerd/`
- Procure por arquivo `.htaccess`
- Se encontrar, verifique o conteúdo

### 2. .htaccess do Site Principal

O `.htaccess` em `/home/supernerd/www/` pode estar interferindo.

**Verificar:**
- Via FileZilla, navegue até `/home/supernerd/www/`
- Verifique se há `.htaccess`
- Se houver, verifique se tem regras que afetam outros diretórios

### 3. Configuração de Virtual Host

O Apache pode ter configurações de Virtual Host que estão interferindo.

## ✅ Soluções

### Solução 1: Verificar .htaccess na Raiz

**Via FileZilla:**
1. Navegue até `/home/supernerd/` (pasta pai)
2. Procure por arquivo `.htaccess`
3. Se encontrar, **baixe** e verifique o conteúdo
4. Se tiver regras de rewrite, pode estar interferindo

### Solução 2: Verificar .htaccess do Site Principal

**Via FileZilla:**
1. Navegue até `/home/supernerd/www/`
2. Verifique se há `.htaccess`
3. Se houver, verifique se tem regras que afetam `/novaedu/`

### Solução 3: Garantir que .htaccess de novaedu Está Correto

O `.htaccess` em `/home/supernerd/novaedu/.htaccess` deve ter:

```apache
# CRÍTICO: NÃO redirecionar pasta api/
RewriteCond %{REQUEST_URI} ^.*/api/.*$ [NC]
RewriteRule ^ - [L]
```

**Verificar:**
- O arquivo existe?
- Tem a regra acima?
- Está ANTES da regra de SPA?

### Solução 4: Verificar .htaccess da API

O arquivo `/home/supernerd/novaedu/api/.htaccess` deve existir e ter:

```apache
# Forçar execução de PHP
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# Desabilitar rewrite da pasta pai
RewriteEngine Off
```

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar Estrutura Completa

**Via FileZilla, verifique:**

1. **Raiz** (`/home/supernerd/`):
   - [ ] Há arquivo `.htaccess`?
   - [ ] Se sim, qual o conteúdo?

2. **Site Principal** (`/home/supernerd/www/`):
   - [ ] Há arquivo `.htaccess`?
   - [ ] Se sim, qual o conteúdo?

3. **Site NovaEdu** (`/home/supernerd/novaedu/`):
   - [ ] Há arquivo `.htaccess`?
   - [ ] Tem a regra para não redirecionar `/api/`?

4. **API** (`/home/supernerd/novaedu/api/`):
   - [ ] Há arquivo `.htaccess`?
   - [ ] Tem `RewriteEngine Off`?

### Passo 2: Testar Diretamente

Acesse diretamente no navegador:
```
https://www.novaedubncc.com.br/novaedu/api/test-php.php
```

**Se ainda der 404:**
- Verificar se arquivo está realmente em `/novaedu/api/`
- Verificar permissões (644)

**Se der HTML:**
- `.htaccess` ainda está redirecionando
- Verificar se regra está correta

## 📋 Checklist Completo

- [ ] Verificar `.htaccess` em `/home/supernerd/` (raiz)
- [ ] Verificar `.htaccess` em `/home/supernerd/www/` (site principal)
- [ ] Verificar `.htaccess` em `/home/supernerd/novaedu/` (site novaedu)
- [ ] Verificar `.htaccess` em `/home/supernerd/novaedu/api/` (API)
- [ ] Verificar se arquivo `test-php.php` está em `/novaedu/api/`
- [ ] Verificar permissões (755/644)
- [ ] Testar: `https://www.novaedubncc.com.br/novaedu/api/test-php.php`

## 💡 Informações Necessárias

**Me informe:**
1. Há `.htaccess` em `/home/supernerd/` (raiz)? Se sim, qual o conteúdo?
2. Há `.htaccess` em `/home/supernerd/www/`? Se sim, qual o conteúdo?
3. O conteúdo do `.htaccess` em `/home/supernerd/novaedu/`?

Com essas informações, consigo identificar exatamente qual `.htaccess` está interferindo!

---

**💡 Dica**: Com múltiplos sites, é comum que `.htaccess` em nível superior interfira. A solução é garantir que o `.htaccess` de `/novaedu/` tenha prioridade ou que não haja interferência de outros `.htaccess`.
