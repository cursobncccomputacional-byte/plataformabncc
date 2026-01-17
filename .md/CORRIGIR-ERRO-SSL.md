# 🔒 Corrigir Erro SSL: NET::ERR_CERT_COMMON_NAME_INVALID

## ❌ Problema Identificado

**Erro no navegador:**
```
NET::ERR_CERT_COMMON_NAME_INVALID
A sua ligação não é privada
```

**Causa:**
O certificado SSL não corresponde ao domínio acessado, ou há configurações no `.htaccess` interferindo.

## ✅ Solução Aplicada

### 1. Removidas Regras de HTTPS do .htaccess

**O que foi removido:**
- ❌ Redirecionamento forçado HTTP → HTTPS
- ❌ Headers `Strict-Transport-Security`
- ❌ Outros headers de segurança que podem interferir

**Arquivo atualizado:** `dist/.htaccess`

**Agora contém apenas:**
- ✅ Regras de rewrite para SPA
- ✅ Exclusão da pasta `/api/`
- ✅ MIME Types
- ✅ Compressão GZIP

### 2. Próximos Passos

**Passo 1: Upload do .htaccess Corrigido**

**Via FileZilla:**
1. Conectar ao servidor Hostinger
2. Navegar até `/public_html/`
3. Fazer upload de `dist/.htaccess`
4. Substituir arquivo existente
5. Verificar permissão: 644

**Passo 2: Verificar Certificado SSL no Painel**

**No painel Hostinger:**
1. Acessar hPanel
2. Ir em "SSL"
3. Verificar domínio: `novaedubncc.com.br`
4. Verificar se certificado está:
   - ✅ Instalado
   - ✅ Ativo
   - ✅ Válido (não expirado)
   - ✅ Para o domínio correto (`www.novaedubncc.com.br` ou `novaedubncc.com.br`)

**Passo 3: Reinstalar/Renovar Certificado (se necessário)**

**Se o certificado estiver com problema:**
1. No painel Hostinger → SSL
2. Desinstalar certificado atual
3. Instalar novamente (Let's Encrypt gratuito)
4. Aguardar alguns minutos para propagação

**Passo 4: Limpar Cache do Navegador**

**Após corrigir:**
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Ou usar modo anônimo (Ctrl+Shift+N)
3. Testar novamente

## 🔍 Verificações Adicionais

### Verificar Certificado Diretamente

**Via Terminal (se tiver acesso):**
```bash
openssl s_client -connect www.novaedubncc.com.br:443 -servername www.novaedubncc.com.br
```

**Verificar:**
- Common Name (CN) deve ser `www.novaedubncc.com.br` ou `novaedubncc.com.br`
- Subject Alternative Names (SAN) devem incluir ambos os domínios

### Verificar se Há Redirecionamentos

**Testar:**
```
http://www.novaedubncc.com.br
http://novaedubncc.com.br
https://www.novaedubncc.com.br
https://novaedubncc.com.br
```

**Todos devem funcionar** (sem erro de certificado)

## ⚠️ Possíveis Causas do Erro

### Causa 1: Certificado para Domínio Diferente

**Sintoma:** Certificado foi emitido para outro domínio

**Solução:** Reinstalar certificado para o domínio correto

### Causa 2: Certificado Expirado

**Sintoma:** Certificado passou da data de validade

**Solução:** Renovar certificado no painel

### Causa 3: Certificado Não Inclui www

**Sintoma:** Certificado é para `novaedubncc.com.br` mas acessa `www.novaedubncc.com.br`

**Solução:** Certificado deve incluir ambos (SAN) ou usar redirecionamento

### Causa 4: Headers Interferindo

**Sintoma:** Headers de segurança causando conflito

**Solução:** ✅ JÁ REMOVIDO do `.htaccess`

## 📋 Checklist

- [ ] `.htaccess` atualizado (sem regras de HTTPS)
- [ ] Upload do `.htaccess` feito
- [ ] Certificado SSL verificado no painel
- [ ] Certificado reinstalado (se necessário)
- [ ] Cache do navegador limpo
- [ ] Teste em modo anônimo

## 🎯 Teste Após Correção

**Acessar:**
```
https://www.novaedubncc.com.br
```

**Resultado esperado:**
- ✅ Cadeado verde na barra de endereço
- ✅ Sem aviso "Inseguro"
- ✅ Site carrega normalmente

---

**💡 Importante**: O `.htaccess` foi simplificado e não deve mais interferir no SSL. O problema provavelmente é do certificado no painel da Hostinger. Verifique e reinstale se necessário!
