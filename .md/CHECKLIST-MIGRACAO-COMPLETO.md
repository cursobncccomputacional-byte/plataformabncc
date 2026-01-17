# ✅ Checklist Completo: Migração para Business Web Hosting

## 📋 Fase 1: Preparação (Antes de Receber Credenciais)

### Backup
- [ ] Fazer backup completo dos arquivos (Hostnet)
- [ ] Export do banco de dados (se houver)
- [ ] Salvar configurações atuais
- [ ] Documentar URLs e caminhos

### Preparar Arquivos
- [ ] Fazer build do frontend (`npm run build`)
- [ ] Verificar pasta `dist/` está completa
- [ ] Verificar pasta `api/` está completa
- [ ] Preparar scripts SQL do banco
- [ ] Verificar `.htaccess` está atualizado

### Documentação
- [ ] Listar todos os arquivos necessários
- [ ] Documentar estrutura de pastas
- [ ] Preparar credenciais que precisará

---

## 📋 Fase 2: Configuração Inicial (Ao Receber Credenciais)

### Acesso
- [ ] Receber credenciais FTP
- [ ] Receber credenciais do painel
- [ ] Receber credenciais do PHPMyAdmin
- [ ] Testar acesso FTP
- [ ] Testar acesso ao painel

### Verificações
- [ ] Confirmar PHP está habilitado
- [ ] Confirmar MySQL está disponível
- [ ] Verificar versão do PHP
- [ ] Verificar extensões PHP necessárias
- [ ] Confirmar .htaccess está permitido

### Banco de Dados
- [ ] Criar banco de dados MySQL
- [ ] Criar usuário do banco
- [ ] Anotar credenciais do banco
- [ ] Testar conexão ao banco

---

## 📋 Fase 3: Upload de Arquivos

### Estrutura de Pastas
- [ ] Criar pasta principal (se necessário)
- [ ] Criar pasta `api/`
- [ ] Criar pasta `assets/`
- [ ] Criar pasta `images/`
- [ ] Criar pasta `pdf/`
- [ ] Criar pasta `logo/`

### Upload Frontend
- [ ] Upload de `index.html`
- [ ] Upload de `index.php` (se usar)
- [ ] Upload de `.htaccess`
- [ ] Upload da pasta `assets/` completa
- [ ] Verificar permissões (644 para arquivos)

### Upload API
- [ ] Upload da pasta `api/` completa
- [ ] Upload de `api/.htaccess`
- [ ] Upload de `api/config/`
- [ ] Upload de `api/auth/`
- [ ] Upload de `api/users/`
- [ ] Verificar permissões (644 para arquivos)

### Upload Recursos
- [ ] Upload da pasta `images/`
- [ ] Upload da pasta `pdf/`
- [ ] Upload da pasta `logo/`
- [ ] Verificar permissões (755 para pastas)

---

## 📋 Fase 4: Configuração

### Banco de Dados
- [ ] Executar `database-structure.sql`
- [ ] Executar `database-insert-root-user.sql`
- [ ] Verificar tabelas foram criadas
- [ ] Verificar usuários foram criados

### API
- [ ] Atualizar `api/config/database.php` com credenciais
- [ ] Testar conexão ao banco
- [ ] Verificar CORS está configurado
- [ ] Verificar autenticação está configurada

### .htaccess
- [ ] Verificar `.htaccess` está no lugar certo
- [ ] Verificar permissões (644)
- [ ] Testar se está funcionando

### Domínio e SSL
- [ ] Configurar domínio (se necessário)
- [ ] Configurar SSL/HTTPS
- [ ] Verificar certificado está ativo
- [ ] Testar acesso via HTTPS

---

## 📋 Fase 5: Testes

### Testes Básicos
- [ ] Site carrega: `https://www.novaedubncc.com.br/`
- [ ] PHP funciona: `https://www.novaedubncc.com.br/test-direto.php`
- [ ] API funciona: `https://www.novaedubncc.com.br/novaedu/api/test.php`
- [ ] Assets carregam (JS, CSS)
- [ ] Imagens carregam

### Testes de Funcionalidade
- [ ] Login de professor funciona
- [ ] Login de admin funciona
- [ ] Listagem de atividades funciona
- [ ] Visualização de vídeos funciona (embed)
- [ ] Download de PDFs funciona
- [ ] Navegação entre páginas funciona

### Testes de Performance
- [ ] Tempo de carregamento aceitável
- [ ] Downloads são rápidos
- [ ] Site responsivo
- [ ] Sem erros no console

---

## 📋 Fase 6: Ajustes Finais

### Otimizações
- [ ] Configurar cache (se necessário)
- [ ] Verificar CDN está funcionando
- [ ] Otimizar consultas ao banco
- [ ] Verificar logs de erro

### Segurança
- [ ] Verificar SSL está ativo
- [ ] Verificar permissões estão corretas
- [ ] Remover arquivos de teste (se houver)
- [ ] Verificar backups automáticos

### Monitoramento
- [ ] Configurar monitoramento (se disponível)
- [ ] Verificar uso de recursos
- [ ] Documentar configurações finais

---

## 📋 Fase 7: Go Live

### Antes de Desativar Site Antigo
- [ ] Todos os testes passaram
- [ ] Performance está OK
- [ ] Funcionalidades estão OK
- [ ] Backup do site novo feito

### Migração Final
- [ ] Apontar DNS (se necessário)
- [ ] Aguardar propagação DNS
- [ ] Verificar site novo está acessível
- [ ] Monitorar por algumas horas

### Pós-Migração
- [ ] Monitorar por 24-48 horas
- [ ] Verificar logs de erro
- [ ] Coletar feedback de usuários
- [ ] Ajustar conforme necessário

---

## 🎯 Ordem Recomendada de Execução

1. **Preparação** (antes de receber credenciais)
2. **Configuração inicial** (ao receber credenciais)
3. **Upload de arquivos** (em etapas)
4. **Configuração** (banco, API, .htaccess)
5. **Testes** (tudo funcionando)
6. **Ajustes finais** (otimizações)
7. **Go live** (ativar site novo)

---

## ⚠️ Importante

- ✅ **Não desative o site antigo** até tudo estar funcionando
- ✅ **Teste tudo** antes de fazer go live
- ✅ **Tenha backup** de tudo
- ✅ **Documente** todas as configurações
- ✅ **Monitore** após migração

---

**💡 Dica**: Siga este checklist passo a passo. Não pule etapas!
