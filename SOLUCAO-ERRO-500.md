# 🔧 Solução para Erro 500 - GET /api/users

## 🔍 Problema Identificado

O endpoint `GET /api/users` está retornando **HTML em vez de JSON** com erro 500, indicando um erro fatal no PHP que não está sendo capturado corretamente.

## ✅ Correções Aplicadas

### 1. **Ordem de Inclusão de Arquivos**
- ✅ `database.php` e `auth.php` carregados ANTES de `cors.php`
- ✅ Headers definidos apenas após todas as configurações estarem prontas

### 2. **Gerenciamento de Output Buffer**
- ✅ `while (ob_get_level() > 0) { ob_end_clean(); }` para limpar todos os níveis
- ✅ Buffer reiniciado após limpeza
- ✅ Verificação de `headers_sent()` antes de definir headers

### 3. **Tratamento de Erros Fatais**
- ✅ Adicionado `E_RECOVERABLE_ERROR` aos tipos de erro capturados
- ✅ Handler de shutdown melhorado para lidar com headers já enviados
- ✅ Todos os erros agora retornam JSON

### 4. **Script de Teste Simplificado**
- ✅ Criado `test-get-users-simples.php` para isolar o problema

## 🧪 Como Testar

### Teste 1: Script Simplificado
Acesse no navegador:
```
https://novaedubncc.com.br/api/test-get-users-simples.php
```

**Resultado esperado:**
- Se funcionar: JSON com lista de usuários
- Se não funcionar: JSON com erro detalhado

### Teste 2: Endpoint Real
Acesse via console do navegador ou Postman:
```
GET https://novaedubncc.com.br/api/users/
```

**Resultado esperado:**
- Status 200
- Content-Type: application/json
- JSON com `{error: false, users: [...]}`

## 🔍 Diagnóstico

Se o erro 500 persistir, execute o script de teste e verifique:

1. **Se `test-get-users-simples.php` funciona:**
   - ✅ Funciona → Problema está no `.htaccess` ou roteamento
   - ❌ Não funciona → Problema está na conexão/autenticação

2. **Verificar logs do servidor:**
   - Procure por erros PHP nos logs do Apache/PHP
   - Verifique se há erros de sintaxe ou warnings

3. **Verificar permissões:**
   - Certifique-se de que a sessão está sendo mantida
   - Verifique se o usuário root está autenticado

## 📋 Arquivos Modificados

1. **api/users/index.php**
   - Ordem de inclusão de arquivos corrigida
   - Gerenciamento de buffer melhorado
   - Handler de erros fatais aprimorado

2. **api/test-get-users-simples.php** (NOVO)
   - Script de teste simplificado para diagnóstico

## ⚠️ Possíveis Causas do Erro 500

1. **Erro de sintaxe PHP** - Verifique logs do servidor
2. **Problema de conexão com banco** - Verifique `database.php`
3. **Sessão não mantida** - Verifique cookies/sessão
4. **Problema com `.htaccess`** - Verifique roteamento
5. **Output antes dos headers** - Já corrigido

## 🚀 Próximos Passos

1. **Fazer upload** dos arquivos atualizados
2. **Testar** o script simplificado primeiro
3. **Testar** o endpoint real
4. **Verificar logs** se o problema persistir

## 📝 Notas Importantes

- O erro 500 com HTML geralmente indica um erro fatal não capturado
- Os handlers de erro agora capturam mais tipos de erro
- O script de teste simplificado ajuda a isolar o problema
- Sempre verifique os logs do servidor para mais detalhes
