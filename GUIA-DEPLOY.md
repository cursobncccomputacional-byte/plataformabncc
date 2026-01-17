# 📦 Guia de Deploy - Plataforma BNCC

## 🚀 Processo de Deploy

### 1. Gerar Build de Produção

Sempre que fizer alterações no código React/TypeScript, você precisa gerar um novo build:

```bash
npm run build
```

Este comando gera os arquivos otimizados na pasta `dist/`.

### 2. Arquivos para Enviar ao Servidor

#### ✅ **ARQUIVOS DO FRONTEND (pasta `dist/`)**

Envie **TODA a pasta `dist/`** para o servidor. Ela contém:

```
dist/
├── index.html          ← Arquivo principal (OBRIGATÓRIO)
├── assets/            ← JavaScript e CSS compilados (OBRIGATÓRIO)
│   ├── index-*.js     ← Código JavaScript minificado
│   ├── index-*.css     ← Estilos CSS compilados
│   └── *.mjs          ← Outros módulos necessários
├── favicon.png        ← Ícone do site
├── images/            ← Imagens estáticas
├── logo/              ← Logos da marca
└── pdf/               ← PDFs de documentos
```

**⚠️ IMPORTANTE:** 
- Os nomes dos arquivos em `assets/` mudam a cada build (ex: `index-ABC123.js`)
- O `index.html` referencia esses arquivos automaticamente
- **SEMPRE envie a pasta `dist/` completa**

#### ✅ **ARQUIVOS DO BACKEND (pasta `api/`)**

Envie **TODA a pasta `api/`** para o servidor:

```
api/
├── auth/              ← Endpoints de autenticação
├── config/            ← Configurações (CORS, database, auth)
├── users/             ← Endpoints de usuários
└── *.php              ← Outros arquivos PHP
```

**⚠️ IMPORTANTE:**
- O arquivo `api/config/database.php` contém credenciais sensíveis
- **NUNCA** commite este arquivo no Git
- Mantenha-o apenas no servidor

### 3. Estrutura no Servidor

A estrutura recomendada no servidor é:

```
/
├── index.html          ← Copiado de dist/index.html
├── assets/             ← Copiado de dist/assets/
├── images/            ← Copiado de dist/images/
├── logo/              ← Copiado de dist/logo/
├── pdf/               ← Copiado de dist/pdf/
├── favicon.png        ← Copiado de dist/favicon.png
└── api/               ← Pasta api/ completa
    ├── auth/
    ├── config/
    ├── users/
    └── *.php
```

### 4. Processo Completo de Deploy

#### Passo a Passo:

1. **Fazer alterações no código** (em `src/` ou `api/`)

2. **Gerar build do frontend:**
   ```bash
   npm run build
   ```

3. **Verificar se o build foi gerado:**
   - Verifique se a pasta `dist/` foi atualizada
   - Verifique se há novos arquivos em `dist/assets/`

4. **Enviar arquivos via FTP/SFTP:**

   **Frontend:**
   - Envie todos os arquivos de `dist/` para a raiz do servidor
   - **Substitua** os arquivos antigos (especialmente em `assets/`)

   **Backend:**
   - Envie todos os arquivos de `api/` para a pasta `api/` no servidor
   - **Cuidado** para não sobrescrever `api/config/database.php` se já existir

5. **Limpar cache do navegador:**
   - Após o deploy, faça um hard refresh (Ctrl+Shift+R)

### 5. Checklist de Deploy

- [ ] Código testado localmente (`npm run dev`)
- [ ] Build gerado com sucesso (`npm run build`)
- [ ] Pasta `dist/` verificada
- [ ] Arquivos do frontend enviados
- [ ] Arquivos do backend (API) enviados
- [ ] Configurações do banco de dados verificadas
- [ ] Cache do navegador limpo
- [ ] Teste no servidor realizado

### 6. Arquivos que NÃO devem ser enviados

❌ **NÃO envie:**
- `node_modules/` (dependências do Node.js)
- `src/` (código fonte - já compilado em `dist/`)
- `.git/` (controle de versão)
- `package.json` e `package-lock.json` (não necessários no servidor)
- Arquivos de configuração local (`.env`, etc.)
- Arquivos de teste (`test-*.php`, etc.)

### 7. Dicas Importantes

1. **Sempre faça backup** antes de fazer deploy
2. **Teste localmente primeiro** com `npm run dev`
3. **Verifique os logs** do servidor se algo der errado
4. **Mantenha o `database.php` seguro** - nunca o exponha publicamente
5. **Use um cliente FTP** como FileZilla ou WinSCP para facilitar o upload

### 8. Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Preview do build localmente
npm run preview

# Verificar tipos TypeScript
npm run typecheck
```

### 9. Troubleshooting

**Problema: Alterações não aparecem no servidor**
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se os arquivos foram enviados corretamente
- Verifique se o `index.html` está na raiz do servidor

**Problema: Erro 404 nos arquivos JS/CSS**
- Verifique se a pasta `assets/` foi enviada completamente
- Verifique se os caminhos no `index.html` estão corretos
- Verifique as permissões dos arquivos no servidor

**Problema: API não funciona**
- Verifique se a pasta `api/` está no servidor
- Verifique se o arquivo `api/config/database.php` existe e está configurado
- Verifique os logs de erro do PHP no servidor

---

**Última atualização:** $(date)
