# 🔧 Corrigir Erro 404 na API

## ❌ Problema

Ao acessar `novaedubncc.com.br/api/auth/login` aparece erro 404.

## 🔍 Causa Provável

O site está na pasta `/novaedu/`, então a API deve estar em `/novaedu/api/`.

## ✅ Solução

### Verificar Estrutura no Servidor

A estrutura correta deve ser:

```
/novaedu/
├── index.html          (site React)
├── assets/
├── .htaccess
└── api/                ← API DEVE ESTAR AQUI!
    ├── config/
    ├── auth/
    └── users/
```

### Passo a Passo

1. **Acesse o File Manager** da Hostnet
2. **Navegue até `/novaedu/`** (onde está o `index.html`)
3. **Verifique se a pasta `api/` está dentro de `/novaedu/`**
4. **Se não estiver, faça upload da pasta `api/` para dentro de `/novaedu/`**

### Testar

Após fazer upload, teste:

**Opção 1** (se domínio aponta para `/novaedu/`):
```
https://www.novaedubncc.com.br/api/auth/login
```

**Opção 2** (se precisar do caminho completo):
```
https://www.novaedubncc.com.br/novaedu/api/auth/login
```

## 🧪 Teste Rápido

1. **Crie um arquivo de teste** `api/test.php`:
```php
<?php
echo "API funcionando!";
?>
```

2. **Acesse**: `https://www.novaedubncc.com.br/api/test.php`
   - Se funcionar: API está no lugar certo ✅
   - Se der 404: API está no lugar errado ❌

3. **Se der 404, tente**: `https://www.novaedubncc.com.br/novaedu/api/test.php`

## 📋 Checklist

- [ ] Pasta `api/` está dentro de `/novaedu/`?
- [ ] Estrutura de pastas está correta (`api/config/`, `api/auth/`, etc)?
- [ ] Arquivo `.htaccess` está na pasta `api/`?
- [ ] Permissões corretas (pastas 755, arquivos 644)?
- [ ] Testou o arquivo `test.php`?

## 🔍 Verificar Localização

No File Manager, você deve ver:

```
novaedu/
├── index.html
├── assets/
└── api/          ← Deve estar aqui!
    ├── config/
    ├── auth/
    └── users/
```

**Se a pasta `api/` estiver em outro lugar, mova para dentro de `/novaedu/`!**

---

**💡 Dica**: A API deve estar no mesmo nível do `index.html` do site!
