# 🔧 Melhorias para Autenticação em Diferentes Redes e Computadores

## 📋 Resumo das Melhorias Implementadas

Este documento descreve as melhorias implementadas para resolver problemas de autenticação quando a aplicação é acessada de diferentes computadores e redes.

---

## ✅ 1. Detecção Automática da URL da API

### Problema Anterior
- URL da API estava hardcoded como `https://novaedubncc.com.br/api`
- Não funcionava em desenvolvimento local
- Não funcionava em outras redes ou IPs diferentes

### Solução Implementada
**Arquivo**: `src/services/apiService.ts`

A função `detectApiBaseUrl()` agora detecta automaticamente a URL base da API:

1. **Prioridade 1**: Variável de ambiente `VITE_API_URL` (para override manual)
2. **Prioridade 2**: Detecção baseada no host atual:
   - **Desenvolvimento local**: Usa `http://localhost:PORT/api` ou `http://127.0.0.1:PORT/api`
   - **Produção conhecida**: Usa `https://novaedubncc.com.br/api` (sem www)
   - **Outros domínios**: Usa o mesmo domínio/protocolo da aplicação atual

### Benefícios
- ✅ Funciona automaticamente em qualquer rede
- ✅ Não precisa recompilar para mudar de ambiente
- ✅ Suporta desenvolvimento local e produção
- ✅ Funciona com IPs locais e diferentes portas

---

## ✅ 2. Melhoria na Configuração CORS

### Problema Anterior
- CORS só aceitava origens específicas na lista
- Não funcionava para IPs locais ou outras redes
- Conflito entre `Access-Control-Allow-Origin: *` e `Access-Control-Allow-Credentials: true`

### Solução Implementada
**Arquivo**: `api/config/cors.php`

O CORS agora aceita dinamicamente diferentes origens:

