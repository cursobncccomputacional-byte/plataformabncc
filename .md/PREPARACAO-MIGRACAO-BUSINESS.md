# 🚀 Preparação: Migração para Business Web Hosting

## ✅ Decisão Tomada

**Plano contratado**: Business Web Hosting (Hostinger)
**Preço**: R$ 11,99/mês (promoção) / R$ 64,99/mês (renovação)

## 📋 Checklist de Preparação

### Antes da Migração

- [ ] **Confirmar credenciais de acesso**
  - Usuário FTP
  - Senha FTP
  - Acesso ao painel (cPanel/hPanel)
  - Acesso ao PHPMyAdmin

- [ ] **Verificar recursos incluídos**
  - PHP (versão e extensões)
  - MySQL (quantos bancos, tamanho)
  - Espaço disponível
  - Transferência/banda

- [ ] **Preparar arquivos para upload**
  - Frontend React (pasta `dist/`)
  - API PHP (pasta `api/`)
  - Banco de dados (scripts SQL)

- [ ] **Backup completo atual**
  - Fazer backup de tudo na Hostnet
  - Download de arquivos
  - Export do banco de dados (se houver)

### Durante a Migração

- [ ] **Criar estrutura de pastas**
  - `/novaedu/` (ou pasta do domínio)
  - `/novaedu/api/`
  - `/novaedu/assets/`
  - `/novaedu/images/`
  - `/novaedu/pdf/`

- [ ] **Fazer upload dos arquivos**
  - Frontend (pasta `dist/`)
  - API PHP (pasta `api/`)
  - Verificar permissões (644 para arquivos, 755 para pastas)

- [ ] **Configurar banco de dados**
  - Criar banco MySQL
  - Executar scripts SQL
  - Configurar credenciais na API

- [ ] **Configurar .htaccess**
  - Upload do `.htaccess` atualizado
  - Verificar se está funcionando

- [ ] **Configurar domínio**
  - Apontar DNS (se necessário)
  - Configurar SSL/HTTPS
  - Verificar certificado

### Após a Migração

- [ ] **Testar funcionalidades**
  - Frontend carrega?
  - API funciona?
  - Login funciona?
  - Downloads funcionam?
  - Vídeos carregam?

- [ ] **Verificar performance**
  - Tempo de carregamento
  - Velocidade de downloads
  - Responsividade

- [ ] **Monitorar recursos**
  - Uso de CPU
  - Uso de RAM
  - Uso de espaço
  - Uso de banda

## 🔧 Configurações Necessárias

### 1. Configurar Banco de Dados

**No PHPMyAdmin da Hostinger:**
1. Criar banco de dados
2. Criar usuário do banco
3. Executar scripts SQL:
   - `database-structure.sql` (ou versão em português)
   - `database-insert-root-user.sql`

**Atualizar `api/config/database.php`:**
```php
$db_config = [
    'host' => 'localhost', // Verificar com suporte
    'dbname' => 'nome_do_banco',
    'username' => 'usuario_banco',
    'password' => 'senha_banco',
    'charset' => 'utf8mb4'
];
```

### 2. Configurar .htaccess

**Arquivo**: `dist/.htaccess`
**Upload para**: Raiz do domínio (geralmente `public_html/` ou pasta do domínio)

**Verificar se:**
- ✅ PHP está sendo executado
- ✅ Arquivos estáticos carregam
- ✅ API funciona

### 3. Configurar URLs

**Atualizar URLs da API no frontend:**
- Verificar variável de ambiente
- Atualizar se necessário
- Testar chamadas à API

## 📤 Arquivos para Upload

### Estrutura Completa:

```
/novaedu/ (ou pasta do domínio)
├── .htaccess
├── index.html
├── index.php (opcional - para forçar atualização)
├── assets/
│   ├── index-*.js
│   ├── index-*.css
│   └── pdf.worker-*.mjs
├── api/
│   ├── .htaccess
│   ├── config/
│   │   ├── database.php
│   │   ├── cors.php
│   │   └── auth.php
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── me.php
│   └── users/
│       └── index.php
├── images/
├── logo/
└── pdf/
```

## 🧪 Testes Após Migração

### Teste 1: Frontend
```
https://www.novaedubncc.com.br/
```
**Esperado**: Site carrega normalmente

### Teste 2: PHP
```
https://www.novaedubncc.com.br/test-direto.php
```
**Esperado**: Mostra "PHP FUNCIONANDO DIRETO!"

### Teste 3: API
```
https://www.novaedubncc.com.br/novaedu/api/test.php
```
**Esperado**: Retorna JSON ou mensagem de sucesso

### Teste 4: Login
- Testar login de professor
- Testar login de admin
- Verificar autenticação

### Teste 5: Downloads
- Baixar PDF
- Verificar velocidade
- Verificar se arquivo está correto

## ⚠️ Pontos de Atenção

### 1. DNS e Domínio
- Pode levar 24-48 horas para propagar
- Verificar se domínio está apontado corretamente
- Configurar SSL/HTTPS

### 2. Banco de Dados
- Credenciais podem ser diferentes
- Host pode ser diferente de `localhost`
- Verificar com suporte da Hostinger

### 3. Permissões
- Arquivos: 644
- Pastas: 755
- Verificar após upload

### 4. Cache
- Limpar cache do navegador
- Aguardar alguns minutos após upload
- Testar em modo anônimo

## 📋 Informações para Solicitar ao Suporte

Quando receber as credenciais, confirme:

1. **Caminho do DocumentRoot**
   - Onde ficam os arquivos do site?
   - É `public_html/` ou outra pasta?

2. **Banco de Dados**
   - Host do MySQL (pode ser `localhost` ou IP)
   - Quantos bancos posso criar?
   - Tamanho máximo?

3. **PHP**
   - Versão disponível?
   - Extensões habilitadas?

4. **.htaccess**
   - Está habilitado?
   - Há restrições?

5. **SSL/HTTPS**
   - Certificado gratuito?
   - Auto-renovação?

## 🎯 Próximos Passos

1. **Aguardar credenciais** da Hostinger
2. **Fazer backup** completo da Hostnet
3. **Preparar arquivos** para upload
4. **Configurar banco** de dados
5. **Fazer upload** dos arquivos
6. **Testar** tudo
7. **Ajustar** conforme necessário

## 💡 Dicas

- ✅ Faça backup antes de migrar
- ✅ Teste tudo antes de desativar site antigo
- ✅ Mantenha site antigo ativo durante migração
- ✅ Teste em horário de baixo tráfego
- ✅ Tenha plano B (voltar para Hostnet se necessário)

---

**💡 Dica**: Prepare tudo antes de receber as credenciais. Assim, quando chegar, é só fazer upload e configurar!
