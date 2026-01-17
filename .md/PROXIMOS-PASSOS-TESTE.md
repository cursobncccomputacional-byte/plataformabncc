# 🎯 Próximos Passos: Teste sem .htaccess

## ✅ Situação Atual

- ❌ **Com `.htaccess`**: Erro 500 (Internal Server Error)
- ✅ **Sem `.htaccess`**: Erro 404 (arquivo não encontrado)
- 🎯 **Conclusão**: O `.htaccess` estava causando erro 500!

## 📋 Passo a Passo

### Passo 1: Fazer Upload do test-direto.php

**Arquivo local:**
```
c:\projetos\PlataformaBNCC\api\test-direto.php
```

**Upload para:**
```
/novaedu/test-direto.php
```

**Via FileZilla:**
1. Conecte ao servidor
2. Navegue até `/novaedu/`
3. Arraste `api/test-direto.php` para `/novaedu/`
4. Verifique permissões (644)

### Passo 2: Testar PHP sem .htaccess

Acesse:
```
https://www.novaedubncc.com.br/novaedu/test-direto.php
```

**Resultado esperado:**
- ✅ Mostra "PHP FUNCIONANDO DIRETO!" → **PHP funciona!** 🎉
- ❌ Ainda 404 → Verificar se o upload foi feito
- ❌ 500 → Problema com PHP ou servidor

### Passo 3: Se PHP Funcionar

**Fazer upload do `.htaccess` simplificado:**

**Arquivo local:**
```
c:\projetos\PlataformaBNCC\dist\.htaccess
```

**Upload para:**
```
/novaedu/.htaccess
```

**IMPORTANTE:**
- Substituir o arquivo existente
- Verificar permissões (644)

### Passo 4: Testar com .htaccess Simplificado

Acesse:
```
https://www.novaedubncc.com.br/novaedu/test-direto.php
```

**Resultado esperado:**
- ✅ Mostra "PHP FUNCIONANDO DIRETO!" → **Funcionou!** 🎉
- ❌ Erro 500 → Versão ainda muito complexa, usar versão ainda mais simples
- ❌ HTML → `.htaccess` está redirecionando (ajustar regras)

## 🔄 Se Ainda Der Erro 500 com .htaccess

**Usar versão AINDA MAIS SIMPLES:**

```apache
# Versão MÍNIMA - apenas SPA
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

**Esta versão:**
- ✅ Funciona para SPA React
- ⚠️ Pode redirecionar arquivos PHP (mas podemos mover API para fora)

## 📋 Checklist Completo

- [ ] Fazer upload de `test-direto.php` para `/novaedu/`
- [ ] Testar sem `.htaccess` (deve funcionar)
- [ ] Fazer upload do `.htaccess` simplificado
- [ ] Testar com `.htaccess` simplificado
- [ ] Se der erro 500, usar versão mínima
- [ ] Se funcionar, testar frontend React

---

**💡 Dica**: Teste uma coisa de cada vez. Se PHP funcionar sem `.htaccess`, sabemos que o problema é apenas com as regras do `.htaccess`.
