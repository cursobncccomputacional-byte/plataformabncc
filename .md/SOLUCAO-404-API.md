# 🔧 Solução: Erro 404 na API

## ❌ Problema

Ao acessar `novaedubncc.com.br/api/auth/login` aparece erro 404.

## 🔍 Possíveis Causas

### 1. Caminho Incorreto

Se o site está na pasta `/novaedu/`, a URL correta seria:
- ❌ `novaedubncc.com.br/api/auth/login`
- ✅ `novaedubncc.com.br/novaedu/api/auth/login`

### 2. Pasta API Não Encontrada

Verifique se a pasta `api/` está no local correto:
- Deve estar no mesmo nível do `index.html` do site
- Ou dentro da pasta onde o site está hospedado

### 3. Estrutura de Pastas no Servidor

Verifique a estrutura atual no servidor:

```
Opção A (se site na raiz):
public_html/
├── index.html
├── assets/
└── api/          ← Deve estar aqui

Opção B (se site em subpasta):
public_html/
└── novaedu/
    ├── index.html
    ├── assets/
    └── api/      ← Deve estar aqui
```

## ✅ Soluções

### Solução 1: Verificar Localização da Pasta API

1. **Acesse o File Manager** da Hostnet
2. **Navegue até onde está o `index.html`** do site
3. **Verifique se a pasta `api/` está no mesmo nível**

### Solução 2: Testar Caminho com /novaedu/

Se o site está em `/novaedu/`, teste:

```
https://www.novaedubncc.com.br/novaedu/api/auth/login
```

### Solução 3: Criar Arquivo de Teste

Crie um arquivo `api/test.php` para verificar se o PHP está funcionando:

```php
<?php
phpinfo();
?>
```

Acesse: `https://www.novaedubncc.com.br/api/test.php` (ou com `/novaedu/`)

Se funcionar, o PHP está OK. Se não, há problema de configuração.

### Solução 4: Verificar .htaccess

Certifique-se de que o arquivo `.htaccess` está na pasta `api/` e tem o conteúdo correto.

## 🧪 Teste Passo a Passo

1. **Verificar se a pasta existe:**
   - Acesse: `https://www.novaedubncc.com.br/api/`
   - Deve listar os arquivos ou dar erro de listagem (não 404)

2. **Testar PHP:**
   - Crie `api/test.php` com `<?php echo "OK"; ?>`
   - Acesse: `https://www.novaedubncc.com.br/api/test.php`
   - Deve mostrar "OK"

3. **Testar endpoint:**
   - Acesse: `https://www.novaedubncc.com.br/api/auth/login`
   - Deve retornar JSON (erro ou sucesso, mas não 404)

## 📋 Checklist

- [ ] Pasta `api/` existe no servidor?
- [ ] Está no local correto (mesmo nível do index.html)?
- [ ] Arquivo `.htaccess` está na pasta `api/`?
- [ ] PHP está habilitado no servidor?
- [ ] Testou o caminho com `/novaedu/` se necessário?

---

**💡 Dica**: Me diga qual é a estrutura de pastas no servidor que eu ajudo a identificar o problema exato!
