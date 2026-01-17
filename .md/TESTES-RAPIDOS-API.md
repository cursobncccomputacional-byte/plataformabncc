# 🚀 Testes Rápidos - API Hostinger

## ✅ Status

- ✅ API enviada para: `https://www.novaedubncc.com.br/api/`
- ✅ Banco criado: `u985723830_novaedu`
- ✅ Configuração atualizada

## 🧪 Teste 1: PHP Funciona?

**Acesse no navegador:**
```
https://www.novaedubncc.com.br/api/test-direto.php
```

**✅ Deve mostrar:**
```
PHP FUNCIONANDO DIRETO!
Versão PHP: 8.x
...
```

**❌ Se der erro 404**: Arquivo não foi enviado ou caminho errado
**❌ Se der erro 500**: Problema de configuração PHP

---

## 🧪 Teste 2: Conexão com Banco

**Acesse no navegador:**
```
https://www.novaedubncc.com.br/api/test-connection.php
```

**✅ Deve mostrar JSON:**
```json
{
    "status": "success",
    "message": "Conexão com banco de dados OK!",
    "database": "u985723830_novaedu"
}
```

**❌ Se der erro de conexão**: 
- Verificar host do MySQL (pode não ser `localhost`)
- Verificar credenciais em `api/config/database.php`
- Verificar se banco foi criado

---

## 🧪 Teste 3: API Básica

**Acesse no navegador:**
```
https://www.novaedubncc.com.br/api/test.php
```

**✅ Deve mostrar JSON:**
```json
{
    "status": "OK",
    "message": "API está acessível!",
    "php_version": "8.x"
}
```

---

## ⚠️ Se Host MySQL Não For `localhost`

**No painel da Hostinger, verificar:**
- Host pode ser: `mysql.hostinger.com`
- Ou um IP específico
- Ou outro host

**Atualizar em**: `api/config/database.php`
```php
'host' => 'mysql.hostinger.com', // Ou o host correto
```

---

## 📋 Ordem dos Testes

1. **Teste 1** → Se funcionar, PHP está OK ✅
2. **Teste 2** → Se funcionar, banco conectado ✅
3. **Teste 3** → Se funcionar, API básica OK ✅

---

## 🎯 Próximo Passo

**Após confirmar que tudo funciona:**
1. Executar `database-structure-pt.sql` no PHPMyAdmin
2. Gerar hash de senha e inserir usuário root
3. Fazer upload do frontend (pasta `dist/`)

---

**💡 Comece pelo Teste 1!** Se funcionar, continue para o Teste 2.
