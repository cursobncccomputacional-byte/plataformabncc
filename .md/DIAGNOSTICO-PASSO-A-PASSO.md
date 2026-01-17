# 🔍 Diagnóstico Passo a Passo

## 🎯 Objetivo

Identificar exatamente onde está o problema, testando cada parte separadamente.

## 📋 Teste 1: PHP Funciona no Servidor?

### Criar arquivo de teste simples

**Criar arquivo**: `test-php-simples.php` na raiz

**Conteúdo:**
```php
<?php
echo "PHP FUNCIONA!";
phpinfo();
?>
```

**Fazer upload** para raiz do domínio

**Acessar**: `https://www.novaedubncc.com.br/test-php-simples.php`

**Resultado esperado:**
- ✅ Mostra "PHP FUNCIONA!" e phpinfo() → **PHP está OK, continue Teste 2**
- ❌ Mostra HTML do React → **Problema: .htaccess redirecionando, vá para Teste 2**
- ❌ 404 Not Found → **Problema: arquivo não encontrado ou DocumentRoot errado**

---

## 📋 Teste 2: .htaccess Está Sendo Processado?

### Criar .htaccess com erro proposital

**Renomear** `.htaccess` atual para `.htaccess.backup`

**Criar novo** `.htaccess` com conteúdo:
```apache
# Teste - se aparecer erro 500, .htaccess está sendo processado
INVALID_DIRECTIVE_TEST
```

**Fazer upload** para raiz

**Acessar**: `https://www.novaedubncc.com.br/`

**Resultado esperado:**
- ✅ Erro 500 → **.htaccess está sendo processado, continue Teste 3**
- ❌ Site funciona normalmente → **.htaccess NÃO está sendo processado (problema de servidor)**

**Após teste**: Restaurar `.htaccess.backup` para `.htaccess`

---

## 📋 Teste 3: Arquivo PHP Funciona SEM .htaccess?

### Remover .htaccess temporariamente

**Renomear** `.htaccess` para `.htaccess.temp`

**Acessar**: `https://www.novaedubncc.com.br/test-php-simples.php`

**Resultado esperado:**
- ✅ Mostra "PHP FUNCIONA!" → **PHP funciona, problema é com .htaccess, continue Teste 4**
- ❌ Ainda mostra HTML → **Problema: algo mais está redirecionando (servidor)**
- ❌ 404 → **Problema: DocumentRoot ou caminho errado**

**Após teste**: Restaurar `.htaccess.temp` para `.htaccess`

---

## 📋 Teste 4: Pasta /api/ Está Acessível?

### Verificar estrutura via FTP

**Via FileZilla, verificar:**
1. Onde está a pasta `api/`? (caminho completo)
2. Onde está o `index.html`? (caminho completo)
3. Onde está o `.htaccess`? (caminho completo)

**Anotar caminhos completos**

### Testar acesso direto

**Criar arquivo**: `api/test-api-direto.php`

**Conteúdo:**
```php
<?php
echo "API FUNCIONA!";
echo "\nCaminho: " . __FILE__;
?>
```

**Fazer upload** para `api/test-api-direto.php`

**Acessar**: `https://www.novaedubncc.com.br/api/test-api-direto.php`

**Resultado esperado:**
- ✅ Mostra "API FUNCIONA!" → **Pasta /api/ está OK, continue Teste 5**
- ❌ 404 → **Pasta /api/ não está no DocumentRoot ou caminho errado**
- ❌ Mostra HTML → **.htaccess está redirecionando /api/**

---

## 📋 Teste 5: DocumentRoot Está Correto?

### Verificar no painel da Hostinger

**No painel (hPanel):**
1. Ir em "Domínios" → "Gerenciar Domínios"
2. Selecionar `novaedubncc.com.br`
3. Ver "Diretório do Site" ou "Document Root"
4. **Anotar o caminho**

### Comparar com estrutura real

**Via FTP, verificar:**
- Onde está o `index.html`? (caminho completo)
- O DocumentRoot aponta para onde o `index.html` está?

**Se forem diferentes:**
- ❌ **Problema identificado**: Arquivos não estão no DocumentRoot
- ✅ **Solução**: Mover arquivos para DocumentRoot OU ajustar DocumentRoot

---

## 📋 Teste 6: .htaccess da Pasta /api/

### Verificar se existe .htaccess em /api/

**Via FTP, verificar:**
- Existe `api/.htaccess`?
- Qual é o conteúdo?

**Se não existir**, criar `api/.htaccess`:
```apache
# Desabilitar rewrite na pasta api
RewriteEngine Off
```

**Fazer upload** para `api/.htaccess`

**Testar novamente**: `https://www.novaedubncc.com.br/api/test-api-direto.php`

---

## 📊 Resumo dos Testes

| Teste | O Que Testa | Resultado Esperado |
|-------|------------|-------------------|
| 1 | PHP funciona? | Mostra "PHP FUNCIONA!" |
| 2 | .htaccess processado? | Erro 500 com .htaccess inválido |
| 3 | PHP sem .htaccess? | PHP funciona sem .htaccess |
| 4 | Pasta /api/ acessível? | Mostra "API FUNCIONA!" |
| 5 | DocumentRoot correto? | Caminhos coincidem |
| 6 | .htaccess em /api/ | RewriteEngine Off funciona |

---

## 🎯 Próximo Passo

**Comece pelo Teste 1** e me informe o resultado de cada teste.

Com os resultados, consigo identificar exatamente onde está o problema!

---

**💡 Dica**: Faça um teste por vez e me informe o resultado antes de continuar para o próximo.
