# 🔧 Corrigir Encoding do Arquivo test.php

## ❌ Problema

O arquivo `test.php` no servidor está com problemas de encoding:
- `estÃ¡` em vez de `está`
- `acessÃ­vel` em vez de `acessível`
- `requisiÃ§Ãµes` em vez de `requisições`

## ✅ Solução

### Passo 1: Fazer Upload do Arquivo Corrigido

**Arquivo local corrigido:**
- `c:\projetos\PlataformaBNCC\api\test.php`

**Upload para servidor:**
- Caminho: `/public_html/api/test.php`
- Permissão: 644

### Passo 2: Verificar Encoding

**Antes de fazer upload:**
1. Abrir arquivo no editor (VS Code, Notepad++, etc)
2. Verificar encoding: deve ser **UTF-8 sem BOM**
3. Se necessário, converter para UTF-8

**No VS Code:**
- Clicar no canto inferior direito
- Selecionar "UTF-8"
- Salvar

**No Notepad++:**
- Menu: Encoding → Convert to UTF-8
- Salvar

### Passo 3: Testar

**Acessar:**
```
https://www.novaedubncc.com.br/api/test.php
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "message": "API esta acessivel!",
  "php_version": "7.4.33",
  ...
}
```

## 📋 Checklist

- [ ] Arquivo local está sem acentos problemáticos
- [ ] Encoding está como UTF-8 sem BOM
- [ ] Upload feito para `/public_html/api/test.php`
- [ ] Permissão configurada (644)
- [ ] Teste retorna JSON corretamente

## 💡 Dica

**Se ainda tiver problemas de encoding após upload:**

1. **Verificar configuração do servidor:**
   - PHP pode estar usando encoding diferente
   - Verificar `default_charset` no `php.ini`

2. **Usar função mb_convert_encoding:**
   ```php
   $text = mb_convert_encoding($text, 'UTF-8', 'ISO-8859-1');
   ```

3. **Forçar UTF-8 nos headers:**
   ```php
   header('Content-Type: application/json; charset=utf-8');
   ```

---

**✅ O arquivo local já está corrigido e pronto para upload!**
