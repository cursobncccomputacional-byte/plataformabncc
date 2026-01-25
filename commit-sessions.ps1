# Script PowerShell para fazer commit das alterações do sistema de sessões

Write-Host "Adicionando arquivos do sistema de sessões..." -ForegroundColor Green

# Scripts SQL
git add .sql/create-sessions-table.sql
git add .sql/add-criado-por-field.sql
git add .sql/add-admin-limits.sql

# API de sessões
git add api/sessions/

# Serviços e componentes frontend
git add src/services/sessionService.ts
git add src/pages/SessionManagement.tsx

# Modificações nos endpoints de autenticação
git add api/auth/login.php
git add api/auth/logout.php

# Modificações no contexto e páginas
git add src/contexts/LocalAuthContext.tsx
git add src/pages/Reports.tsx
git add src/App.tsx
git add src/pages/Dashboard.tsx
git add src/components/Sidebar.tsx
git add src/pages/RootManagement.tsx

# Outros arquivos relacionados
git add src/pages/ManageAdminPackages.tsx
git add src/pages/UserManagement.tsx
git add src/types/bncc.ts
git add package.json

Write-Host "Fazendo commit..." -ForegroundColor Green
git commit -m "feat: Implementa sistema de gerenciamento de sessões

- Adiciona tabelas sessoes e atividades_sessao no banco de dados
- Cria API completa para registro e consulta de sessões
- Implementa componente SessionManagement para visualização de sessões
- Corrige relatórios para usar dados reais da API
- Melhora sistema de inatividade com registro automático de logout
- Adiciona filtros por criado_por para admin ver apenas seus usuários
- Root vê todas as sessões, admin vê apenas dos usuários que criou"

Write-Host "Fazendo push..." -ForegroundColor Green
git push origin master

Write-Host "Concluído!" -ForegroundColor Green
