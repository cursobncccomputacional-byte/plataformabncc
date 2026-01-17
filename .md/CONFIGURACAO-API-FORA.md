# ✅ Configuração: API Movida para Fora do Frontend

## 📁 Nova Estrutura

```
/home/supernerd/
  ├── novaedu/          (Frontend React)
  │   ├── .htaccess
  │   ├── index.html
  │   └── assets/
  └── api/              (API PHP - FORA do frontend)
      ├── .htaccess
      ├── test.php
      ├── auth/
      └── ...
```

## 🔧 Configurações Atualizadas

### 1. ✅ apiService.ts
- URL da API atualizada para: `https://www.novaedubncc.com.br/api`
- ✅ **Já atualizado automaticamente**

### 2. ⚠️ Arquivo .env (Você precisa atualizar)

**Edite o arquivo `.env` na raiz do projeto:**

```env
# API Backend PHP
VITE_API_URL=https://www.novaedubncc.com.br/api
```

**Ou se preferir, copie de `env-example.txt`:**

```bash
# O arquivo env-example.txt já está atualizado
```

### 3. ✅ .htaccess da API
- ✅ **Já criado** em `api/.htaccess`
- Configurado para executar PHP e CORS

## 📤 Próximos Passos

### Passo 1: Atualizar .env Local

Edite o arquivo `.env` e altere:

**De:**
```env
VITE_API_URL=https://www.novaedubncc.com.br/novaedu/api
```

**Para:**
```env
VITE_API_URL=https://www.novaedubncc.com.br/api
```

### Passo 2: Fazer Upload do .htaccess da API

1. **Arquivo**: `api/.htaccess` (já criado)
2. **Upload para**: `/api/.htaccess` (na raiz, não em `/novaedu/api/`)
3. **Permissão**: 644

### Passo 3: Fazer Build do Frontend

```bash
npm run build
```

Isso vai gerar o frontend com a nova URL da API.

### Passo 4: Fazer Upload do Build

1. **Fazer upload** de todos os arquivos de `dist/` para `/novaedu/`
2. **Substituir** arquivos existentes

### Passo 5: Testar

#### Teste 1: API Funciona?

Acesse: `https://www.novaedubncc.com.br/api/test.php`

**Resultado esperado:**
- ✅ Mostra "PHP FUNCIONANDO!" → API está funcionando!
- ❌ Mostra HTML → Problema com .htaccess da API

#### Teste 2: Frontend Conecta com API?

1. Acesse: `https://www.novaedubncc.com.br/novaedu/`
2. Abra o console do navegador (F12)
3. Tente fazer login
4. Verifique se há erros de CORS ou 404

**Resultado esperado:**
- ✅ Login funciona → Tudo OK!
- ❌ Erro CORS → Verificar .htaccess da API
- ❌ Erro 404 → Verificar URL da API no frontend

## 🔍 URLs Após Mudança

- **Frontend**: `https://www.novaedubncc.com.br/novaedu/`
- **API Base**: `https://www.novaedubncc.com.br/api/`
- **API Login**: `https://www.novaedubncc.com.br/api/auth/login.php`
- **API Users**: `https://www.novaedubncc.com.br/api/users/index.php`
- **API Test**: `https://www.novaedubncc.com.br/api/test.php`

## 📋 Checklist

- [ ] Atualizar `.env` com nova URL da API
- [ ] Fazer upload de `api/.htaccess` para `/api/.htaccess`
- [ ] Executar `npm run build`
- [ ] Fazer upload do build para `/novaedu/`
- [ ] Testar API: `https://www.novaedubncc.com.br/api/test.php`
- [ ] Testar frontend: `https://www.novaedubncc.com.br/novaedu/`
- [ ] Testar login na aplicação

## ⚠️ Se a API Não Funcionar

Se `https://www.novaedubncc.com.br/api/test.php` ainda retornar HTML:

1. **Verificar** se o `.htaccess` foi enviado para `/api/`
2. **Verificar** permissões do `.htaccess` (644)
3. **Verificar** se há `.htaccess` em nível superior interferindo
4. **Contatar suporte** da Hostnet se necessário

## ✅ Vantagens da Nova Estrutura

- ✅ **Sem conflitos de `.htaccess`** - Cada pasta tem seu próprio
- ✅ **API isolada** - Mais fácil de gerenciar
- ✅ **Funciona independente** da configuração do servidor para `/novaedu/`
- ✅ **Mais organizado** - Separação clara entre frontend e backend

---

**💡 Dica**: Após fazer o build e upload, teste primeiro a API (`/api/test.php`) para garantir que está funcionando antes de testar o frontend.
