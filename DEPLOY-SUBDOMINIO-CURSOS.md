# 🚀 Deploy no Subdomínio: cursos.novaedubncc.com.br

## 📁 Estrutura no Servidor

```
/home/u985723830/domains/novaedubncc.com.br/public_html/
├── api/                    ← API (compartilhada - na raiz)
│   ├── config/
│   ├── auth/
│   └── ...
├── cursos/                 ← Subdomínio cursos.novaedubncc.com.br
│   ├── index.html         ← Frontend React (aqui)
│   ├── assets/
│   └── ...
└── (outros arquivos do domínio principal)
```

---

## ✅ Opções de Configuração

### **Opção 1: API Compartilhada na Raiz** (Recomendado)

A API fica em `public_html/api/` e é acessível de qualquer subdomínio.

**Vantagens:**
- ✅ Uma única API para todos os subdomínios
- ✅ Mais fácil de manter
- ✅ Menos duplicação

**Como funciona:**
- Frontend em: `public_html/cursos/`
- API em: `public_html/api/`
- URL relativa `/api` funciona se o DocumentRoot for `public_html`

**Teste:**
```
https://cursos.novaedubncc.com.br/api/auth.php?action=login
```
- Se funcionar → Opção 1 está OK ✅
- Se der 404 → Precisa da Opção 2

---

### **Opção 2: API Dentro do Subdomínio** (Alternativa)

Se a Opção 1 não funcionar, copie a API para dentro de `cursos/`.

**Estrutura:**
```
public_html/
├── cursos/
│   ├── index.html
│   ├── assets/
│   └── api/              ← API dentro do subdomínio
│       ├── config/
│       └── ...
```

**Vantagens:**
- ✅ Funciona garantidamente
- ✅ Isolado do domínio principal

**Desvantagens:**
- ❌ Duplicação da API
- ❌ Mais difícil de manter (atualizações em dois lugares)

---

## 🔧 Passo a Passo - Opção 1 (Recomendado)

### 1. Verificar se API Está na Raiz

**Via FTP/File Manager:**
- Navegue até: `/home/u985723830/domains/novaedubncc.com.br/public_html/`
- Verifique se existe a pasta `api/`
- Se não existir, faça upload da pasta `api/` completa

### 2. Fazer Build do Frontend

```bash
npm run build
```

Isso gera a pasta `dist/` com os arquivos compilados.

### 3. Upload do Frontend

**Via FTP/File Manager:**
- Navegue até: `/home/u985723830/domains/novaedubncc.com.br/public_html/cursos/`
- Faça upload de **TODOS os arquivos** de `dist/`:
  - `index.html`
  - `assets/` (pasta completa)
  - `.htaccess` (se houver)
  - Outros arquivos

**Estrutura final:**
```
public_html/cursos/
├── index.html
├── assets/
│   ├── index-*.js
│   ├── index-*.css
│   └── ...
└── .htaccess (opcional)
```

### 4. Verificar .htaccess

**Criar/Verificar** `.htaccess` em `public_html/cursos/`:

```apache
# React Router - SPA
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /cursos/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /cursos/index.html [L]
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 5. Testar

1. **Acessar frontend:**
   ```
   https://cursos.novaedubncc.com.br
   ```

2. **Testar API diretamente:**
   ```
   https://cursos.novaedubncc.com.br/api/auth.php?action=login
   ```
   - Deve retornar erro 405 (método não permitido) se acessar via GET
   - Isso significa que a API está acessível ✅

3. **Testar login:**
   - Fazer login normalmente
   - Deve funcionar ✅

---

## 🔧 Passo a Passo - Opção 2 (Se Opção 1 Não Funcionar)

### 1. Copiar API para Dentro do Subdomínio

**Via FTP/File Manager:**
- Copie toda a pasta `api/` de `public_html/api/` para `public_html/cursos/api/`

**Estrutura:**
```
public_html/cursos/
├── index.html
├── assets/
└── api/              ← API copiada aqui
    ├── config/
    ├── auth/
    └── ...
```

### 2. Fazer Build e Upload

- Mesmo processo da Opção 1
- Upload de `dist/` para `public_html/cursos/`

### 3. Testar

- Mesmo processo da Opção 1
- Agora a API está dentro do subdomínio

---

## ⚠️ Importante: URL Relativa

O código já usa URL relativa `/api`, então:

- ✅ **Opção 1**: Se API está em `public_html/api/` e DocumentRoot é `public_html`, funciona automaticamente
- ✅ **Opção 2**: Se API está em `public_html/cursos/api/`, funciona automaticamente

**Não precisa alterar código!** A URL relativa se adapta.

---

## 🔍 Verificações

### Checklist:

- [ ] Subdomínio `cursos` criado e apontando para `/cursos/`
- [ ] SSL/HTTPS configurado para `cursos.novaedubncc.com.br`
- [ ] API acessível (testar diretamente no navegador)
- [ ] Frontend compilado (`npm run build`)
- [ ] Arquivos de `dist/` enviados para `cursos/`
- [ ] `.htaccess` configurado em `cursos/`
- [ ] Login funcionando

---

## 🐛 Troubleshooting

### Erro: API não encontrada (404)

**Solução:**
- Verificar se API está acessível: `https://cursos.novaedubncc.com.br/api/auth.php?action=login`
- Se der 404, usar Opção 2 (copiar API para dentro de `cursos/`)

### Erro: CORS

**Solução:**
- Verificar se `cursos.novaedubncc.com.br` está em `api/config/cors.php`
- Já está configurado ✅

### Erro: Página em branco

**Solução:**
- Verificar se `index.html` está em `cursos/`
- Verificar se `.htaccess` está configurado corretamente
- Verificar permissões (755 para pastas, 644 para arquivos)

---

## 📝 Notas

- O código já está preparado para o novo subdomínio (CORS atualizado)
- URL relativa `/api` funciona automaticamente
- Não precisa recompilar código ao mudar de domínio
- API pode ser compartilhada ou isolada (escolha a opção que funcionar)

---

**Data**: 2024
**Versão**: 1.0
