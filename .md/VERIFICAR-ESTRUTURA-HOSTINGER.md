# 🔍 Verificar Estrutura na Hostinger

## 🎯 Objetivo

Identificar onde estão os arquivos e reorganizar para `public_html/`.

## 📋 Passo a Passo

### Passo 1: Verificar Estrutura Atual

**Via gerenciador de arquivos da Hostinger ou FileZilla:**

1. **Verificar se existe `public_html/`**
   - Deve existir na raiz da conta
   - É onde ficam os arquivos do site

2. **Verificar onde estão os arquivos:**
   - Estão dentro de `public_html/`? ✅
   - Estão fora de `public_html/`? ❌ (precisa mover)

3. **Verificar estrutura atual:**
   - Onde está o `index.html`?
   - Onde está a pasta `api/`?
   - Onde está o `.htaccess`?

### Passo 2: Usar Script de Listagem

**Fazer upload de `listar-todos-arquivos.php` para `public_html/`**

**Acessar**: `https://www.novaedubncc.com.br/listar-todos-arquivos.php`

**Isso mostrará:**
- Estrutura completa de pastas
- Onde estão todos os arquivos
- Caminhos completos

### Passo 3: Reorganizar Arquivos

**Se arquivos estão fora de `public_html/`:**

1. **Mover** todos os arquivos para `public_html/`
2. **OU** fazer upload novamente diretamente em `public_html/`

**Estrutura final desejada:**
```
/public_html/
  ├── .htaccess
  ├── index.html
  ├── assets/
  ├── images/
  ├── pdf/
  ├── logo/
  └── api/
      ├── .htaccess
      ├── config/
      ├── auth/
      └── users/
```

## 🧪 Testar Após Reorganizar

### Teste 1: Verificar DocumentRoot

**Criar arquivo**: `public_html/verificar-documentroot.php`

**Conteúdo:**
```php
<?php
echo "DocumentRoot: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Diretorio Atual: " . __DIR__ . "\n";
echo "Arquivo Atual: " . __FILE__ . "\n";
?>
```

**Acessar**: `https://www.novaedubncc.com.br/verificar-documentroot.php`

**Esperado**: DocumentRoot deve ser `/public_html/` ou caminho que termina com `public_html`

### Teste 2: Testar Arquivos

**Após reorganizar, testar:**
- Frontend: `https://www.novaedubncc.com.br/`
- PHP: `https://www.novaedubncc.com.br/test-direto.php`
- API: `https://www.novaedubncc.com.br/api/test-api-direto.php`

## 📋 Checklist

- [ ] Verificar se `public_html/` existe
- [ ] Verificar onde estão os arquivos atualmente
- [ ] Fazer upload de `listar-todos-arquivos.php` para `public_html/`
- [ ] Acessar script de listagem para ver estrutura
- [ ] Mover/reenviar arquivos para `public_html/`
- [ ] Verificar estrutura final
- [ ] Testar todos os endpoints

## 💡 Dica

**Na Hostinger, o DocumentRoot é sempre `public_html/` para o domínio principal.**

Todos os arquivos do site devem estar dentro de `public_html/`!

---

**💡 Ação**: Verificar estrutura atual e reorganizar para `public_html/`!
