# 📤 Instruções: Como Fazer Upload do .htaccess Atualizado

## ❌ Problema

Você não consegue editar o conteúdo do `.htaccess` no servidor, apenas as permissões.

## ✅ Solução: Fazer Upload via FTP

Como não é possível editar no servidor, vamos fazer o upload do arquivo atualizado via FTP (FileZilla).

## 📋 Passo a Passo

### Passo 1: Preparar o Arquivo Local

O arquivo `.htaccess` atualizado está em:
- **Local**: `c:\projetos\PlataformaBNCC\dist\.htaccess`
- **Ou**: `c:\projetos\PlataformaBNCC\htaccess-para-upload.txt` (cópia com nome diferente)

### Passo 2: Conectar via FileZilla

1. Abra o **FileZilla**
2. Conecte ao servidor da Hostnet
3. Navegue até a pasta `/novaedu/`

### Passo 3: Fazer Backup do .htaccess Atual (Opcional mas Recomendado)

1. **Baixe** o `.htaccess` atual do servidor
2. **Renomeie** localmente para `.htaccess-backup` (para segurança)
3. Guarde como backup caso precise reverter

### Passo 4: Fazer Upload do .htaccess Atualizado

**Opção A: Renomear o arquivo local**

1. No seu computador, renomeie:
   - `htaccess-para-upload.txt` → `.htaccess`
   - Ou use `dist\.htaccess` diretamente

2. **Arraste** o arquivo `.htaccess` do seu computador para `/novaedu/` no FileZilla

3. **Substitua** o arquivo existente quando solicitado

**Opção B: Usar o arquivo da pasta dist**

1. No FileZilla, navegue até `c:\projetos\PlataformaBNCC\dist\`
2. **Arraste** o arquivo `.htaccess` para `/novaedu/` no servidor
3. **Substitua** o arquivo existente

### Passo 5: Verificar Permissões

Após o upload:

1. **Clique com botão direito** no `.htaccess` no servidor
2. **Selecione** "Permissões de arquivo" ou "File permissions"
3. **Defina** permissão: **644**
4. **Confirme**

### Passo 6: Testar

1. **Limpe o cache** do navegador** (`Ctrl + F5`)
2. **Acesse**: `https://www.novaedubncc.com.br/novaedu/test.php`
3. **Resultado esperado**:
   - ✅ Mostra "PHP FUNCIONANDO!" → Funcionou!
   - ❌ Ainda mostra HTML → Continue para próxima solução

## 🔍 Se o Upload Não Funcionar

### Problema: FileZilla não mostra arquivos ocultos

O `.htaccess` é um arquivo oculto (começa com ponto).

**Solução no FileZilla:**
1. Menu: **Servidor** → **Forçar exibição de arquivos ocultos**
2. Ou: **Editar** → **Configurações** → **Navegação** → Marque "Mostrar arquivos ocultos"

### Problema: Não consigo substituir o arquivo

**Solução:**
1. **Delete** o `.htaccess` antigo no servidor (via FileZilla)
2. **Faça upload** do novo `.htaccess`
3. **Verifique** permissões (644)

## 📋 Checklist

- [ ] Arquivo `.htaccess` atualizado preparado localmente
- [ ] Backup do `.htaccess` atual feito (opcional)
- [ ] Conectado ao servidor via FileZilla
- [ ] Navegou até `/novaedu/`
- [ ] Fez upload do `.htaccess` atualizado
- [ ] Substituiu o arquivo existente
- [ ] Verificou permissões (644)
- [ ] Testou `test.php` no navegador
- [ ] Limpou cache do navegador

## 💡 Dica

Se ainda não funcionar após o upload, o problema é de configuração do servidor (AllowOverride None) e será necessário contatar o suporte da Hostnet.

---

**Importante**: O arquivo `.htaccess` na pasta `dist/` já está atualizado e pronto para upload!
