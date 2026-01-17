# 📤 Instruções para Upload - Teste de Login

## ✅ O Que Foi Alterado

1. **Tela de Login**: Alterado de "Email" para "Usuário"
2. **Integração com API PHP**: Frontend agora se conecta à API backend
3. **Arquivo .env**: Criado localmente (não precisa subir)

## 📦 O Que Precisa Ser Enviado para o Servidor

### 1. Frontend (Pasta `dist/`)

Após executar `npm run build`, você terá uma pasta `dist/` com os arquivos compilados.

**Onde subir:**
- Upload da pasta `dist/` completa para o servidor
- Normalmente em: `/public_html/` ou `/www/` ou onde está o site atual

**Arquivos importantes:**
- Todos os arquivos da pasta `dist/`
- Manter a estrutura de pastas (assets, etc)

### 2. API Backend (Pasta `api/`)

**Onde subir:**
- Upload da pasta `api/` completa
- Normalmente em: `/public_html/api/` ou `/www/api/`

**Arquivos importantes:**
- `api/config/database.php` (verificar configurações do banco)
- `api/config/cors.php` (atualizado para permitir credentials)
- `api/auth/login.php`
- `api/auth/logout.php`
- `api/auth/me.php`
- `api/users/index.php`
- `api/test.php` (pode remover depois de testar)

### 3. Arquivos que NÃO Precisam Ser Enviados

- `.env` (não precisa subir, é apenas local)
- `node_modules/`
- `src/` (código fonte, já compilado em `dist/`)
- Arquivos `.md` de documentação

## 🚀 Passo a Passo

### 1. Fazer Build do Frontend

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados.

### 2. Verificar Build

Certifique-se de que a pasta `dist/` foi criada e contém:
- `index.html`
- Pasta `assets/` com JS e CSS
- Outros arquivos estáticos

### 3. Upload via FTP/SFTP

**Frontend:**
1. Conectar ao servidor via FTP
2. Navegar até a pasta do site (ex: `/public_html/`)
3. Fazer backup da pasta atual (recomendado)
4. Fazer upload de TODOS os arquivos da pasta `dist/`
5. Substituir arquivos existentes

**API:**
1. Navegar até a pasta raiz do site
2. Fazer upload da pasta `api/` completa
3. Verificar permissões (755 para pastas, 644 para arquivos)

### 4. Verificar Configurações

**API - `api/config/database.php`:**
```php
// Verificar se as configurações estão corretas
$host = 'localhost'; // ou IP do servidor
$dbname = 'supernerds3';
$username = 'seu_usuario';
$password = 'sua_senha';
```

**Permissões:**
```bash
# No servidor (via SSH, se tiver acesso)
chmod 755 api/
chmod 644 api/**/*.php
```

## 🧪 Testar Após Upload

1. **Acessar o site**: `https://www.novaedubncc.com.br`
2. **Testar login**:
   - Usuário: `marcus.lopes`
   - Senha: `?&,6bsMrD08a`
3. **Verificar console do navegador** (F12) para erros
4. **Testar API diretamente**: `https://www.novaedubncc.com.br/api/test.php`

## ⚠️ Observações Importantes

1. **Variável de Ambiente**: O `.env` não precisa ser enviado. O código já tem a URL padrão da API.

2. **CORS**: Certifique-se de que o CORS está configurado corretamente em `api/config/cors.php`

3. **Sessões PHP**: As sessões devem funcionar automaticamente se o PHP estiver configurado corretamente.

4. **Backup**: Sempre faça backup antes de substituir arquivos!

## 🔍 Troubleshooting

### Erro 404 na API
- Verificar se a pasta `api/` está no local correto
- Verificar se o `.htaccess` está configurado

### Erro CORS
- Verificar `api/config/cors.php`
- Verificar se o domínio está na lista de origens permitidas

### Login não funciona
- Verificar console do navegador (F12)
- Verificar se a API está respondendo: `https://www.novaedubncc.com.br/api/test.php`
- Verificar se o usuário existe no banco de dados

---

**💡 Dica**: Use um cliente FTP como FileZilla ou WinSCP para facilitar o upload!
