# ✅ Checklist: Upload Completo - Passo a Passo

## 📦 Arquivos para Upload

### 1. API (`/novaedu/api/`)

**Pastas:**
- [ ] `api/auth/` (pasta completa)
- [ ] `api/config/` (pasta completa)
- [ ] `api/users/` (pasta completa)

**Arquivos:**
- [ ] `api/.htaccess`
- [ ] `api/test.php`
- [ ] `api/test-php.php`
- [ ] `api/listar-simples.php` (opcional - para diagnóstico)

**Total**: 3 pastas + 3-4 arquivos

### 2. Frontend (`/novaedu/`)

**Arquivos na raiz:**
- [ ] `.htaccess` (ATUALIZADO - não redireciona api/)
- [ ] `index.html`
- [ ] `index.php`

**Pasta `assets/`:**
- [ ] `assets/index-2VDC-HEi.js` (897 KB) ⚠️ ARQUIVO GRANDE
- [ ] `assets/index-D7JHakpt.css` (52 KB)
- [ ] `assets/pdf.worker-DHaD_gt7.mjs` (2.09 MB) ⚠️ ARQUIVO MUITO GRANDE
- [ ] `assets/__vite-browser-external-BIHI7g3E.js` (33 Bytes)

**Outras pastas:**
- [ ] `images/` (pasta completa)
- [ ] `logo/` (pasta completa)
- [ ] `pdf/` (pasta completa)

## 🚀 Ordem de Upload Recomendada

### Etapa 1: API (Testar PHP)
1. Upload da pasta `api/` completa
2. Testar: `https://www.novaedubncc.com.br/novaedu/api/test-php.php`
3. ✅ Se funcionar → Continuar
4. ❌ Se não funcionar → Verificar configuração do servidor

### Etapa 2: Configuração Base
1. Upload do `.htaccess` (raiz)
2. Upload do `index.html`
3. Upload do `index.php`

### Etapa 3: Assets (Crítico)
1. Upload da pasta `assets/` completa
   - ⚠️ Arquivos grandes podem dar timeout
   - Use File Manager se FTP falhar

### Etapa 4: Outros Recursos
1. Upload da pasta `images/`
2. Upload da pasta `logo/`
3. Upload da pasta `pdf/`

## 🔍 Verificações Após Upload

### Verificação 1: Estrutura
- [ ] Todas as pastas existem?
- [ ] Todos os arquivos foram enviados?
- [ ] Tamanhos dos arquivos estão corretos?

### Verificação 2: Permissões
- [ ] Pastas: **755**
- [ ] Arquivos: **644**
- [ ] `.htaccess`: **644**

### Verificação 3: Funcionalidade
- [ ] Site carrega: `https://www.novaedubncc.com.br`
- [ ] API funciona: `https://www.novaedubncc.com.br/novaedu/api/test.php`
- [ ] PHP executa: `https://www.novaedubncc.com.br/novaedu/api/test-php.php`
- [ ] Assets carregam: `https://www.novaedubncc.com.br/novaedu/assets/index-2VDC-HEi.js`

## ⚠️ Arquivos Problemáticos

Estes arquivos podem dar problema no upload (são grandes):

1. **`assets/index-2VDC-HEi.js`** (897 KB)
   - Se falhar: Use File Manager

2. **`assets/pdf.worker-DHaD_gt7.mjs`** (2.09 MB)
   - Se falhar: Use File Manager
   - Ou aumente timeout no FileZilla

## 🎯 Estratégia de Upload

### Opção 1: File Manager (Recomendado)
- ✅ Mais estável para arquivos grandes
- ✅ Não tem limite de conexões
- ✅ Mostra progresso

### Opção 2: FTP (FileZilla)
- ✅ Mais rápido para muitos arquivos
- ⚠️ Pode ter problemas com arquivos grandes
- ⚠️ Limite de conexões

### Opção 3: Misto
- File Manager: Arquivos grandes
- FTP: Arquivos pequenos e pastas

---

**💡 Dica**: Faça upload em etapas e teste após cada etapa!
