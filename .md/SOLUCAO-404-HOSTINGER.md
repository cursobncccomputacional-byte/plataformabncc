# 🔧 Solução: Erro 404 na Hostinger

## ⚠️ Problema

**URL testada**: `novaedubncc.com.br/api/test-connection.php`
**Erro**: 404 Not Found

## 🔍 Diagnóstico Rápido

### Verificar 3 Coisas:

1. **Onde está a pasta `api/`?** (via FTP)
2. **Qual é o DocumentRoot?** (no painel da Hostinger)
3. **Onde está o `index.html`?** (via FTP)

## 📋 Passo a Passo

### 1. Verificar via FTP

**Conectar via FileZilla:**
- Procurar pasta `api/`
- Anotar caminho completo
- Exemplo: `/public_html/api/` ou `/public_html/novaedu/api/`

### 2. Verificar DocumentRoot

**No painel da Hostinger:**
1. Ir em "Domínios" → "Gerenciar Domínios"
2. Selecionar `novaedubncc.com.br`
3. Ver "Diretório do Site" ou "Document Root"
4. Anotar o caminho

### 3. Comparar

**Se DocumentRoot é `/public_html/` e arquivos estão em `/public_html/api/`:**
- ✅ Estrutura correta
- URL: `https://www.novaedubncc.com.br/api/test-connection.php`

**Se DocumentRoot é `/public_html/` mas arquivos estão em `/public_html/novaedu/api/`:**
- ❌ Estrutura incorreta
- Mover arquivos OU ajustar URL para `/novaedu/api/`

## 🧪 Teste Rápido

**Criar arquivo**: `test-estrutura.php` na raiz

**Conteúdo:**
```php
<?php
echo "DocumentRoot: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script: " . __FILE__ . "<br>";
echo "Diretorio: " . __DIR__ . "<br>";
?>
```

**Acessar**: `https://www.novaedubncc.com.br/test-estrutura.php`

**Isso mostrará onde o servidor procura arquivos!**

## ✅ Soluções

### Solução 1: Arquivos na Raiz (Recomendado)

**Estrutura:**
```
/public_html/
  ├── index.html
  ├── assets/
  └── api/
      └── test-connection.php
```

**URL correta:**
```
https://www.novaedubncc.com.br/api/test-connection.php
```

### Solução 2: Arquivos em Subpasta

**Estrutura:**
```
/public_html/novaedu/
  ├── index.html
  ├── assets/
  └── api/
      └── test-connection.php
```

**URL correta:**
```
https://www.novaedubncc.com.br/novaedu/api/test-connection.php
```

## 🎯 Ação Imediata

**Preciso que você verifique:**

1. **Via FTP**: Onde está a pasta `api/`? (caminho completo)
2. **No painel**: Qual é o DocumentRoot do domínio?
3. **Via FTP**: Onde está o `index.html`?

**Com essas informações, consigo identificar exatamente o problema!**

---

**💡 Dica**: Na Hostinger, geralmente o DocumentRoot é `public_html/` para o domínio principal. Verifique isso primeiro!
