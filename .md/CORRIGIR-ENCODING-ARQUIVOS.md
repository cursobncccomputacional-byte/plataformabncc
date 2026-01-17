# 🔧 Corrigir Encoding dos Arquivos PHP

## ⚠️ Problema Identificado

Os arquivos PHP estão com encoding incorreto, causando:
- `estÃ¡` em vez de `está`
- `requisiÃ§Ãµes` em vez de `requisições`
- Caracteres especiais corrompidos

## ✅ Solução

### Opção 1: Reenviar Arquivos (Recomendado)

**Fazer upload novamente** dos arquivos PHP, garantindo que sejam salvos em **UTF-8**.

### Opção 2: Corrigir no Servidor

**No servidor, editar os arquivos e salvar em UTF-8:**
- Usar editor que suporta UTF-8
- Salvar como UTF-8 sem BOM
- Verificar encoding antes de salvar

### Opção 3: Usar Arquivos Sem Acentos

**Já corrigi o arquivo `test.php`** removendo acentos para evitar problemas de encoding.

## 📋 Arquivos que Precisam de Atenção

Verificar encoding em:
- ✅ `api/test.php` (já corrigido)
- ⚠️ `api/test-connection.php`
- ⚠️ `api/config/database.php`
- ⚠️ `api/auth/login.php`
- ⚠️ `api/auth/logout.php`
- ⚠️ `api/auth/me.php`
- ⚠️ Outros arquivos PHP

## 🔍 Como Verificar Encoding

**No PHPMyAdmin ou editor:**
- Verificar se arquivo está em UTF-8
- Se não estiver, converter para UTF-8

**No navegador:**
- Se aparecer `estÃ¡` ou caracteres estranhos = encoding errado
- Se aparecer corretamente = encoding OK

## 💡 Dica

**Para evitar problemas futuros:**
- Sempre salvar arquivos PHP em UTF-8
- Usar editor que suporta UTF-8 (VS Code, Notepad++, etc.)
- Verificar encoding antes de fazer upload

---

**💡 Arquivo `test.php` já foi corrigido!** Reenvie para o servidor.
