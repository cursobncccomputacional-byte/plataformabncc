# 🔧 Configurar API Groq - Guia Rápido

## ⚠️ IMPORTANTE

A chave da API do Groq **NÃO** deve ser commitada no código por questões de segurança.

## 📝 Configuração Local (Desenvolvimento)

1. **Crie um arquivo `.env` na raiz do projeto** (mesmo nível do `package.json`)

2. **Adicione a seguinte linha (use a chave fornecida):**
```env
VITE_GROQ_API_KEY=sua_chave_groq_aqui
```

3. **Reinicie o servidor de desenvolvimento:**
```bash
npm run dev
```

## 🚀 Configuração no Vercel (Produção)

1. Acesse o dashboard do Vercel: https://vercel.com/dashboard
2. Selecione o projeto "plataforma-bncc"
3. **Na barra superior, clique em "Settings"**
4. **No menu lateral esquerdo, clique em "Environment Variables"**
5. Clique em **Add New**
6. Configure:
   - **Name**: `VITE_GROQ_API_KEY`
   - **Value**: `sua_chave_groq_aqui` (use a chave fornecida anteriormente)
   - **Environment**: Production, Preview, Development (marque todos)
7. Clique em **Save**
8. **Para aplicar as mudanças, faça um novo deploy:**
   - Vá em **Deployments** na barra superior
   - Clique nos três pontos (⋯) do último deployment
   - Selecione **"Redeploy"**
   - Ou faça um novo commit no Git para acionar deploy automático

## ✅ Verificar se está funcionando

Após configurar:
1. Abra o console do navegador (F12)
2. Procure por: `✅ Groq API configurada e pronta para uso.`
3. No assistente, você verá o badge "IA" verde quando a API estiver ativa
4. O status mostrará "Online" em vez de "Offline"

## 🔍 Troubleshooting

### Assistente mostra "Offline"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se a variável está escrita corretamente: `VITE_GROQ_API_KEY`
- Reinicie o servidor após criar/editar o `.env`
- No Vercel, verifique se a variável está configurada e faça novo deploy

### Erro de CORS ou Network
- A API do Groq pode ter restrições de CORS
- Verifique se está usando HTTPS em produção
- Verifique a conexão com a internet

---

**⚠️ IMPORTANTE**: Use a chave da API do Groq fornecida. Não commite a chave no repositório!

