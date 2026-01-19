# 🚀 Guia de Deploy Urgente - Corrigir Login

## ⚠️ Situação Atual

- ✅ **Código local está correto** (`https://novaedubncc.com.br/api`)
- ❌ **Frontend em produção está com versão antiga** (URL errada)
- ✅ **API está acessível** (teste direto funcionou)
- ❌ **Login não funciona** em outros dispositivos

## 🎯 Solução: Build e Upload

### Passo 1: Verificar Arquivo .env (Opcional mas Recomendado)

**Se você tiver um arquivo `.env` na raiz do projeto:**

Abra o arquivo `.env` e verifique se tem:

```env
VITE_API_URL=https://novaedubncc.com.br/api
```

**Se não tiver o arquivo `.env` ou a URL estiver diferente:**
- Crie/edite o arquivo `.env` na raiz do projeto
- Adicione a linha acima
- **OU** deixe sem o arquivo (o código já tem o fallback correto)

### Passo 2: Fazer Build do Frontend

**No terminal, na raiz do projeto:**

```bash
npm run build
```

**Aguarde o build terminar.** Você verá algo como:
```
✓ built in 15.23s
```

### Passo 3: Verificar Pasta dist/

Após o build, verifique se a pasta `dist/` foi criada/atualizada:

```
PlataformaBNCC/
└── dist/
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    └── ...
```

### Passo 4: Upload para o Servidor

**Via FileZilla ou FTP:**

1. **Conectar ao servidor**
2. **Navegar até a pasta do site** (geralmente `/public_html/` ou `/novaedu/`)
3. **Fazer backup** (opcional mas recomendado):
   - Renomear pasta atual para `dist_backup_2026-01-19`
4. **Upload da pasta `dist/`:**
   - **Opção A:** Upload de todos os arquivos de `dist/` para a raiz do site
   - **Opção B:** Se o site está em subpasta `/novaedu/`, fazer upload para lá

**⚠️ IMPORTANTE:** 
- Não apague a pasta `api/` que já está no servidor!
- Apenas substitua os arquivos do frontend (index.html, assets/, etc.)

### Passo 5: Limpar Cache

**Após o upload:**

1. **No navegador do seu chefe/amigo:**
   - Pressionar `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
   - Ou limpar cache do navegador

2. **No celular:**
   - Fechar completamente o navegador
   - Abrir novamente
   - Ou limpar cache do navegador

### Passo 6: Testar

**Teste 1: Verificar se build está correto**

No navegador, abrir:
```
https://novaedubncc.com.br
```

Abrir console (F12) e verificar se não há erros.

**Teste 2: Tentar login**

- Tentar fazer login
- Se der erro, abrir console (F12) → aba Network
- Clicar na requisição `/auth/login`
- Verificar:
  - **URL da requisição** (deve ser `https://novaedubncc.com.br/api/auth/login`)
  - **Status HTTP** (200 = sucesso, 401 = credenciais erradas, 404 = URL errada)
  - **Resposta** (deve ser JSON)

## 🔍 Verificação Rápida

**Para confirmar que o build está correto:**

1. **Abrir o arquivo `dist/index.html`** (após build)
2. **Procurar por** `novaedubncc.com.br/api` no arquivo
3. **Verificar se está sem `www` e sem `/novaedu/`**

**Se encontrar:**
- ✅ `https://novaedubncc.com.br/api` → **CORRETO**
- ❌ `https://www.novaedubncc.com.br/api` → Precisa rebuild
- ❌ `https://novaedubncc.com.br/novaedu/api` → Precisa rebuild

## ⚠️ Se Ainda Não Funcionar Após Upload

### Verificar URL no Console

1. Abrir site: `https://novaedubncc.com.br`
2. Abrir console (F12)
3. Tentar fazer login
4. Na aba Network, verificar:
   - **Qual URL está sendo chamada?**
   - Se for `www.novaedubncc.com.br` ou `/novaedu/api` → **Build antigo ainda está no servidor**

### Solução: Upload Forçado

1. **Deletar todos os arquivos antigos** do servidor (exceto `api/`)
2. **Fazer upload novamente** da pasta `dist/`
3. **Limpar cache** do navegador
4. **Testar novamente**

## 📋 Checklist Final

- [ ] Arquivo `.env` verificado/atualizado (opcional)
- [ ] Build feito (`npm run build`)
- [ ] Pasta `dist/` verificada
- [ ] Upload feito para servidor
- [ ] Cache limpo (navegador)
- [ ] Teste de login realizado
- [ ] Console verificado (sem erros)
- [ ] URL da requisição verificada (deve ser `novaedubncc.com.br/api`)

## 🎯 Resultado Esperado

**Após seguir todos os passos:**

- ✅ Login funciona em **todos os dispositivos**
- ✅ Mensagens de erro são **mais claras** (se houver problema)
- ✅ Console não mostra erros de rede

---

**💡 Dica:** Se possível, faça o upload em horário de menor uso para não afetar usuários ativos.

**⏱️ Tempo estimado:** 10-15 minutos
