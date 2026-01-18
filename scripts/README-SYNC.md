# Script de Sincronização Excel → Banco de Dados

Este script sincroniza as atividades do arquivo Excel (`atividades.xlsx`) para o banco de dados MySQL.

## Pré-requisitos

1. **Arquivo de configuração do banco**: `config-database.php` na raiz do projeto
   - Copie `config-database.php.example` para `config-database.php`
   - Configure host, database, username e password

2. **Arquivo Excel**: `public/atividades.xlsx` (ou especifique o caminho)

## Como usar

### Opção 1: Usando npm script (recomendado)
```bash
npm run sync-activities
```

### Opção 2: Especificando caminho do Excel
```bash
npm run sync-activities -- "caminho/para/atividades.xlsx"
```

### Opção 3: Diretamente com Node
```bash
node scripts/sync-activities-to-db.js
node scripts/sync-activities-to-db.js "public/atividades.xlsx"
```

## O que o script faz

1. ✅ Lê o arquivo Excel usando o mesmo loader do frontend
2. ✅ Normaliza dados (anos, eixos, etc.)
3. ✅ Conecta ao banco de dados MySQL
4. ✅ Atualiza estrutura da tabela se necessário (adiciona `axis_ids`, `pedagogical_pdf_url`, `material_pdf_url`)
5. ✅ Insere novas atividades ou atualiza existentes (baseado no `id`)
6. ✅ Mostra resumo: inseridas, atualizadas, erros

## Estrutura da tabela

O script automaticamente adiciona colunas se não existirem:
- `axis_ids` (JSON): Array de IDs dos eixos BNCC (suporta múltiplos)
- `pedagogical_pdf_url` (VARCHAR): URL do PDF da estrutura pedagógica
- `material_pdf_url` (VARCHAR): URL do PDF do material da aula

## Fluxo de trabalho recomendado

1. **Editar Excel**: Atualize `public/atividades.xlsx` com novas atividades
2. **Validar**: `npm run validate-xlsx` (opcional, mas recomendado)
3. **Sincronizar**: `npm run sync-activities`
4. **Build**: `npm run build` (para atualizar o frontend)

## Exemplo de saída

```
🔄 Iniciando sincronização de atividades...

📊 Conectando ao banco: supernerds3@localhost
📄 Lendo Excel: public/atividades.xlsx

✅ 3 atividades carregadas do Excel

✅ Conectado ao banco de dados

🔧 Adicionando coluna axis_ids...
🔧 Adicionando coluna pedagogical_pdf_url...
🔧 Adicionando coluna material_pdf_url...

📊 Resumo da sincronização:
   ✅ Inseridas: 3
   🔄 Atualizadas: 0
   ❌ Erros: 0
   📦 Total: 3

✅ Sincronização concluída com sucesso!
```

## Troubleshooting

### Erro: "Arquivo config-database.php não encontrado"
- Copie `config-database.php.example` para `config-database.php`
- Configure as credenciais do banco

### Erro: "Arquivo atividades.xlsx não encontrado"
- Coloque o arquivo em `public/atividades.xlsx`
- Ou especifique o caminho: `npm run sync-activities -- "caminho/arquivo.xlsx"`

### Erro de conexão com banco
- Verifique as credenciais em `config-database.php`
- Verifique se o MySQL está rodando
- Verifique se o banco de dados existe
