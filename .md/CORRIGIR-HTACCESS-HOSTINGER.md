# 🔧 Corrigir .htaccess na Hostinger

## ⚠️ Problema Identificado

1. **Arquivo PHP na raiz** (`test-estrutura.php`) está sendo redirecionado para `index.html` (SPA)
2. **Pasta `/api/`** retorna 404

**Causa**: O `.htaccess` está redirecionando TUDO para `index.html`, incluindo arquivos PHP e a pasta `/api/`.

## ✅ Solução

### 1. Fazer Upload do .htaccess Corrigido

**Arquivo**: `dist/.htaccess` (já corrigido)

**Fazer upload para**: Raiz do domínio (mesmo lugar do `index.html`)

**O que foi corrigido:**
- ✅ Regra para `/api/` ANTES de qualquer outra regra
- ✅ Regra para arquivos `.php` ANTES de redirecionar para `index.html`
- ✅ Verificação de arquivos existentes antes de redirecionar

### 2. Verificar Estrutura

**Estrutura esperada:**
```
/public_html/  (ou DocumentRoot)
  ├── .htaccess  (NOVO - fazer upload)
  ├── index.html
  ├── assets/
  └── api/
      ├── .htaccess
      └── test-connection.php
```

### 3. Testar Após Upload

**Teste 1: PHP na raiz**
```
https://www.novaedubncc.com.br/test-estrutura.php
```
**Esperado**: Mostrar diagnóstico (não redirecionar para SPA)

**Teste 2: API**
```
https://www.novaedubncc.com.br/api/test-connection.php
```
**Esperado**: JSON com conexão OK (não 404)

**Teste 3: Frontend**
```
https://www.novaedubncc.com.br/
```
**Esperado**: Site React funcionando normalmente

## 📋 Ordem das Regras no .htaccess

**IMPORTANTE**: A ordem das regras é crítica!

1. **PRIMEIRO**: Não redirecionar `/api/`
2. **SEGUNDO**: Não redirecionar arquivos `.php`
3. **TERCEIRO**: Não redirecionar arquivos existentes
4. **ÚLTIMO**: Redirecionar resto para `index.html`

## 🔍 Se Ainda Não Funcionar

### Verificar 1: Arquivos Estão no Lugar Certo?

**Via FTP, verificar:**
- `api/test-connection.php` existe?
- Está em `/public_html/api/` ou outra pasta?
- Permissões estão corretas (644)?

### Verificar 2: DocumentRoot Está Correto?

**No painel da Hostinger:**
- Verificar DocumentRoot do domínio
- Arquivos devem estar dentro do DocumentRoot

### Verificar 3: .htaccess Foi Aplicado?

**Testar:**
- Remover `.htaccess` temporariamente
- Testar se PHP funciona sem `.htaccess`
- Se funcionar, problema é com `.htaccess`
- Se não funcionar, problema é outro

## 💡 Dica

**Se a pasta `/api/` ainda der 404 após corrigir `.htaccess`:**

1. Verificar se pasta `api/` está dentro do DocumentRoot
2. Verificar se arquivos foram enviados corretamente
3. Verificar permissões (644 para arquivos, 755 para pastas)

---

**💡 Ação**: Fazer upload do novo `.htaccess` e testar novamente!
