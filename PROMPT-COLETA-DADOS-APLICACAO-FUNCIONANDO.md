# 📋 Prompt para Coletar Dados da Aplicação que Funciona

## 🎯 Objetivo

Coletar informações sobre a aplicação que funciona perfeitamente para comparar com esta aplicação e identificar diferenças que podem estar causando o problema de acesso.

---

## 📝 PROMPT PARA ENVIAR NO CURSOR (Outra Aplicação)

```
Preciso coletar informações sobre a configuração da API e requisições HTTP desta aplicação para comparar com outra aplicação que está tendo problemas de acesso.

Por favor, me forneça as seguintes informações:

1. **Configuração da API:**
   - Qual é a URL base da API? (ex: https://exemplo.com/api)
   - Onde está configurada? (arquivo .env, código, etc.)
   - A API é própria ou externa? (Google Drive, etc.)

2. **Como as requisições são feitas:**
   - Mostre o código do serviço/arquivo que faz requisições HTTP
   - Quais headers são enviados? (Content-Type, Authorization, etc.)
   - Usa `credentials: 'include'` ou `credentials: 'same-origin'`?
   - Usa fetch, axios, ou outra biblioteca?

3. **Configuração de CORS (se API própria):**
   - Mostre o arquivo de configuração CORS (se houver)
   - Quais origens estão permitidas?
   - Usa `Access-Control-Allow-Credentials: true`?
   - Permite headers customizados?

4. **Método de Autenticação:**
   - Como a autenticação funciona? (cookies, tokens, etc.)
   - Onde o token/sessão é armazenado? (localStorage, cookies, etc.)
   - Como é enviado nas requisições? (header, cookie, etc.)

5. **Estrutura de Pastas:**
   - Onde está a API? (mesma pasta do frontend, pasta separada, etc.)
   - Há arquivo .htaccess? Onde está e qual é o conteúdo?

6. **Exemplo de Requisição:**
   - Mostre um exemplo completo de uma requisição de login ou autenticação
   - Inclua: URL, método, headers, body, etc.

Por favor, mostre os arquivos relevantes e código específico.
```

---

## 🔍 Informações Específicas que Preciso

### 1. Arquivo de Serviço da API

**Onde procurar:**
- `src/services/apiService.ts` ou similar
- `src/lib/api.ts` ou similar
- Qualquer arquivo que faça requisições HTTP

**O que copiar:**
- Todo o conteúdo do arquivo
- Especialmente a parte que faz `fetch()` ou requisições

### 2. Configuração de CORS (se API própria)

**Onde procurar:**
- `api/config/cors.php` ou similar
- `.htaccess` na pasta da API
- Configuração no servidor

**O que copiar:**
- Todo o conteúdo do arquivo CORS
- Conteúdo do .htaccess

### 3. Variáveis de Ambiente

**Onde procurar:**
- `.env` ou `.env.example`
- Arquivo de configuração

**O que copiar:**
- URL da API
- Configurações relacionadas

### 4. Exemplo de Requisição

**Onde procurar:**
- Função de login
- Função que faz requisição para API

**O que copiar:**
- Código completo da função
- Especialmente a parte do `fetch()` ou requisição

---

## 📋 Checklist do que Coletar

- [ ] URL da API (completa)
- [ ] Código do serviço que faz requisições
- [ ] Headers enviados nas requisições
- [ ] Uso de `credentials` (include, same-origin, ou nenhum)
- [ ] Configuração de CORS (se houver)
- [ ] Método de autenticação
- [ ] Onde token/sessão é armazenado
- [ ] Estrutura de pastas (API e frontend)
- [ ] Conteúdo do .htaccess (se houver)
- [ ] Exemplo completo de uma requisição

---

## 💡 Dica

**Se a aplicação usa Google Drive API:**
- Não precisa de CORS próprio (Google gerencia)
- Mas ainda preciso ver como as requisições são feitas
- Especialmente se usa `credentials` ou headers customizados

---

## 🎯 Resultado Esperado

Com essas informações, vou poder:
1. Comparar as duas aplicações
2. Identificar diferenças críticas
3. Aplicar a mesma configuração que funciona
4. Resolver o problema de acesso

---

**Envie esse prompt na outra aplicação e me traga as informações coletadas!**
