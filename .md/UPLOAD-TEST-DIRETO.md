# 📤 Upload do Arquivo test-direto.php

## ✅ Progresso Importante!

O erro mudou de **500** para **404** sem o `.htaccess`! Isso significa:
- ✅ O `.htaccess` estava causando o erro 500
- ✅ Sem `.htaccess`, o servidor não está redirecionando para `index.html`
- ⚠️ O arquivo `test-direto.php` não está no servidor

## 📋 Passo a Passo: Fazer Upload

### Passo 1: Localizar o Arquivo Local

O arquivo está em:
```
c:\projetos\PlataformaBNCC\api\test-direto.php
```

### Passo 2: Fazer Upload via FileZilla

1. **Conecte** ao servidor via FileZilla
2. **Navegue** até `/novaedu/` (raiz do frontend)
3. **Arraste** o arquivo `api/test-direto.php` do seu computador
4. **Solte** na pasta `/novaedu/` do servidor
5. **Confirme** que o arquivo foi enviado

### Passo 3: Verificar Permissões

O arquivo deve ter permissão **644**:
- **Via FileZilla**: Clique com botão direito → **Permissões de arquivo**
- Marque: **644** (ou **rw-r--r--**)

### Passo 4: Testar

Acesse:
```
https://www.novaedubncc.com.br/novaedu/test-direto.php
```

**Resultado esperado:**
- ✅ Mostra "PHP FUNCIONANDO DIRETO!" → **PHP funciona sem .htaccess!** 🎉
- ❌ Ainda 404 → Verificar se o upload foi feito corretamente
- ❌ 500 → Problema com o arquivo PHP em si

## 🎯 Interpretação dos Resultados

### Se Funcionar (Mostra "PHP FUNCIONANDO DIRETO!"):

✅ **PHP está funcionando perfeitamente!**
✅ **O problema era o `.htaccess` causando erro 500**

**Próximos passos:**
1. Usar versão simplificada do `.htaccess` que criei
2. Testar gradualmente
3. Adicionar configurações conforme necessário

### Se Ainda Der Erro:

**404**: Verificar se o arquivo está realmente em `/novaedu/`
**500**: Problema com o arquivo PHP ou configuração do servidor

## 📋 Checklist

- [ ] Fazer upload de `api/test-direto.php` para `/novaedu/test-direto.php`
- [ ] Verificar permissões (644)
- [ ] Testar: `https://www.novaedubncc.com.br/novaedu/test-direto.php`
- [ ] Anotar resultado
- [ ] Se funcionar, fazer upload do `.htaccess` simplificado

---

**💡 Dica**: Se funcionar sem `.htaccess`, podemos usar uma versão muito simples do `.htaccess` apenas para o SPA React, sem regras complexas que causam erro 500.
