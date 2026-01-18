# 🚀 Guia de Deploy - Nova Edu EAD

## 📋 Pré-requisitos

1. Node.js instalado (versão 18 ou superior)
2. Acesso ao servidor via FTP/SFTP ou painel de controle
3. Banco de dados EAD criado e configurado

## 🔧 Passo a Passo

### 1. Instalar Dependências

```bash
cd EAD
npm install
```

### 2. Gerar Build de Produção

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos compilados.

### 3. Configurar Banco de Dados

Certifique-se de que o arquivo `config-database-ead.php` está configurado com as credenciais corretas:

```php
return [
    'host' => 'srv1311.hstgr.io',
    'database' => 'u985723830_ead',
    'username' => 'u985723830_ead',
    'password' => '@GvkzCp40',
    // ...
];
```

### 4. Estrutura de Arquivos para Upload

Você precisa fazer upload dos seguintes arquivos/pastas:

```
EAD/
├── dist/                    # ✅ Upload completo (build do frontend)
│   ├── index.html
│   ├── assets/
│   └── ...
├── api/                     # ✅ Upload completo (API PHP)
│   ├── config/
│   ├── courses/
│   ├── enrollments/
│   └── progress/
├── config-database-ead.php  # ✅ Upload (configuração do banco)
└── .htaccess                # ✅ Upload (configuração do servidor)
```

### 5. Upload para o Servidor

**Opção A: Via FTP/SFTP**
- Conecte-se ao servidor
- Navegue até a pasta do subdomínio `ead.novaedubncc.com.br`
- Faça upload dos arquivos listados acima

**Opção B: Via Painel de Controle (Hostinger)**
- Acesse o File Manager
- Navegue até a pasta do subdomínio
- Faça upload dos arquivos

### 6. Verificar Permissões

Certifique-se de que os arquivos PHP têm permissões corretas:
- Arquivos PHP: `644`
- Pastas: `755`

### 7. Testar

Acesse: `https://ead.novaedubncc.com.br`

## ⚠️ Importante

- **NÃO** faça upload da pasta `node_modules/`
- **NÃO** faça upload da pasta `src/` (apenas o `dist/`)
- **NÃO** faça upload de arquivos `.ts` ou `.tsx` (apenas o build compilado)
- **SIM**, faça upload da pasta `api/` completa
- **SIM**, faça upload do `config-database-ead.php`

## 🔍 Troubleshooting

### Erro: "Failed to load module script"
- **Causa**: Arquivos `.tsx` sendo servidos diretamente
- **Solução**: Certifique-se de fazer upload apenas da pasta `dist/` (build compilado)

### Erro: "Cannot connect to database"
- **Causa**: Credenciais incorretas ou banco não criado
- **Solução**: Verifique `config-database-ead.php` e execute o script SQL

### Erro: "404 Not Found" nas rotas
- **Causa**: `.htaccess` não configurado ou não funcionando
- **Solução**: Verifique se o `.htaccess` está na raiz e se o servidor suporta `mod_rewrite`

## 📝 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento local (http://localhost:3002)
npm run build    # Build de produção (gera pasta dist/)
npm run preview  # Preview do build localmente
```
