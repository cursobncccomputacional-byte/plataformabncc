# 🧹 Limpar Servidor e Fazer Upload Completo

## ⚠️ ATENÇÃO: Backup Antes de Limpar!

**IMPORTANTE**: Antes de excluir, faça backup dos arquivos importantes:
- Arquivos de configuração que você modificou
- Dados que não estão no repositório

## 📋 Passo a Passo Completo

### Fase 1: Limpar Servidor

#### Opção A: Via File Manager (Recomendado)

1. **Acesse o File Manager** do painel da Hostnet
2. **Navegue até** `/novaedu/`
3. **Selecione TODOS os arquivos e pastas** (exceto se houver algo importante)
4. **Delete** tudo
5. **Confirme** a exclusão

#### Opção B: Via FTP (FileZilla)

1. **Conecte ao servidor** via FileZilla
2. **Navegue até** `/novaedu/`
3. **Selecione todos os arquivos e pastas**
4. **Delete** (botão direito → Delete)
5. **Aguarde** a exclusão completar

### Fase 2: Preparar Arquivos Locais

#### 1. Verificar Build Atual

```bash
npm run build
```

Certifique-se de que a pasta `dist/` está atualizada.

#### 2. Verificar Estrutura Local

Execute o script de listagem:
```bash
npm run list-files
```

Isso gerará relatórios em:
- `relatorio-dist.md`
- `relatorio-api.md`

### Fase 3: Upload Ordenado

#### 1. Primeiro: Upload da API

**Via File Manager (Recomendado para API):**
1. Acesse File Manager
2. Navegue até `/novaedu/`
3. **Crie a pasta `api/`** se não existir
4. **Faça upload** de todos os arquivos da pasta `api/` local:
   - `api/.htaccess`
   - `api/test.php`
   - `api/test-php.php`
   - `api/auth/` (pasta completa)
   - `api/config/` (pasta completa)
   - `api/users/` (pasta completa)

**Permissões:**
- Pastas: **755**
- Arquivos PHP: **644**

#### 2. Segundo: Testar API

**Teste se PHP está funcionando:**
```
https://www.novaedubncc.com.br/novaedu/api/test-php.php
```

**Deve mostrar:**
```
PHP FUNCIONANDO!
Versão PHP: ...
```

**Se funcionar**: Continue para o próximo passo
**Se não funcionar**: Verifique configuração do servidor

#### 3. Terceiro: Upload do Frontend

**Via FTP (FileZilla):**
1. Conecte ao servidor
2. Navegue até `/novaedu/`
3. **Faça upload** de todos os arquivos da pasta `dist/`:
   - `index.html`
   - `index.php`
   - `.htaccess` (IMPORTANTE!)
   - `assets/` (pasta completa)
   - `images/` (pasta completa)
   - `logo/` (pasta completa)
   - `pdf/` (pasta completa)

**Ordem recomendada:**
1. Primeiro: `.htaccess` (para configurar corretamente)
2. Depois: `index.html` e `index.php`
3. Por último: Pastas (`assets/`, `images/`, etc.)

**Permissões:**
- `.htaccess`: **644**
- `index.html`, `index.php`: **644**
- Pastas: **755**
- Arquivos dentro das pastas: **644**

### Fase 4: Verificações Finais

#### 1. Verificar Estrutura

Use o script PHP no servidor:
```
https://www.novaedubncc.com.br/novaedu/api/listar-simples.php
```

Compare com os relatórios locais.

#### 2. Testar Site

**Acesse:**
```
https://www.novaedubncc.com.br
```

**Verifique:**
- Site carrega?
- Console do navegador tem erros?
- Assets carregam corretamente?

#### 3. Testar API

**Teste:**
```
https://www.novaedubncc.com.br/novaedu/api/test.php
```

**Deve retornar JSON:**
```json
{
  "status": "OK",
  "message": "API está acessível!",
  ...
}
```

## 📦 Checklist de Upload

### API (`/novaedu/api/`)
- [ ] `.htaccess`
- [ ] `test.php`
- [ ] `test-php.php`
- [ ] `auth/login.php`
- [ ] `auth/logout.php`
- [ ] `auth/me.php`
- [ ] `config/cors.php`
- [ ] `config/database.php`
- [ ] `config/auth.php`
- [ ] `users/index.php`

### Frontend (`/novaedu/`)
- [ ] `.htaccess` (ATUALIZADO - não redireciona api/)
- [ ] `index.html`
- [ ] `index.php`
- [ ] `assets/index-2VDC-HEi.js` (897 KB)
- [ ] `assets/index-D7JHakpt.css` (52 KB)
- [ ] `assets/pdf.worker-DHaD_gt7.mjs` (2.09 MB)
- [ ] Pasta `images/` completa
- [ ] Pasta `logo/` completa
- [ ] Pasta `pdf/` completa

## ⚠️ Problemas Comuns

### Arquivo Grande Não Sobe
- Use **File Manager** do painel (mais estável)
- Ou aumente timeout no FileZilla

### PHP Não Executa
- Verifique permissões (644 para arquivos)
- Verifique se PHP está habilitado no servidor
- Contate suporte se necessário

### Assets Não Carregam
- Verifique se `.htaccess` foi enviado
- Verifique permissões (755 para pastas)
- Teste acesso direto: `https://www.novaedubncc.com.br/novaedu/assets/index-2VDC-HEi.js`

## 🎯 Ordem Recomendada de Upload

1. ✅ **API primeiro** (testar se PHP funciona)
2. ✅ **`.htaccess` da raiz** (configurar corretamente)
3. ✅ **`index.html` e `index.php`**
4. ✅ **Pasta `assets/`** (mais importante)
5. ✅ **Outras pastas** (`images/`, `logo/`, `pdf/`)

---

**💡 Dica**: Faça upload em etapas e teste após cada etapa para identificar problemas rapidamente!
