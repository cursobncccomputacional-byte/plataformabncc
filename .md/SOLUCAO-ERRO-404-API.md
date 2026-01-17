# 🔧 Solução: Erro 404 na API

## ❌ Problema Identificado

O console mostra:
- **Erro 404**: `POST https://www.novaedubncc.com.br/api/auth/login` - Not Found
- **Erro JSON**: Recebendo HTML em vez de JSON (página de erro 404)

## 🔍 Possíveis Causas

1. **Pasta `api/` não foi enviada para o servidor**
2. **Pasta `api/` está no lugar errado**
3. **Estrutura de pastas incorreta no servidor**

## ✅ Solução Passo a Passo

### 1. Verificar Estrutura no Servidor

A estrutura **DEVE** ser assim no servidor:

```
/public_html/ (ou /www/)
├── index.html
├── assets/
├── ... (outros arquivos do frontend)
└── api/                    ← PASTA API AQUI
    ├── .htaccess
    ├── test.php
    ├── auth/
    │   ├── login.php
    │   ├── logout.php
    │   └── me.php
    ├── config/
    │   ├── cors.php
    │   ├── database.php
    │   └── auth.php
    └── users/
        └── index.php
```

### 2. Verificar se a API Está Acessível

Teste diretamente no navegador:
```
https://www.novaedubncc.com.br/api/test.php
```

**Se funcionar**: Você verá:
```json
{
  "status": "OK",
  "message": "API está acessível!",
  ...
}
```

**Se não funcionar (404)**: A pasta `api/` não está no lugar correto.

### 3. Verificar Localização da Pasta `api/`

**Opção A: Se o site está em `/public_html/`**
- A pasta `api/` deve estar em `/public_html/api/`

**Opção B: Se o site está em `/public_html/novaedu/` ou subpasta**
- A pasta `api/` deve estar em `/public_html/novaedu/api/`
- E a URL seria: `https://www.novaedubncc.com.br/novaedu/api/auth/login`

**Opção C: Se usa cPanel/File Manager**
- Navegue até a pasta onde está o `index.html` do site
- A pasta `api/` deve estar no mesmo nível

### 4. Upload Correto da Pasta `api/`

**Via FTP (FileZilla):**
1. Conecte ao servidor
2. Navegue até a pasta onde está o `index.html` do site
3. Faça upload da pasta `api/` completa
4. Certifique-se de que a estrutura está:
   ```
   /public_html/
   ├── index.html
   └── api/
       ├── .htaccess
       ├── auth/
       └── config/
   ```

### 5. Verificar Permissões

Após o upload, verifique as permissões:
- **Pastas**: `755` (drwxr-xr-x)
- **Arquivos PHP**: `644` (-rw-r--r--)

**Via SSH (se tiver acesso):**
```bash
chmod -R 755 api/
find api/ -type f -name "*.php" -exec chmod 644 {} \;
```

### 6. Verificar Configuração do Banco de Dados

Certifique-se de que `api/config/database.php` está configurado:

```php
$host = 'localhost'; // ou IP do servidor
$dbname = 'supernerds3';
$username = 'seu_usuario_banco';
$password = 'sua_senha_banco';
```

### 7. Testar Novamente

Após corrigir:
1. Teste: `https://www.novaedubncc.com.br/api/test.php`
2. Se funcionar, teste o login no site
3. Verifique o console do navegador (F12) para novos erros

## 🔍 Diagnóstico Rápido

### Teste 1: API Test
Acesse: `https://www.novaedubncc.com.br/api/test.php`
- ✅ **Funciona**: API está no lugar certo
- ❌ **404**: API não está no lugar certo ou não foi enviada

### Teste 2: Verificar Estrutura
Via FTP, verifique se existe:
- `/public_html/api/test.php` ✅
- `/public_html/api/auth/login.php` ✅

### Teste 3: Verificar .htaccess
Certifique-se de que existe:
- `/public_html/api/.htaccess` ✅

## ⚠️ Problemas Comuns

### Problema: "404 Not Found"
**Solução**: Verificar se a pasta `api/` está na raiz do site (mesmo nível do `index.html`)

### Problema: "500 Internal Server Error"
**Solução**: 
- Verificar `api/config/database.php`
- Verificar logs de erro do PHP
- Verificar permissões dos arquivos

### Problema: "CORS Error"
**Solução**: 
- Verificar `api/config/cors.php`
- Verificar se o domínio está na lista de origens permitidas

## 📝 Checklist Final

Antes de testar novamente, verifique:

- [ ] Pasta `api/` foi enviada para o servidor
- [ ] Pasta `api/` está no mesmo nível do `index.html`
- [ ] Arquivo `api/test.php` está acessível via navegador
- [ ] Permissões estão corretas (755 para pastas, 644 para arquivos)
- [ ] `api/config/database.php` está configurado corretamente
- [ ] `.htaccess` existe na pasta `api/`

---

**💡 Dica**: Se ainda não funcionar, verifique os logs de erro do servidor ou entre em contato com o suporte da hospedagem para verificar a estrutura de pastas.