1. **Origens conhecidas**: Lista de domínios confiáveis (produção, localhost)
2. **Origens dinâmicas**: 
   - Aceita localhost, 127.0.0.1 e IPs privados (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
   - Aceita qualquer origem HTTPS (produção)
   - Fallback para `*` quando necessário (sem credentials)

### Benefícios
- ✅ Funciona em qualquer rede local
- ✅ Suporta desenvolvimento com diferentes IPs
- ✅ Mantém segurança para produção
- ✅ Compatível com diferentes configurações de rede

---

## ✅ 3. Retry Automático e Timeout

### Problema Anterior
- Requisições falhavam imediatamente em caso de problemas temporários de rede
- Sem timeout, requisições podiam ficar travadas indefinidamente

### Solução Implementada
**Arquivo**: `src/services/apiService.ts`

O método `request()` agora inclui:

1. **Retry automático**: Até 2 tentativas adicionais (total de 3 tentativas)
2. **Backoff progressivo**: Aguarda 1s, 2s entre tentativas
3. **Timeout**: 10 segundos por tentativa
4. **AbortController**: Cancela requisições que excedem o timeout

### Benefícios
- ✅ Resolve problemas temporários de rede automaticamente
- ✅ Evita requisições travadas
- ✅ Melhora experiência do usuário em redes instáveis

---

## ✅ 4. Tratamento de Erros Melhorado

### Problema Anterior
- Mensagens de erro genéricas
- Difícil diagnosticar problemas de rede/CORS

### Solução Implementada
**Arquivos**: 
- `src/services/apiService.ts` (método `handleNetworkError`)
- `src/pages/Login.tsx` (melhor tratamento de erros)

Melhorias:

1. **Mensagens específicas** baseadas no tipo de erro:
   - NetworkError: Dicas sobre firewall, VPN, conexão
   - CORS: Informações sobre origem e configuração
   - Timeout: Sugestões sobre servidor sobrecarregado

2. **Informações de debug**:
   - URL tentada
   - Origem atual
   - Base URL da API

3. **Dicas de solução** no Login:
   - Verificar conexão
   - Desativar VPN/proxy
   - Verificar firewall
   - Contatar suporte de TI

### Benefícios
- ✅ Usuário entende melhor o problema
- ✅ Facilita diagnóstico de problemas
- ✅ Reduz chamadas de suporte

---

## ✅ 5. Diagnóstico Automático de Conectividade

### Problema Anterior
- Sem forma de verificar se a API está acessível antes de tentar login
- Erros só apareciam após tentar fazer login

### Solução Implementada
**Arquivo**: `src/services/apiService.ts`

Novos métodos:

1. **`checkApiAvailability()`**: Verifica rapidamente se a API está acessível
2. **`diagnoseConnection()`**: Diagnóstico completo com:
   - Status da conexão
   - Detecção de problemas CORS
   - Detecção de problemas de rede
   - Detecção de timeout
   - Sugestões específicas
3. **`testConnectionBeforeLogin()`**: Testa conectividade antes do login

### Benefícios
- ✅ Detecta problemas antes de tentar login
- ✅ Fornece informações detalhadas para diagnóstico
- ✅ Facilita troubleshooting

---

## 📝 Como Usar

### Desenvolvimento Local

1. **Sem configuração adicional necessária**:
   - A URL será detectada automaticamente como `http://localhost:5173/api` (ou a porta do Vite)
   - CORS aceitará localhost automaticamente

2. **Para usar porta diferente**:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

### Produção

1. **Automático**:
   - Se acessar via `https://novaedubncc.com.br`, a API será `https://novaedubncc.com.br/api`
   - CORS aceitará automaticamente

2. **Para override manual**:
   ```env
   VITE_API_URL=https://outro-dominio.com/api
   ```

### Outras Redes

- **IP local**: Se acessar via `http://192.168.1.100:3000`, a API será `http://192.168.1.100:3000/api`
- **CORS**: Aceitará automaticamente IPs privados
- **Retry**: Tentará novamente automaticamente em caso de falha temporária

---

## 🔍 Debug

### Logs no Console (Desenvolvimento)

Quando em modo desenvolvimento, o `apiService` loga:
```javascript
{
  baseUrl: "http://localhost:5173/api",
  currentHost: "localhost",
  currentOrigin: "http://localhost:5173",
  envVar: "não definida"
}
```

### Diagnóstico Manual

No console do navegador:
```javascript
import { apiService } from './services/apiService';

// Verificar disponibilidade
await apiService.checkApiAvailability();

// Diagnóstico completo
await apiService.diagnoseConnection();
```

---

## ⚠️ Notas Importantes

1. **CORS com Credentials**: 
   - Quando usa `credentials: 'include'`, o CORS precisa de origem específica
   - A solução detecta a origem e a aceita dinamicamente
   - Para IPs privados e localhost, funciona automaticamente

2. **Timeout**:
   - Timeout de 10 segundos por tentativa
   - Total de até 30 segundos (3 tentativas × 10s)
   - Ajustável no código se necessário

3. **Retry**:
   - Apenas para erros de rede (não para erros 4xx/5xx)
   - Backoff progressivo evita sobrecarregar o servidor

---

## 🚀 Próximos Passos (Opcional)

1. **Cache de URL da API**: Salvar URL detectada no localStorage
2. **UI de Diagnóstico**: Componente visual para mostrar status da conexão
3. **Notificação de Problemas**: Alertar usuário quando API não estiver acessível
4. **Fallback de API**: Tentar múltiplas URLs de API em caso de falha

---

## ✅ Checklist de Testes

- [x] Funciona em localhost (desenvolvimento)
- [x] Funciona em produção (novaedubncc.com.br)
- [x] Funciona com IP local (192.168.x.x)
- [x] Funciona em diferentes portas
- [x] Retry funciona em caso de falha temporária
- [x] Timeout funciona corretamente
- [x] CORS aceita diferentes origens
- [x] Mensagens de erro são claras
- [x] Diagnóstico fornece informações úteis

---

**Data**: 2024
**Versão**: 1.0
