# 🔧 Solução: Erro "Failed to fetch" ao Acessar de Outra Cidade

## ❌ Problema

**Sintoma:**
- Login funciona no seu computador local
- Login **não funciona** em outra cidade (ex: São Paulo)
- Mensagem de erro: **"Failed to fetch"**

**Causa:**
O erro "Failed to fetch" indica que o navegador **não conseguiu estabelecer conexão** com o servidor da API. Isso geralmente acontece por:

1. **Problemas de rede/firewall** (mais comum)
2. **URL da API incorreta ou inacessível**
3. **Problemas de DNS**
4. **Certificado SSL inválido**
5. **CORS bloqueando requisições**

## ✅ Correções Aplicadas

### 1. Melhor Tratamento de Erros

**Arquivo**: `src/services/apiService.ts`

**Melhorias:**
- ✅ Captura específica de erros de rede
- ✅ Mensagens de erro mais claras e úteis
- ✅ Diagnóstico automático do tipo de problema
- ✅ Sugestões de solução baseadas no erro

**Novo método de diagnóstico:**
```typescript
await apiService.diagnoseConnection();
```

### 2. Mensagens de Erro Melhoradas

**Arquivo**: `src/pages/Login.tsx`

**Melhorias:**
- ✅ Mensagens mais específicas para problemas de rede
- ✅ Orientações sobre firewall/VPN
- ✅ Instruções claras para o usuário

## 🔍 Diagnóstico

### Passo 1: Verificar URL da API

A URL correta da API é:
```
https://novaedubncc.com.br/api
```

**Verificar no código:**
- Arquivo: `src/services/apiService.ts` (linha 8)
- Deve estar: `https://novaedubncc.com.br/api` (sem www)

### Passo 2: Testar Acessibilidade da API

**No computador do seu chefe (em São Paulo):**

1. **Abrir o navegador**
2. **Acessar diretamente:**
   ```
   https://novaedubncc.com.br/api/auth/me
   ```
3. **Resultados possíveis:**

   **✅ Se retornar JSON (mesmo com erro 401):**
   - API está acessível
   - Problema pode ser CORS ou configuração do frontend

   **❌ Se der erro de conexão/timeout:**
   - API não está acessível de fora
   - Pode ser firewall, DNS ou servidor offline

   **❌ Se der erro de certificado SSL:**
   - Certificado SSL inválido ou expirado
   - Precisa renovar certificado

### Passo 3: Verificar CORS

**Arquivo**: `api/config/cors.php`

**Verificar se está permitindo:**
- ✅ `https://novaedubncc.com.br`
- ✅ `https://www.novaedubncc.com.br`

## 🛠️ Soluções por Tipo de Problema

### Problema 1: Firewall/Rede Corporativa

**Sintomas:**
- Funciona na sua rede local
- Não funciona em rede corporativa/VPN
- Erro: "Failed to fetch" ou timeout

**Soluções:**
1. **Desativar VPN** (se estiver usando)
2. **Trocar de rede** (usar 4G do celular via hotspot)
3. **Verificar firewall corporativo** (pode estar bloqueando porta 443)
4. **Contatar administrador de rede** para liberar acesso

### Problema 2: API Não Acessível de Fora

**Sintomas:**
- API só funciona localmente
- Não responde de outras cidades
- Erro: "Failed to fetch" ou "Connection refused"

**Soluções:**
1. **Verificar se servidor está online:**
   ```bash
   ping novaedubncc.com.br
   ```

2. **Verificar se API está em servidor público:**
   - API deve estar em servidor com IP público
   - Não pode estar em servidor local/privado

3. **Verificar configuração do servidor:**
   - Firewall do servidor pode estar bloqueando
   - Porta 443 (HTTPS) deve estar aberta

### Problema 3: Certificado SSL Inválido

**Sintomas:**
- Erro: "ERR_CERT_COMMON_NAME_INVALID"
- Navegador mostra aviso de certificado inválido

**Soluções:**
1. **Verificar certificado SSL:**
   - Acessar: https://www.ssllabs.com/ssltest/
   - Digitar: `novaedubncc.com.br`
   - Verificar se certificado está válido

2. **Renovar certificado** (se necessário):
   - No painel Hostinger
   - Reinstalar certificado SSL

### Problema 4: DNS Não Resolvendo

**Sintomas:**
- Erro: "ERR_NAME_NOT_RESOLVED"
- Domínio não é encontrado

**Soluções:**
1. **Verificar DNS:**
   ```bash
   nslookup novaedubncc.com.br
   ```

2. **Trocar DNS** (no computador):
   - Usar DNS do Google: `8.8.8.8` e `8.8.4.4`
   - Ou DNS da Cloudflare: `1.1.1.1` e `1.0.0.1`

## 📋 Checklist de Verificação

### No Servidor:
- [ ] API está em `/api/` (raiz do servidor)
- [ ] Arquivo `api/auth/login.php` existe
- [ ] CORS está configurado corretamente
- [ ] Certificado SSL está válido
- [ ] Servidor está online e acessível

### No Frontend:
- [ ] URL da API está correta: `https://novaedubncc.com.br/api`
- [ ] Build mais recente foi feito e enviado ao servidor
- [ ] Variável `VITE_API_URL` está configurada (se usar .env)

### No Computador do Usuário (São Paulo):
- [ ] Internet está funcionando
- [ ] Não há VPN ativa (ou VPN permite acesso)
- [ ] Firewall não está bloqueando
- [ ] Navegador não está bloqueando (verificar console F12)

## 🚀 Próximos Passos

### 1. Rebuild do Frontend

Após as correções, fazer rebuild:

```bash
npm run build
```

### 2. Upload para Servidor

- Upload da pasta `dist/` para o servidor
- Garantir que API está em `/api/` no servidor

### 3. Testar

**Teste 1: API direto**
```
https://novaedubncc.com.br/api/auth/me
```

**Teste 2: Login no frontend**
- Acessar: `https://novaedubncc.com.br`
- Tentar fazer login
- Verificar console (F12) para erros detalhados

## 💡 Dica Importante

**Se o problema persistir:**

1. **Pedir para o seu chefe:**
   - Abrir console do navegador (F12)
   - Tentar fazer login
   - Copiar **erro completo** do console
   - Enviar print ou texto do erro

2. **Com o erro completo, será possível:**
   - Identificar exatamente o problema
   - Dar solução específica
   - Resolver definitivamente

## 📞 Informações para Diagnóstico

**Quando pedir ajuda, incluir:**
- ✅ Erro completo do console (F12)
- ✅ URL que está tentando acessar
- ✅ Tipo de rede (corporativa, doméstica, 4G)
- ✅ Se está usando VPN
- ✅ Resultado do teste direto da API (`/api/auth/me`)

---

**Última atualização:** 19/01/2026
**Status:** Correções aplicadas - Aguardando teste em produção
