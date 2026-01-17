# 🔄 Solução Alternativa: Mover API para Fora do Frontend

## 🎯 Por Que Mover a API?

Se o suporte da Hostnet demorar ou não conseguir resolver, podemos **mover a API para fora da pasta do frontend**. Isso resolve o problema porque:

- ✅ **Sem conflitos de `.htaccess`** - Cada pasta tem seu próprio `.htaccess`
- ✅ **API isolada** - Mais fácil de gerenciar e configurar
- ✅ **Funciona independente** da configuração do servidor para `/novaedu/`

## 📁 Nova Estrutura

### Estrutura Atual (Problema):
```
/home/supernerd/
  └── novaedu/
      ├── .htaccess (não funciona - redireciona tudo)
      ├── index.html
      ├── test.php (retorna HTML)
      └── api/
          ├── .htaccess
          └── test-php.php (retorna HTML)
```

### Nova Estrutura (Solução):
```
/home/supernerd/
  ├── novaedu/          (Frontend React - apenas HTML/JS/CSS)
  │   ├── .htaccess     (apenas para SPA React)
  │   ├── index.html
  │   └── assets/
  └── api/              (API PHP - FORA do frontend)
      ├── .htaccess     (configuração PHP)
      ├── test.php
      └── ...
```

## 🔧 Como Fazer a Mudança

### Passo 1: Criar Pasta API na Raiz

1. **Via FileZilla**, navegue até `/home/supernerd/` (pasta pai de `/novaedu/`)
2. **Crie** uma nova pasta chamada `api`
3. **Verifique** permissões: 755

### Passo 2: Mover Arquivos da API

1. **Via FileZilla**, navegue até `/novaedu/api/`
2. **Selecione todos os arquivos** da pasta `api/`
3. **Mova** para `/api/` (pasta nova na raiz)
4. **Não delete** a pasta `/novaedu/api/` ainda (deixe como backup)

### Passo 3: Criar .htaccess para a Nova API

Crie um arquivo `.htaccess` em `/api/`:

```apache
# Configuração para API PHP
# Forçar execução de PHP
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# Headers CORS
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-Session-ID"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# MIME Types
<IfModule mod_mime.c>
    AddType application/json .json
    AddType application/javascript .js
    AddType text/css .css
</IfModule>
```

### Passo 4: Atualizar URL da API no Frontend

1. **Edite** o arquivo `.env` local:
   ```
   VITE_API_URL=https://www.novaedubncc.com.br/api
   ```

2. **Ou** edite `src/services/apiService.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://www.novaedubncc.com.br/api';
   ```

3. **Faça build** novamente:
   ```bash
   npm run build
   ```

4. **Faça upload** do novo build para `/novaedu/`

### Passo 5: Testar

1. **Teste a API**: `https://www.novaedubncc.com.br/api/test.php`
   - Deve mostrar "PHP FUNCIONANDO!"

2. **Teste o frontend**: `https://www.novaedubncc.com.br/novaedu/`
   - Deve carregar normalmente

3. **Teste o login**: Tente fazer login na aplicação
   - Deve conectar com a API em `/api/`

## 📋 Checklist

- [ ] Criar pasta `/api/` na raiz
- [ ] Mover arquivos de `/novaedu/api/` para `/api/`
- [ ] Criar `.htaccess` em `/api/`
- [ ] Atualizar `VITE_API_URL` no frontend
- [ ] Fazer build do frontend
- [ ] Fazer upload do novo build
- [ ] Testar API: `https://www.novaedubncc.com.br/api/test.php`
- [ ] Testar frontend: `https://www.novaedubncc.com.br/novaedu/`
- [ ] Testar login na aplicação

## ⚠️ Considerações

### Vantagens:
- ✅ Resolve o problema imediatamente
- ✅ Não depende de configuração do servidor
- ✅ API isolada e mais fácil de gerenciar
- ✅ Cada pasta tem seu próprio `.htaccess` sem interferência

### Desvantagens:
- ⚠️ Precisa atualizar URL da API no frontend
- ⚠️ Precisa fazer novo build e upload
- ⚠️ Precisa configurar CORS adequadamente (já está no .htaccess)

## 🔍 URLs Após Mudança

- **Frontend**: `https://www.novaedubncc.com.br/novaedu/`
- **API**: `https://www.novaedubncc.com.br/api/`
- **API Login**: `https://www.novaedubncc.com.br/api/auth/login.php`
- **API Users**: `https://www.novaedubncc.com.br/api/users/index.php`

## 💡 Recomendação

**Faça isso apenas se:**
1. O suporte da Hostnet demorar muito para responder
2. O suporte não conseguir resolver
3. Você precisar de uma solução imediata

**Caso contrário**, aguarde o suporte da Hostnet resolver (é a solução mais correta).

---

**Importante**: Esta é uma solução alternativa que funciona, mas o ideal é que o suporte da Hostnet corrija a configuração do servidor.
