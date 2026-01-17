# 🔒 Como Reinstalar SSL na Hostinger

## 🎯 Objetivo

Reinstalar o certificado SSL para garantir que inclui ambos os domínios (`novaedubncc.com.br` e `www.novaedubncc.com.br`).

## 📋 Passo a Passo

### Passo 1: Acessar Configurações SSL

1. **Login no hPanel** da Hostinger
2. **Ir em**: **Sites** → **novaedubncc.com.br**
3. **Clicar em**: **Segurança** → **SSL**

### Passo 2: Desinstalar Certificado Atual (se necessário)

**Se houver opção de desinstalar:**
1. Clicar em **"Desinstalar"** ou **"Remover"**
2. Confirmar ação
3. Aguardar alguns segundos

**Se não houver opção:**
- Pular para Passo 3 (instalar novo)

### Passo 3: Instalar Novo Certificado

1. **Clicar em**: **"Instalar SSL"** ou **"Ativar SSL"**
2. **Selecionar tipo**:
   - **Lifetime SSL** (se disponível)
   - **Let's Encrypt** (gratuito, renovação automática)
3. **Verificar domínios**:
   - ✅ `novaedubncc.com.br`
   - ✅ `www.novaedubncc.com.br`
4. **Clicar em**: **"Instalar"** ou **"Ativar"**

### Passo 4: Aguardar Propagação

**Tempo estimado:** 5-10 minutos

**O que acontece:**
- Certificado é gerado/instalado
- Configuração é aplicada ao servidor
- DNS propaga as mudanças

**Não fazer durante este tempo:**
- ❌ Não testar imediatamente
- ❌ Não reinstalar novamente
- ✅ Aguardar o tempo necessário

### Passo 5: Verificar Instalação

**No painel:**
- Status deve mostrar: **"Ativo"** ✅
- Tipo: **"Lifetime SSL"** ou **"Let's Encrypt"**

### Passo 6: Testar no Navegador

**Após aguardar propagação:**
1. **Limpar cache** do navegador (Ctrl+Shift+Delete)
2. **Fechar e reabrir** navegador
3. **Acessar**: `https://www.novaedubncc.com.br`
4. **Verificar**: Cadeado verde na barra de endereço

## ⚠️ Se Ainda Der Erro

### Opção 1: Verificar Domínios do Certificado

**No painel Hostinger:**
- Verificar se certificado inclui `www.novaedubncc.com.br`
- Se não incluir, pode ser necessário configurar redirecionamento

### Opção 2: Configurar Redirecionamento

**Se certificado é apenas para `novaedubncc.com.br`:**

**No painel Hostinger:**
1. Ir em **Sites** → **novaedubncc.com.br** → **Redirecionamentos**
2. Criar redirecionamento:
   - **De**: `www.novaedubncc.com.br`
   - **Para**: `novaedubncc.com.br`
   - **Tipo**: 301 (Permanente)

**Ou vice-versa** (se certificado é para `www`)

### Opção 3: Contatar Suporte Hostinger

**Se nada funcionar:**
1. Abrir ticket de suporte
2. Informar:
   - Domínio: `www.novaedubncc.com.br`
   - Problema: `NET::ERR_CERT_COMMON_NAME_INVALID`
   - Certificado instalado mas não funciona
   - Solicitar verificação de configuração

## 📋 Checklist

- [ ] Certificado desinstalado (se necessário)
- [ ] Novo certificado instalado
- [ ] Aguardado propagação (5-10 minutos)
- [ ] Cache do navegador limpo
- [ ] Testado no navegador
- [ ] Cadeado verde aparece?

## 💡 Dica

**Lifetime SSL** da Hostinger geralmente inclui ambos os domínios automaticamente. Se o problema persistir após reinstalar, pode ser necessário configurar redirecionamento ou contatar suporte.

---

**✅ Após reinstalar, aguarde alguns minutos e teste novamente!**
