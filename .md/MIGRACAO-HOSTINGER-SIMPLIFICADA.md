# 🚀 Migração para Hostinger - Versão Simplificada

## ✅ Vantagem: Você Já Conhece a Hostinger!

Como você já tem projetos funcionais na Hostinger, a migração será muito mais simples:
- ✅ Você já conhece o painel
- ✅ PHP já funciona (sem problemas como na Hostnet)
- ✅ Estrutura de pastas já conhecida
- ✅ Processo de upload já familiar

## 📋 Checklist Simplificado

### 1. Preparar Arquivos (Agora)

**Fazer build:**
```bash
npm run build
```

**Verificar:**
- ✅ Pasta `dist/` completa
- ✅ Pasta `api/` completa
- ✅ Scripts SQL do banco

### 2. Criar Estrutura no Hostinger

**Baseado nos seus projetos existentes:**
- Criar pasta para a plataforma (ou usar subdomínio)
- Criar banco de dados MySQL
- Anotar credenciais

### 3. Upload dos Arquivos

**Estrutura (igual seus outros projetos):**
```
/pasta-plataforma/ (ou subdomínio)
├── .htaccess
├── index.html
├── assets/
├── api/
│   ├── .htaccess
│   ├── config/
│   ├── auth/
│   └── users/
├── images/
├── pdf/
└── logo/
```

### 4. Configurar Banco de Dados

**No PHPMyAdmin (como você já faz):**
1. Criar banco de dados
2. Executar `database-structure.sql`
3. Executar `database-insert-root-user.sql`
4. Atualizar `api/config/database.php` com credenciais

### 5. Testar

**URLs:**
- Site: `https://www.novaedubncc.com.br/`
- API: `https://www.novaedubncc.com.br/api/test.php`

## 🎯 Diferenças da Hostnet

### O Que Será Mais Fácil:

✅ **PHP funciona** - Sem problemas de execução
✅ **.htaccess funciona** - Sem erros 500
✅ **Upload direto** - Processo conhecido
✅ **Banco de dados** - Mesmo processo
✅ **SSL/HTTPS** - Geralmente automático

### O Que Pode Ser Diferente:

⚠️ **Estrutura de pastas** - Verificar onde ficam os arquivos
⚠️ **Credenciais do banco** - Host pode ser diferente
⚠️ **URLs da API** - Pode precisar ajustar caminhos

## 📝 Configurações Específicas

### 1. Banco de Dados

**Atualizar `api/config/database.php`:**
```php
$db_config = [
    'host' => 'localhost', // Ou IP fornecido pela Hostinger
    'dbname' => 'nome_banco_hostinger',
    'username' => 'usuario_hostinger',
    'password' => 'senha_hostinger',
    'charset' => 'utf8mb4'
];
```

**💡 Dica**: Use o mesmo padrão dos seus outros projetos na Hostinger.

### 2. .htaccess

**Arquivo**: `dist/.htaccess`

**Como seus outros projetos funcionam?**
- Se funcionam normalmente, use o mesmo padrão
- Se precisar ajustar, faça baseado na experiência

### 3. URLs da API

**Verificar no frontend:**
- Se usa variável de ambiente, atualizar
- Se usa caminho relativo, verificar se está correto

## 🔄 Processo de Migração

### Passo 1: Preparação (Agora)
- [ ] Build do frontend
- [ ] Verificar arquivos
- [ ] Preparar scripts SQL

### Passo 2: Setup no Hostinger
- [ ] Criar pasta/subdomínio
- [ ] Criar banco de dados
- [ ] Anotar credenciais

### Passo 3: Upload
- [ ] Upload do frontend (`dist/`)
- [ ] Upload da API (`api/`)
- [ ] Upload de recursos (images, pdf, logo)

### Passo 4: Configuração
- [ ] Configurar banco (executar SQL)
- [ ] Atualizar `database.php`
- [ ] Verificar `.htaccess`

### Passo 5: Testes
- [ ] Site carrega
- [ ] API funciona
- [ ] Login funciona
- [ ] Downloads funcionam

## 💡 Aproveitando Sua Experiência

**Baseado nos seus projetos existentes:**

1. **Use o mesmo padrão de estrutura**
   - Se seus projetos ficam em subpastas, use subpasta
   - Se ficam em subdomínios, use subdomínio

2. **Use o mesmo padrão de banco**
   - Mesmo formato de nome
   - Mesmo padrão de usuário/senha

3. **Use o mesmo padrão de .htaccess**
   - Se funciona nos outros, deve funcionar aqui

4. **Use o mesmo processo de upload**
   - Mesmo cliente FTP
   - Mesma estrutura de pastas

## ⚠️ Pontos de Atenção

### 1. Espaço Disponível

**Verificar:**
- Quanto espaço já está usando
- Quanto espaço a plataforma vai usar (~100 MB inicial)
- Se 50 GB do plano Business é suficiente

### 2. Banco de Dados

**Verificar:**
- Quantos bancos já tem
- Limite do plano Business
- Se pode criar mais um banco

### 3. Domínio

**Opções:**
- Usar subdomínio (ex: `plataforma.novaedubncc.com.br`)
- Usar subpasta (ex: `novaedubncc.com.br/plataforma`)
- Usar domínio separado

## 🎯 Próximos Passos

1. **Aguardar** credenciais do plano Business
2. **Preparar** arquivos (build, verificar)
3. **Criar** estrutura no Hostinger (como seus outros projetos)
4. **Fazer upload** (mesmo processo conhecido)
5. **Configurar** banco (mesmo processo conhecido)
6. **Testar** (deve funcionar sem problemas)

## ✅ Vantagens da Migração

**Comparado com Hostnet:**
- ✅ PHP funciona (sem problemas)
- ✅ .htaccess funciona (sem erros 500)
- ✅ Processo conhecido (você já sabe fazer)
- ✅ Suporte melhor (Hostinger)
- ✅ Performance melhor (NVMe, CDN)

---

**💡 Resumo**: Como você já conhece a Hostinger, a migração será muito mais simples! Use o mesmo padrão dos seus outros projetos e tudo deve funcionar sem problemas.
