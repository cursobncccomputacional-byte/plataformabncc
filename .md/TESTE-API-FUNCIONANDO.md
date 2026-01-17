# ✅ Teste: Verificar se API está Funcionando

## 🧪 Arquivo de Teste

**Arquivo**: `api/test.php`

**O que faz:**
- Retorna JSON com informações do servidor
- Verifica se PHP está executando
- Mostra caminhos do servidor

## 📋 Como Testar

### Teste 1: Acessar Diretamente

**No navegador:**
```
https://www.novaedubncc.com.br/api/test.php
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "message": "API esta acessivel!",
  "php_version": "7.4.33",
  "server": "Apache/2.4.x",
  "timestamp": "2026-01-16 12:00:00",
  "request_method": "GET",
  "request_uri": "/api/test.php",
  "document_root": "/public_html",
  "script_filename": "/public_html/api/test.php"
}
```

### Teste 2: Via cURL

```bash
curl https://www.novaedubncc.com.br/api/test.php
```

**Deve retornar JSON** ✅

### Teste 3: Via Console do Navegador

**Abrir Console (F12) e executar:**
```javascript
fetch('https://www.novaedubncc.com.br/api/test.php')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## ✅ O Que Verificar

### Se Retornar JSON:

✅ **API está funcionando!**
- PHP está executando
- Arquivo está no lugar certo
- `.htaccess` não está bloqueando

**Próximo passo:**
- Testar `/api/auth/login`

### Se Retornar 404:

❌ **Arquivo não encontrado**
- Verificar se `test.php` está em `/public_html/api/`
- Verificar permissões (644)

### Se Retornar HTML:

❌ **`.htaccess` está redirecionando**
- Verificar `.htaccess` na raiz
- Verificar se exclui `/api/`

### Se Retornar Erro PHP:

❌ **Erro de sintaxe ou configuração**
- Verificar logs de erro do PHP
- Verificar se PHP está ativo

## 📋 Informações Úteis

O arquivo retorna:
- **php_version**: Versão do PHP
- **server**: Software do servidor
- **document_root**: Caminho raiz do servidor
- **script_filename**: Caminho completo do arquivo

**Use essas informações para verificar:**
- Se o DocumentRoot está correto (`/public_html`)
- Se o arquivo está no lugar certo
- Se PHP está funcionando

## 🎯 Próximo Passo

**Após confirmar que `test.php` funciona:**

1. **Testar login:**
   ```
   https://www.novaedubncc.com.br/api/auth/login
   ```

2. **Se ainda der 404:**
   - Verificar se `login.php` existe em `/public_html/api/auth/`
   - Verificar estrutura de pastas

---

**💡 Dica**: Se `test.php` funcionar, o problema não é de configuração geral, mas específico do arquivo `login.php` ou da estrutura de pastas!
