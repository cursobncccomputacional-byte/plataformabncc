# Nova Edu EAD - Plataforma de Cursos Gravados

Plataforma EAD separada para cursos gravados, inspirada em plataformas modernas de ensino a distância.

## 🎯 Características

- ✅ Banco de dados separado
- ✅ API PHP própria
- ✅ Frontend React independente
- ✅ Player de vídeo com proteção
- ✅ Sistema de progresso e certificados
- ✅ Design moderno com cores da Nova Edu

## 🚀 Instalação

```bash
cd cursos
npm install
```

## 📦 Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3002

## 🏗️ Build

```bash
npm run build
```

## 📁 Estrutura

```
cursos/
├── api/              # API PHP
│   ├── config/       # Configurações (DB, CORS, Auth)
│   ├── courses/      # Endpoint de cursos
│   ├── enrollments/  # Endpoint de inscrições
│   └── progress/     # Endpoint de progresso
├── src/
│   ├── components/   # Componentes React
│   ├── contexts/     # Context API (Auth)
│   ├── pages/        # Páginas
│   ├── services/     # Serviços (API)
│   └── types/        # TypeScript types
├── .sql/            # Scripts SQL
└── config-database-ead.php  # Config do banco
```

## 🗄️ Banco de Dados

1. Execute o script SQL: `.sql/create-ead-database.sql`
2. Configure as credenciais em `config-database-ead.php`

## 🌐 Deploy

1. Faça build: `npm run build`
2. Envie a pasta `dist/` e `api/` para o servidor
3. Configure o subdomínio `cursos.novaedubncc.com.br` para apontar para a pasta `cursos`

**Caminho no servidor:**
```
/home/u985723830/domains/novaedubncc.com.br/public_html/cursos/
```

## 📝 Notas

- Usa a mesma autenticação do projeto principal (pode ser separado depois)
- Cores da Nova Edu: #044982 (primary), #005a93 (secondary)
- Player de vídeo com salvamento automático de progresso
