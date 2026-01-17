# 🔧 Solução: Erro na Transferência de Arquivos via FTP

## ❌ Problema Identificado

- **46 arquivos não puderam ser transferidos**
- Pasta `images` no servidor com ícone de interrogação (⚠️)
- Algumas transferências foram bem-sucedidas (148), mas outras falharam

## 🔍 Possíveis Causas

1. **Problemas de Permissões** (mais comum)
2. **Arquivos muito grandes** (timeout)
3. **Pasta não existe no servidor**
4. **Conexão instável**
5. **Arquivos bloqueados/corrompidos**

## ✅ Soluções Passo a Passo

### 1. Verificar Arquivos com Falha

No FileZilla:
1. Clique na aba **"Transferências com falha (46)"**
2. Veja quais arquivos falharam
3. Anote a mensagem de erro para cada arquivo

### 2. Verificar Permissões da Pasta `images`

A pasta `images` está com ícone de interrogação (⚠️), indicando problema.

**Solução:**
1. **Clique com botão direito** na pasta `images` no servidor remoto
2. Selecione **"Criar diretório"** ou **"Criar pasta"**
3. Ou verifique se a pasta existe e tem permissões corretas

### 3. Corrigir Permissões (via FileZilla)

**Para pastas:**
1. Clique com botão direito na pasta no servidor
2. Selecione **"Permissões de arquivo"** ou **"Atributos de arquivo"**
3. Defina: **755** (ou marque: rwxr-xr-x)
4. Marque **"Recursivo em subdiretórios"**
5. Clique em **OK**

**Para arquivos:**
1. Selecione os arquivos que falharam
2. Clique com botão direito → **"Permissões de arquivo"**
3. Defina: **644** (ou marque: rw-r--r--)

### 4. Transferir Arquivos em Lotes Menores

Se muitos arquivos estão falhando:
1. **Selecione apenas alguns arquivos** por vez
2. **Arraste para o servidor**
3. **Aguarde a conclusão**
4. **Repita** com os próximos arquivos

### 5. Verificar Tipos de Arquivo que Falharam

**Arquivos grandes (PDFs, imagens):**
- Podem estar causando timeout
- Tente transferir um por vez primeiro

**Arquivos de sistema:**
- `.htaccess`, `.git`, etc. podem precisar de permissões especiais

### 6. Usar Modo Binário para Arquivos Específicos

1. No FileZilla: **Transferência** → **Tipo de transferência**
2. Selecione **"Binário"** para:
   - Imagens (.png, .jpg, .jpeg)
   - PDFs
   - Arquivos compilados

### 7. Verificar Espaço em Disco no Servidor

1. No FileZilla, clique com botão direito na pasta raiz do servidor
2. Selecione **"Calcular tamanho do diretório"**
3. Verifique se há espaço suficiente

### 8. Tentar Transferência Individual

Para arquivos que falharam:
1. Clique na aba **"Transferências com falha"**
2. **Clique com botão direito** em cada arquivo
3. Selecione **"Reenviar"** ou **"Retomar"**

## 🎯 Solução Rápida Recomendada

### Passo 1: Criar/Verificar Pastas no Servidor

1. No servidor remoto (`/novaedu`), verifique se existem:
   - ✅ `assets/`
   - ✅ `images/` (criar se não existir)
   - ✅ `logo/`
   - ✅ `pdf/`

2. Se alguma pasta não existir:
   - Clique com botão direito → **"Criar diretório"**
   - Nome: `images` (ou a pasta que falta)

### Passo 2: Corrigir Permissões

1. Selecione todas as pastas no servidor
2. Clique com botão direito → **"Permissões de arquivo"**
3. Defina: **755**
4. Marque **"Recursivo em subdiretórios"**
5. Clique em **OK**

### Passo 3: Transferir Novamente

1. Selecione os arquivos que falharam
2. Arraste para o servidor
3. Aguarde a conclusão

## 🔍 Verificar Logs de Erro

No FileZilla:
1. Aba **"Estado"** (Status) no topo
2. Procure por mensagens de erro como:
   - "550 Permission denied"
   - "553 File name not allowed"
   - "421 Timeout"
   - "550 Directory not found"

## ⚠️ Problemas Comuns e Soluções

### Erro: "550 Permission denied"
**Solução**: Corrigir permissões (755 para pastas, 644 para arquivos)

### Erro: "553 File name not allowed"
**Solução**: Verificar se o nome do arquivo tem caracteres especiais inválidos

### Erro: "421 Timeout"
**Solução**: 
- Transferir arquivos menores primeiro
- Verificar conexão de internet
- Aumentar timeout nas configurações do FileZilla

### Erro: "550 Directory not found"
**Solução**: Criar a pasta no servidor antes de transferir

## 📋 Checklist

- [ ] Verificou quais arquivos falharam?
- [ ] Criou as pastas que faltam no servidor?
- [ ] Corrigiu permissões (755 para pastas, 644 para arquivos)?
- [ ] Tentou transferir arquivos em lotes menores?
- [ ] Verificou espaço em disco no servidor?
- [ ] Verificou logs de erro no FileZilla?

---

**💡 Dica**: Comece transferindo apenas o `index.html` e as pastas principais. Depois, transfira os arquivos dentro de cada pasta separadamente.
