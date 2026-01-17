# 🤖 Integração Groq AI - Assistente BNCC

## ✅ **Implementação Completa!**

A plataforma agora utiliza a API do Groq para fornecer respostas inteligentes e contextuais no Assistente de IA.

---

## 🔧 **Configuração**

### **Variável de Ambiente (Recomendado)**

Para maior segurança, configure a chave da API como variável de ambiente:

1. Crie um arquivo `.env` na raiz do projeto:
```env
VITE_GROQ_API_KEY=sua_chave_aqui
```

**⚠️ IMPORTANTE**: A chave da API deve ser configurada via variável de ambiente. Não commite a chave no código!

2. O arquivo `.env` já está no `.gitignore` e não será commitado.

### **Fallback**

Se a variável de ambiente não estiver configurada, o sistema usa a chave fornecida diretamente no código (apenas para desenvolvimento).

---

## 🎯 **Funcionalidades**

### **Modelo Utilizado**
- **Modelo**: `llama-3.1-70b-versatile`
- **Características**: Rápido, eficiente e otimizado para respostas educacionais

### **Sistema de Prompt**
O assistente é configurado com um prompt especializado em:
- BNCC Computacional
- Pensamento Computacional
- Atividades educacionais
- Recursos pedagógicos
- Implementação em sala de aula

### **Contexto de Conversa**
- Mantém histórico das últimas 6 mensagens
- Respostas contextuais baseadas na conversa
- Memória de curto prazo para melhor continuidade

### **Fallback Inteligente**
- Se a API falhar, usa respostas pré-definidas
- Garante que o assistente sempre responda
- Logs de erro para debug

---

## 📊 **Como Funciona**

1. **Usuário faz pergunta** → Assistente recebe mensagem
2. **Prepara contexto** → Últimas 6 mensagens + prompt do sistema
3. **Chama API Groq** → Envia requisição com contexto
4. **Processa resposta** → Formata e exibe para o usuário
5. **Fallback** → Se erro, usa respostas pré-definidas

---

## 🔒 **Segurança**

- ✅ Chave API não é exposta no código (usa variável de ambiente)
- ✅ `.env` está no `.gitignore`
- ✅ Requisições HTTPS para API do Groq
- ✅ Tratamento de erros robusto

---

## 🚀 **Deploy**

### **Vercel/Netlify**

Configure a variável de ambiente no painel:
1. Acesse Settings → Environment Variables
2. Adicione: `VITE_GROQ_API_KEY`
3. Valor: Sua chave da API do Groq
4. Faça novo deploy

### **Outros Provedores**

Configure `VITE_GROQ_API_KEY` nas variáveis de ambiente do seu provedor.

---

## 📝 **Arquivos Modificados**

- ✅ `src/services/groqService.ts` - Novo serviço de integração
- ✅ `src/components/AIAssistant.tsx` - Atualizado para usar Groq
- ✅ `.env.example` - Template de configuração

---

## 🎓 **Benefícios**

1. **Respostas Inteligentes**: IA generativa com contexto
2. **Conversas Naturais**: Mantém contexto da conversa
3. **Especializado**: Prompt focado em BNCC Computacional
4. **Confiável**: Fallback garante funcionamento sempre
5. **Rápido**: Groq é otimizado para velocidade

---

## 🔍 **Testando**

1. Acesse a plataforma como professor
2. Clique no botão flutuante do Assistente de IA
3. Faça perguntas sobre:
   - Pensamento computacional
   - Atividades educacionais
   - BNCC Computacional
   - Implementação pedagógica

---

**Status**: ✅ Pronto para uso!

