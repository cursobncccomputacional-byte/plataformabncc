# 🔧 Solução: PHP Não Funciona - Sem Editar .htaccess no Servidor

## ❌ Situação

Você não consegue editar o conteúdo do `.htaccess` no servidor, apenas as permissões.

## ✅ Soluções Disponíveis

### Solução 1: Fazer Upload via FTP (RECOMENDADO)

**Como fazer:**
1. Use o **FileZilla** para conectar ao servidor
2. Navegue até `/novaedu/`
3. **Faça upload** do arquivo `dist/.htaccess` (ou `htaccess-para-upload.txt` renomeado)
4. **Substitua** o arquivo existente
5. **Verifique** permissões (644)

**Arquivo para upload:**
- `c:\projetos\PlataformaBNCC\dist\.htaccess` (já atualizado)
- Ou: `c:\projetos\PlataformaBNCC\htaccess-para-upload.txt` (renomeie para `.htaccess`)

### Solução 2: Criar Script PHP para Modificar .htaccess

Se não conseguir fazer upload via FTP, podemos criar um script PHP que modifica o `.htaccess`:

**Criar arquivo `atualizar-htaccess.php`:**

```php
<?php
$htaccessContent = <<<'HTACCESS'
# Configuração para Aplicação React (Vite)
DirectoryIndex index.html index.php

<FilesMatch "\.php$">
</FilesMatch>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteCond %{REQUEST_FILENAME} \.php$ [NC]
  RewriteRule ^ - [L]
  
  RewriteCond %{REQUEST_URI} ^.*/api/.*$ [NC]
  RewriteRule ^ - [L]
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  RewriteRule ^ index.html [QSA,L]
</IfModule>

<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType application/javascript .mjs
  AddType text/css .css
  AddType application/json .json
</IfModule>
HTACCESS;

$htaccessPath = __DIR__ . '/.htaccess';

if (file_put_contents($htaccessPath, $htaccessContent)) {
    echo "✅ .htaccess atualizado com sucesso!";
} else {
    echo "❌ Erro ao atualizar .htaccess. Verifique permissões.";
}
?>
```

**Como usar:**
1. Faça upload de `atualizar-htaccess.php` para `/novaedu/`
2. Acesse: `https://www.novaedubncc.com.br/novaedu/atualizar-htaccess.php`
3. O script criará/atualizará o `.htaccess`
4. **IMPORTANTE**: Delete o arquivo `atualizar-htaccess.php` após usar (segurança)

### Solução 3: Contatar Suporte da Hostnet

Se nenhuma das soluções acima funcionar, contate o suporte da Hostnet e solicite:

**Informações para o Suporte:**

```
Assunto: Solicitação de Atualização de .htaccess

Domínio: www.novaedubncc.com.br
Pasta: /novaedu/

Solicitação:
Não consigo editar o conteúdo do arquivo .htaccess via painel.
Preciso que o arquivo .htaccess seja atualizado com o seguinte conteúdo:

[Enviar o conteúdo do arquivo htaccess-para-upload.txt]

Motivo:
Arquivos PHP não estão sendo executados, retornam HTML em vez de executar.
Preciso adicionar regras para não redirecionar arquivos .php para index.html.
```

### Solução 4: Mover API para Fora (Alternativa)

Se não conseguir atualizar o `.htaccess`, considere mover a API para fora da pasta do frontend:

**Estrutura:**
```
/home/supernerd/
  ├── novaedu/     (Frontend React)
  └── api/         (API PHP - FORA)
```

**Vantagem**: Não precisa modificar o `.htaccess` do frontend

## 📋 Recomendação de Ordem

1. **Primeiro**: Tentar upload via FileZilla (Solução 1)
2. **Se não funcionar**: Usar script PHP (Solução 2)
3. **Se não funcionar**: Contatar suporte (Solução 3)
4. **Último recurso**: Mover API para fora (Solução 4)

## 💡 Dica

O arquivo `dist/.htaccess` já está atualizado e pronto para upload via FileZilla. Esta é a solução mais simples e direta.

---

**Importante**: Se após fazer upload do `.htaccess` atualizado ainda não funcionar, o problema é de configuração do servidor (AllowOverride None) e precisa de suporte da Hostnet.
