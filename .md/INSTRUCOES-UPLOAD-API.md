# 📤 Instruções para Upload da API

## 📁 Arquivos para Upload

Faça upload de **TODA a pasta `api/`** para o servidor.

### Estrutura Completa:

```
api/
├── config/
│   ├── database.php      ✅ OBRIGATÓRIO
│   ├── cors.php          ✅ OBRIGATÓRIO
│   └── auth.php          ✅ OBRIGATÓRIO
├── auth/
│   ├── login.php         ✅ OBRIGATÓRIO
│   ├── logout.php        ✅ OBRIGATÓRIO
│   └── me.php            ✅ OBRIGATÓRIO
├── users/
│   └── index.php         ✅ OBRIGATÓRIO
└── .htaccess             ✅ OBRIGATÓRIO
```

## 🚀 Como Fazer Upload

### Opção 1: Via FTP/cPanel File Manager

1. **Acesse o painel da Hostnet**
2. **Abra o File Manager** ou use um cliente FTP
3. **Navegue até a pasta do site** (geralmente `public_html` ou `novaedu`)
4. **Crie a pasta `api`** (se não existir)
5. **Faça upload de TODOS os arquivos** da pasta `api/` mantendo a estrutura:
   ```
   public_html/
   ou
   novaedu/
   └── api/
       ├── config/
       ├── auth/
       ├── users/
       └── .htaccess
   ```

### Opção 2: Via FTP (FileZilla, WinSCP, etc)

1. **Conecte ao servidor** via FTP
2. **Navegue até a pasta do site**
3. **Crie a pasta `api`**
4. **Faça upload mantendo a estrutura de pastas**

## ⚙️ Configurações Necessárias

### 1. Ajustar `api/config/database.php`

**IMPORTANTE**: Verifique se o host está correto:

```php
$db_config = [
    'host' => 'localhost', // Pode ser 'localhost' ou IP do servidor
    'dbname' => 'supernerds3',
    'username' => 'supernerds3',
    'password' => '*.BDnovaedu2026!',
];
```

**Se necessário, ajuste o `host`** (pode ser `localhost` ou um IP específico).

### 2. Verificar Permissões

Após o upload, configure as permissões:
- **Pastas**: `755` (drwxr-xr-x)
- **Arquivos PHP**: `644` (-rw-r--r--)

**Via cPanel File Manager:**
- Clique com botão direito no arquivo/pasta
- Selecione "Change Permissions"
- Configure conforme acima

**Via FTP:**
- Clique com botão direito → "File Permissions" ou "Change Permissions"

## 📍 Localização no Servidor

A API deve ficar no mesmo nível do site:

```
servidor/
├── index.html          (site React)
├── assets/             (arquivos do build)
├── api/                ← AQUI!
│   ├── config/
│   ├── auth/
│   └── users/
└── ...
```

## 🧪 Testar Após Upload

### 1. Testar Login

**URL**: `https://www.novaedubncc.com.br/api/auth/login`

**Método**: POST

**Body (JSON)**:
```json
{
  "email": "marcus.lopes",
  "password": "?&,6bsMrD08a"
}
```

**Resposta esperada**:
```json
{
  "error": false,
  "user": {
    "id": "root-marcus-001",
    "name": "Marcus Lopes",
    "email": "marcus.lopes",
    "role": "root",
    ...
  }
}
```

### 2. Testar Obter Usuário Atual

**URL**: `https://www.novaedubncc.com.br/api/auth/me`

**Método**: GET

**Headers**: Cookie com PHPSESSID (retornado no login)

### 3. Testar Listar Usuários

**URL**: `https://www.novaedubncc.com.br/api/users/`

**Método**: GET

**Headers**: Cookie com PHPSESSID

## ⚠️ Problemas Comuns

### Erro 500 (Internal Server Error)
- ✅ Verifique se o PHP está habilitado
- ✅ Verifique permissões dos arquivos (644)
- ✅ Verifique logs de erro do PHP
- ✅ Verifique se o `host` do banco está correto

### Erro 404 (Not Found)
- ✅ Verifique se a pasta `api/` está no local correto
- ✅ Verifique se o `.htaccess` foi enviado
- ✅ Verifique se o mod_rewrite está habilitado

### Erro de Conexão com Banco
- ✅ Verifique credenciais em `api/config/database.php`
- ✅ Verifique se o host está correto
- ✅ Teste conexão via PHPMyAdmin

## 📋 Checklist de Upload

- [ ] Pasta `api/` criada no servidor
- [ ] Todos os arquivos da pasta `config/` enviados
- [ ] Todos os arquivos da pasta `auth/` enviados
- [ ] Todos os arquivos da pasta `users/` enviados
- [ ] Arquivo `.htaccess` enviado
- [ ] Permissões configuradas (pastas 755, arquivos 644)
- [ ] `database.php` ajustado (host, se necessário)
- [ ] Testado login via Postman/curl
- [ ] Verificado logs de erro (se houver)

## 🔐 Segurança

⚠️ **IMPORTANTE**: 
- O arquivo `api/config/database.php` contém credenciais sensíveis
- Não compartilhe este arquivo publicamente
- Mantenha as permissões corretas (644)

---

**💡 Dica**: Use o Postman ou Insomnia para testar os endpoints após o upload!
