# 🔒 Como Corrigir SSL "Inseguro" na Hostinger

## ⚠️ Problema

O navegador mostra **"Inseguro"** ao lado da URL, indicando problema com certificado SSL.

## ✅ Solução Rápida

### Passo 1: Instalar/Ativar SSL no Painel Hostinger

1. **Acessar hPanel** da Hostinger
2. **Ir em "SSL"** (no menu lateral)
3. **Selecionar domínio**: `novaedubncc.com.br`
4. **Clicar em "Instalar SSL"** ou **"Ativar SSL"**
5. **Aguardar** alguns minutos para ativação

### Passo 2: Verificar Certificado

**Após instalar:**
1. Acessar `https://www.novaedubncc.com.br`
2. Clicar no ícone de cadeado na barra de endereço
3. Verificar se mostra "Conexão segura"

### Passo 3: Upload do .htaccess Atualizado

**Arquivo**: `dist/.htaccess` (já foi atualizado)

**O que foi adicionado:**
- ✅ Redirecionamento automático HTTP → HTTPS
- ✅ Headers de segurança
- ✅ Proteção contra clickjacking e XSS

**Upload:**
- Fazer upload do arquivo `dist/.htaccess` para o servidor
- Deve estar na raiz (mesmo nível que `index.html`)

## 🔍 Verificações Adicionais

### Verificar se SSL está Ativo

**Teste 1: Acessar via HTTP**
```
http://www.novaedubncc.com.br
```

**Deve redirecionar automaticamente para:**
```
https://www.novaedubncc.com.br
```

**Se não redirecionar:**
- Verificar se `.htaccess` foi enviado corretamente
- Verificar se `mod_rewrite` está ativo no servidor

### Verificar Console do Navegador

**Abrir Console (F12) e verificar:**

1. **Erros de Mixed Content:**
   - Se houver, significa que há recursos HTTP na página
   - Corrigir URLs para usar HTTPS

2. **Erros de certificado:**
   - Se houver, o certificado pode estar inválido
   - Verificar no painel da Hostinger

## 📋 Checklist

- [ ] SSL instalado/ativado no painel Hostinger
- [ ] Certificado válido (não expirado)
- [ ] `.htaccess` atualizado enviado para servidor
- [ ] HTTP redireciona para HTTPS automaticamente
- [ ] Console não mostra erros de Mixed Content
- [ ] Todos os recursos usam HTTPS

## 🎯 Se Ainda Estiver "Inseguro"

### Causa 1: Certificado Não Instalado

**Solução:**
- Instalar certificado SSL no painel Hostinger
- Hostinger oferece SSL gratuito (Let's Encrypt)

### Causa 2: Certificado Expirado

**Solução:**
- Renovar certificado no painel Hostinger
- Geralmente renova automaticamente

### Causa 3: Mixed Content (HTTP + HTTPS)

**Solução:**
- Verificar console do navegador
- Identificar recursos HTTP
- Corrigir URLs para usar HTTPS

### Causa 4: .htaccess Não Funcionando

**Solução:**
- Verificar se arquivo foi enviado
- Verificar permissões (644)
- Verificar se `mod_rewrite` está ativo

## 💡 Dica

O aviso "Inseguro" geralmente desaparece após:
1. ✅ Instalar/ativar SSL no painel
2. ✅ Aguardar alguns minutos para propagação
3. ✅ Limpar cache do navegador (Ctrl+Shift+R)

---

**⚠️ Importante**: O `.htaccess` já foi atualizado com regras de HTTPS. Basta fazer upload e ativar SSL no painel da Hostinger!
