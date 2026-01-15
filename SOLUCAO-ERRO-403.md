# 🔧 Solução para Erro 403 Forbidden - Hostnet

## ❌ O Problema

Erro **403 Forbidden** significa que o servidor está **recusando o acesso**, não é problema de DNS.

## ✅ Checklist de Verificação

### 1. Verificar Localização dos Arquivos

**Os arquivos devem estar em:**
- `public_html/` (pasta raiz do domínio)
- **OU** na pasta configurada para o domínio no painel da Hostnet

**Como verificar:**
1. Acesse o **Painel Hostnet**
2. Vá em **Servidor Cloud** > **Gerenciador de Arquivos**
3. Verifique se os arquivos estão na pasta correta do domínio

### 2. Verificar Arquivo index.html

**O arquivo `index.html` DEVE estar na raiz:**
```
public_html/
├── index.html  ← DEVE ESTAR AQUI
├── .htaccess
├── assets/
├── images/
├── logo/
└── pdf/
```

**NÃO deve estar assim:**
```
public_html/
└── dist/          ← ERRADO!
    ├── index.html
    └── assets/
```

### 3. Verificar Permissões dos Arquivos

**Permissões corretas:**
- Arquivos: **644** (rw-r--r--)
- Pastas: **755** (rwxr-xr-x)
- `.htaccess`: **644**

**Como corrigir no Gerenciador de Arquivos:**
1. Selecione o arquivo/pasta
2. Clique em **Alterar Permissões**
3. Defina as permissões corretas

### 4. Verificar Configuração do Domínio

**No painel da Hostnet:**
1. Acesse **Servidor Cloud** > **Configuração dos Sites**
2. Verifique se o domínio está apontando para a pasta correta
3. Verifique se o **Document Root** está configurado corretamente

### 5. Verificar Arquivo .htaccess

**O arquivo `.htaccess` deve estar na raiz junto com `index.html`**

Se não estiver, faça upload novamente.

## 🔍 Passos para Resolver

### Passo 1: Verificar Estrutura de Pastas

1. Acesse o **Gerenciador de Arquivos** da Hostnet
2. Navegue até a pasta do seu domínio (geralmente `public_html`)
3. Verifique se você vê:
   - ✅ `index.html`
   - ✅ `.htaccess`
   - ✅ Pasta `assets/`
   - ✅ Pasta `images/`
   - ✅ Pasta `logo/`
   - ✅ Pasta `pdf/`

### Passo 2: Se os Arquivos Estão em Subpasta

**Se os arquivos estão em `public_html/dist/` ou outra subpasta:**

**Opção A: Mover arquivos para raiz**
1. Entre na pasta `dist/`
2. Selecione TODOS os arquivos e pastas
3. Mova para `public_html/` (raiz)

**Opção B: Configurar domínio para apontar para subpasta**
1. No painel, configure o Document Root para apontar para a subpasta

### Passo 3: Verificar Permissões

1. Selecione `index.html`
2. Clique em **Alterar Permissões**
3. Defina: **644**
4. Repita para `.htaccess`
5. Para pastas (`assets/`, `images/`, etc.): **755**

### Passo 4: Verificar .htaccess

1. Certifique-se de que o arquivo `.htaccess` está na raiz
2. Verifique se o conteúdo está correto (já foi gerado no build)

### Passo 5: Limpar Cache

1. Limpe o cache do navegador (Ctrl + Shift + Delete)
2. Tente acessar em modo anônimo (Ctrl + Shift + N)
3. Ou tente em outro navegador

## 🚨 Problemas Comuns

### Problema: "Arquivos estão em public_html/dist/"
**Solução:** Mova todos os arquivos de `dist/` para `public_html/`

### Problema: "index.html não encontrado"
**Solução:** Verifique se o arquivo está na raiz e com nome exato `index.html` (minúsculo)

### Problema: "Permissões incorretas"
**Solução:** Defina permissões 644 para arquivos e 755 para pastas

### Problema: "Domínio apontando para pasta errada"
**Solução:** No painel da Hostnet, configure o Document Root corretamente

## 📞 Próximos Passos

Se após seguir todos os passos ainda houver erro 403:

1. **Entre em contato com suporte da Hostnet**
   - Informe que está recebendo erro 403
   - Peça para verificar configuração do domínio
   - Peça para verificar permissões do servidor

2. **Verifique logs do servidor**
   - No painel da Hostnet, acesse os logs de erro
   - Isso pode dar mais detalhes sobre o problema

## ✅ Estrutura Correta Final

```
public_html/                    ← Pasta raiz do domínio
├── index.html                  ← Arquivo principal
├── .htaccess                   ← Configuração Apache
├── assets/                     ← JavaScript e CSS
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── pdf.worker-[hash].mjs
├── images/                     ← Imagens
│   ├── activities/
│   ├── gallery/
│   └── videos/
├── logo/                       ← Logos
│   └── [32 arquivos PNG]
└── pdf/                        ← PDFs
    ├── anos-finais/
    ├── anos-iniciais/
    └── educacao-infantil/
```

---

**💡 Dica:** O erro 403 geralmente é resolvido movendo os arquivos para a pasta correta e ajustando as permissões!
