# 📋 Lista de Arquivos para Deploy

## ✅ SIM - Você sempre precisa gerar um build!

Quando você altera arquivos em `src/` (React/TypeScript), precisa gerar um novo build com:
```bash
npm run build
```

## 📦 Arquivos para Enviar

### 1️⃣ **FRONTEND (pasta `dist/`)**

Envie **TODOS** os arquivos da pasta `dist/` para a raiz do servidor:

```
✅ dist/index.html          → /index.html
✅ dist/assets/             → /assets/ (pasta completa)
✅ dist/favicon.png         → /favicon.png
✅ dist/images/             → /images/ (pasta completa)
✅ dist/logo/               → /logo/ (pasta completa)
✅ dist/pdf/                → /pdf/ (pasta completa)
✅ dist/atividades.xlsx     → /atividades.xlsx
```

**⚠️ IMPORTANTE:** 
- Os arquivos em `assets/` têm nomes únicos a cada build (ex: `index-DKrSbDRg.js`)
- O `index.html` referencia esses arquivos automaticamente
- **SEMPRE substitua os arquivos antigos** quando fizer deploy

### 2️⃣ **BACKEND (pasta `api/`)**

Envie **TODA** a pasta `api/` para o servidor:

```
✅ api/                     → /api/ (pasta completa)
   ├── auth/
   ├── config/
   ├── users/
   └── *.php
```

**⚠️ CUIDADO:**
- O arquivo `api/config/database.php` contém senhas
- Se já existe no servidor, **NÃO substitua** sem verificar
- Mantenha as credenciais do banco de dados seguras

## 🚫 NÃO Envie

❌ `node_modules/` - Dependências do Node.js (não necessárias)
❌ `src/` - Código fonte (já compilado em `dist/`)
❌ `package.json` - Não necessário no servidor
❌ Arquivos de teste (`test-*.php`)
❌ `.git/` - Controle de versão

## 🔄 Processo Rápido

1. **Alterar código** em `src/` ou `api/`
2. **Gerar build:** `npm run build`
3. **Enviar `dist/`** para raiz do servidor
4. **Enviar `api/`** para pasta `/api/` no servidor
5. **Limpar cache** do navegador (Ctrl+Shift+R)

## 📄 Planilha de atividades (XLSX)

- O arquivo deve ficar em `public/atividades.xlsx` no projeto.
- Ao rodar `npm run build`, ele vai para `dist/atividades.xlsx`.
- No servidor, ele precisa estar acessível em `/atividades.xlsx` (teste abrindo no navegador).

## 📝 Resumo Visual

```
Projeto Local              Servidor
─────────────────         ────────────────
dist/                     /
├── index.html    ──────→ index.html
├── assets/       ──────→ assets/
├── images/       ──────→ images/
├── logo/         ──────→ logo/
├── pdf/          ──────→ pdf/
└── favicon.png   ──────→ favicon.png

api/                      /api/
├── auth/         ──────→ auth/
├── config/       ──────→ config/
├── users/        ──────→ users/
└── *.php         ──────→ *.php
```

## ⚡ Dica Rápida

Use um cliente FTP como **FileZilla** ou **WinSCP**:
- Conecte no servidor
- Arraste a pasta `dist/` inteira para a raiz
- Arraste a pasta `api/` inteira para `/api/`
- Pronto! 🎉
