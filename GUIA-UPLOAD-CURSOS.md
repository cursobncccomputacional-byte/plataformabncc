# 📤 Guia de Upload para Subdomínio: cursos.novaedubncc.com.br

## 🎯 Objetivo

Fazer upload dos arquivos do frontend para a pasta `cursos` no servidor para que o subdomínio `cursos.novaedubncc.com.br` funcione.

---

## 📁 Estrutura no Servidor

```
/home/u985723830/domains/novaedubncc.com.br/public_html/
├── api/                    ← API (já deve estar aqui)
│   ├── config/
│   ├── auth/
│   └── ...
└── cursos/                 ← SUBDOMÍNIO (aqui vamos enviar os arquivos)
    ├── index.html
    ├── assets/
    └── .htaccess
```

---

## 🚀 Passo a Passo

### 1. **Build do Frontend** ✅ (Já foi feito)

O build já foi gerado na pasta `dist/`. Se precisar refazer:

```bash
npm run build
```

### 2. **Arquivos para Upload**

Você precisa enviar para `/public_html/cursos/`:

#### **Da pasta `dist/`:**
- ✅ `index.html`
- ✅ Pasta `assets/` completa (com todos os arquivos .js, .css, imagens, etc.)

#### **Da pasta `cursos/`:**
- ✅ `.htaccess` (arquivo de configuração do Apache)

### 3. **Como Fazer Upload**

#### **Opção A: Via FileZilla (FTP)**

1. **Conectar ao servidor:**
   - Host: `ftp.novaedubncc.com.br` (ou IP do servidor)
   - Usuário: seu usuário FTP
   - Senha: sua senha FTP
   - Porta: 21 (ou 22 para SFTP)

2. **Navegar até a pasta:**
   ```
   /home/u985723830/domains/novaedubncc.com.br/public_html/cursos/
   ```

3. **Verificar se a pasta `cursos` existe:**
   - Se não existir, criar a pasta `cursos` dentro de `public_html/`

4. **Upload dos arquivos:**
   
   **a) Upload do `.htaccess`:**
   - Arquivo local: `cursos/.htaccess`
   - Destino no servidor: `public_html/cursos/.htaccess`
   
   **b) Upload do `index.html`:**
   - Arquivo local: `dist/index.html`
   - Destino no servidor: `public_html/cursos/index.html`
   
   **c) Upload da pasta `assets/`:**
   - Pasta local: `dist/assets/` (todos os arquivos dentro)
   - Destino no servidor: `public_html/cursos/assets/`
   - **Importante**: Manter a estrutura de pastas!

#### **Opção B: Via cPanel File Manager**

1. **Acessar cPanel:**
   - Login no painel da Hostinger
   - Abrir "File Manager"

2. **Navegar até:**
   ```
   public_html/cursos/
   ```

3. **Criar pasta se não existir:**
   - Clicar em "New Folder"
   - Nome: `cursos`

4. **Upload dos arquivos:**
   - Clicar em "Upload"
   - Selecionar arquivos de `dist/` e `cursos/.htaccess`
   - Aguardar upload completar

---

## 📋 Checklist de Upload

### Arquivos Obrigatórios:

- [ ] `cursos/.htaccess` → `public_html/cursos/.htaccess`
- [ ] `dist/index.html` → `public_html/cursos/index.html`
- [ ] `dist/assets/` (pasta completa) → `public_html/cursos/assets/`

### Estrutura Final no Servidor:

```
public_html/cursos/
├── .htaccess          ✅
├── index.html         ✅
└── assets/            ✅
    ├── index-*.js
    ├── index-*.css
    └── ... (outros arquivos)
```

---

## ⚙️ Configurações Importantes

### Permissões dos Arquivos:

Após o upload, verificar permissões:

- **Pastas**: `755` (drwxr-xr-x)
- **Arquivos**: `644` (-rw-r--r--)

**Como alterar no FileZilla:**
1. Clicar com botão direito no arquivo/pasta
2. Selecionar "File Permissions" ou "Change Permissions"
3. Definir permissões corretas

**Como alterar no cPanel:**
1. Clicar com botão direito no arquivo/pasta
2. Selecionar "Change Permissions"
3. Marcar as caixas apropriadas

---

## ✅ Verificações Após Upload

### 1. **Testar Acesso ao Site:**

Acesse no navegador:
```
https://cursos.novaedubncc.com.br
```

**Resultado esperado:**
- ✅ Página carrega normalmente
- ✅ Não mostra erro 404
- ✅ Interface aparece corretamente

### 2. **Testar API:**

Acesse diretamente:
```
https://cursos.novaedubncc.com.br/api/auth.php?action=login
```

**Resultado esperado:**
- ✅ Retorna JSON com erro 405 (método não permitido) se acessar via GET
- ✅ Isso significa que a API está acessível ✅
- ❌ Se der 404, a API não está acessível (ver solução abaixo)

### 3. **Testar Login:**

1. Acessar: `https://cursos.novaedubncc.com.br`
2. Tentar fazer login
3. Deve funcionar normalmente ✅

---

## 🐛 Troubleshooting

### Problema: Página em branco

**Possíveis causas:**
- `.htaccess` não foi enviado ou está incorreto
- Permissões incorretas
- `index.html` não está na pasta correta

**Solução:**
1. Verificar se `.htaccess` está em `public_html/cursos/.htaccess`
2. Verificar permissões (755 para pastas, 644 para arquivos)
3. Verificar se `index.html` está em `public_html/cursos/index.html`

### Problema: Erro 404 na API

**Causa:**
- API não está acessível do subdomínio

**Solução:**
- Verificar se API está em `public_html/api/`
- Se não funcionar, copiar API para `public_html/cursos/api/` (Opção 2 do guia de deploy)

### Problema: Assets não carregam (CSS/JS)

**Causa:**
- Caminhos incorretos ou pasta `assets/` não foi enviada completamente

**Solução:**
1. Verificar se pasta `assets/` está completa em `public_html/cursos/assets/`
2. Verificar console do navegador (F12) para ver erros específicos
3. Verificar se `.htaccess` está configurado corretamente

---

## 📝 Notas Importantes

1. **API Compartilhada:**
   - A API em `public_html/api/` deve estar acessível
   - O código usa URL relativa `/api`, então funciona automaticamente

2. **SSL/HTTPS:**
   - Certifique-se de que o SSL está configurado para `cursos.novaedubncc.com.br`
   - A Hostinger geralmente configura automaticamente

3. **Cache:**
   - Após upload, limpar cache do navegador (Ctrl+Shift+R)
   - Ou testar em guia anônima

---

## 🎯 Resumo Rápido

1. ✅ Build já foi feito (`dist/` está pronto)
2. 📤 Upload de `dist/index.html` → `public_html/cursos/index.html`
3. 📤 Upload de `dist/assets/` → `public_html/cursos/assets/`
4. 📤 Upload de `cursos/.htaccess` → `public_html/cursos/.htaccess`
5. ✅ Testar: `https://cursos.novaedubncc.com.br`

---

**Data**: 2024
**Versão**: 1.0
