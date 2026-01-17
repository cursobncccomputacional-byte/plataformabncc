# 🔒 Solução: Erro SSL NET::ERR_CERT_COMMON_NAME_INVALID

## ✅ Status do Certificado

**No painel Hostinger:**
- ✅ Certificado instalado: `Lifetime SSL`
- ✅ Status: `Ativo`
- ✅ Expira em: `Nunca`

**Mas o navegador mostra:**
- ❌ `NET::ERR_CERT_COMMON_NAME_INVALID`
- ❌ "A sua ligação não é privada"

## 🔍 Causa do Problema

O erro indica que o certificado não corresponde ao domínio acessado. Possíveis causas:

1. **Certificado para domínio diferente**
   - Certificado para `novaedubncc.com.br` mas acessa `www.novaedubncc.com.br`
   - Ou vice-versa

2. **Certificado não inclui ambos os domínios**
   - Precisa incluir tanto `novaedubncc.com.br` quanto `www.novaedubncc.com.br`

3. **Problema de propagação**
   - Certificado recém-instalado ainda não propagou

## ✅ Soluções

### Solução 1: Verificar Domínios do Certificado

**No painel Hostinger:**
1. Acessar: **Sites** → **novaedubncc.com.br** → **Segurança** → **SSL**
2. Verificar se o certificado inclui:
   - ✅ `novaedubncc.com.br`
   - ✅ `www.novaedubncc.com.br`

**Se não incluir ambos:**
- Reinstalar certificado para incluir ambos os domínios

### Solução 2: Reinstalar Certificado SSL

**No painel Hostinger:**
1. Acessar: **Sites** → **novaedubncc.com.br** → **Segurança** → **SSL**
2. Clicar em **"Desinstalar"** ou **"Remover"** (se houver)
3. Clicar em **"Instalar SSL"** ou **"Ativar SSL"**
4. Selecionar **"Lifetime SSL"** ou **"Let's Encrypt"**
5. **Aguardar 5-10 minutos** para propagação

### Solução 3: Verificar Redirecionamento

**Testar ambos os domínios:**
```
http://novaedubncc.com.br
http://www.novaedubncc.com.br
https://novaedubncc.com.br
https://www.novaedubncc.com.br
```

**Todos devem funcionar** sem erro de certificado.

### Solução 4: Limpar Cache e Testar

**Após reinstalar:**
1. **Limpar cache do navegador** (Ctrl+Shift+Delete)
2. **Fechar e reabrir navegador**
3. **Testar em modo anônimo** (Ctrl+Shift+N)
4. **Aguardar alguns minutos** (propagação DNS)

## 🔍 Verificação Adicional

### Verificar Certificado via Terminal (Opcional)

**Se tiver acesso SSH:**
```bash
openssl s_client -connect www.novaedubncc.com.br:443 -servername www.novaedubncc.com.br | grep -A 2 "Subject:"
```

**Verificar:**
- Common Name (CN) deve ser `www.novaedubncc.com.br` ou `novaedubncc.com.br`
- Subject Alternative Names (SAN) devem incluir ambos

### Verificar no Navegador

**Após acessar o site:**
1. Clicar no **ícone de cadeado** na barra de endereço
2. Clicar em **"Certificado"** ou **"Connection is secure"**
3. Verificar **"Issued to"** (Emitido para)
4. Deve mostrar `www.novaedubncc.com.br` ou `novaedubncc.com.br`

## 📋 Checklist

- [ ] Certificado verificado no painel (inclui ambos os domínios?)
- [ ] Certificado reinstalado (se necessário)
- [ ] Aguardado propagação (5-10 minutos)
- [ ] Cache do navegador limpo
- [ ] Testado em modo anônimo
- [ ] Testado ambos os domínios (com e sem www)

## 🎯 Próximo Passo

**Recomendação:**
1. **Reinstalar certificado** no painel Hostinger
2. **Aguardar 5-10 minutos**
3. **Limpar cache** do navegador
4. **Testar novamente**

---

**💡 Importante**: O certificado está instalado, mas pode não estar configurado para o domínio correto. Reinstalar geralmente resolve o problema!
