/**
 * Script para importar habilidades BNCC Computacional a partir de arquivo de texto ou TSV.
 *
 * Formato 1 – Arquivo .txt (uma habilidade por linha):
 *   (EI03CO01) Reconhecer padrão de repetição em sequência de sons, movimentos, desenhos.
 *   (EF01CO01) Outra descrição aqui.
 * Use: node scripts/import-bncc-habilidades.js Base-Dados-Habilidades.txt --eixo="Pensamento Computacional"
 *
 * Formato 2 – Arquivo .tsv (colunas: ano_etapa, eixo, codigo, descricao):
 *   Educação Infantil	Pensamento Computacional	EI03CO01	Reconhecer padrão...
 *   1º Ano	Mundo Digital	EF01CO01	Descrição...
 * Use: node scripts/import-bncc-habilidades.js Base-Dados-Habilidades.tsv
 *
 * Pré-requisitos:
 * - Executar antes: .sql/create-bncc-computacional.sql e .sql/add-codigo-habilidade-bncc.sql
 * - config-database.php na raiz do projeto
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mysql from 'mysql2/promise';

const REGEX_LINHA = /^\s*\(([A-Z0-9]+)\)\s*(.+)\s*$/;

const ANO_POR_CODIGO = {
  EI: { tipo_nivel: 'educacao_infantil', ano_etapa: 'Educação Infantil' },
  EF01: { tipo_nivel: 'fundamental', ano_etapa: '1º Ano' },
  EF02: { tipo_nivel: 'fundamental', ano_etapa: '2º Ano' },
  EF03: { tipo_nivel: 'fundamental', ano_etapa: '3º Ano' },
  EF04: { tipo_nivel: 'fundamental', ano_etapa: '4º Ano' },
  EF05: { tipo_nivel: 'fundamental', ano_etapa: '5º Ano' },
  EF06: { tipo_nivel: 'fundamental', ano_etapa: '6º Ano' },
  EF07: { tipo_nivel: 'fundamental', ano_etapa: '7º Ano' },
  EF08: { tipo_nivel: 'fundamental', ano_etapa: '8º Ano' },
  EF09: { tipo_nivel: 'fundamental', ano_etapa: '9º Ano' },
};

function inferirAnoDoCodigo(codigo) {
  const upper = (codigo || '').toUpperCase();
  if (upper.startsWith('EI')) return ANO_POR_CODIGO.EI;
  for (let i = 1; i <= 9; i++) {
    const key = `EF0${i}`;
    if (upper.startsWith(key)) return ANO_POR_CODIGO[key];
  }
  return null;
}

function loadDatabaseConfig() {
  const configPath = path.join(process.cwd(), 'config-database.php');
  if (!fs.existsSync(configPath)) {
    console.error('❌ Arquivo config-database.php não encontrado!');
    process.exit(1);
  }
  const content = fs.readFileSync(configPath, 'utf8');
  const hostMatch = content.match(/'host'\s*=>\s*'([^']+)'/);
  const dbnameMatch = content.match(/'dbname'\s*=>\s*'([^']+)'/);
  const usernameMatch = content.match(/'username'\s*=>\s*'([^']+)'/);
  const passwordMatch = content.match(/'password'\s*=>\s*'([^']+)'/);
  if (!hostMatch || !dbnameMatch || !usernameMatch || !passwordMatch) {
    console.error('❌ Erro ao ler configuração do banco de dados!');
    process.exit(1);
  }
  return {
    host: hostMatch[1],
    database: dbnameMatch[1],
    user: usernameMatch[1],
    password: passwordMatch[1],
  };
}

/**
 * Lê arquivo .txt: uma linha por habilidade no formato "(CODIGO) Descrição."
 * Retorna array de { codigo_habilidade, habilidade, tipo_nivel, ano_etapa, eixo }.
 */
function parsearTxt(conteudo, eixoPadrao) {
  const linhas = conteudo.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const resultado = [];
  for (const linha of linhas) {
    const m = linha.match(REGEX_LINHA);
    if (!m) {
      console.warn('⚠️  Linha ignorada (formato esperado: (CODIGO) Descrição):', linha.slice(0, 60) + (linha.length > 60 ? '...' : ''));
      continue;
    }
    const codigo = m[1].trim();
    const descricao = m[2].trim();
    const inf = inferirAnoDoCodigo(codigo);
    if (!inf) {
      console.warn('⚠️  Código não reconhecido (EI ou EF01–EF09):', codigo);
      continue;
    }
    resultado.push({
      codigo_habilidade: codigo,
      habilidade: descricao,
      tipo_nivel: inf.tipo_nivel,
      ano_etapa: inf.ano_etapa,
      eixo: eixoPadrao || 'Pensamento Computacional',
    });
  }
  return resultado;
}

/**
 * Lê arquivo .tsv: colunas ano_etapa, eixo, codigo, descricao (ou codigo na 3ª e descrição na 4ª).
 */
function parsearTsv(conteudo) {
  const linhas = conteudo.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const resultado = [];
  for (let i = 0; i < linhas.length; i++) {
    const cols = linhas[i].split(/\t/).map((c) => c.trim());
    if (cols.length < 4) {
      console.warn('⚠️  Linha TSV ignorada (esperado: ano_etapa\teixo\tcodigo\tdescricao):', linhas[i].slice(0, 60) + '...');
      continue;
    }
    const [ano_etapa, eixo, codigo, ...rest] = cols;
    const descricao = rest.join('\t').trim();
    const inf = inferirAnoDoCodigo(codigo);
    const tipo_nivel = inf ? inf.tipo_nivel : (ano_etapa === 'Educação Infantil' ? 'educacao_infantil' : 'fundamental');
    const ano = inf ? inf.ano_etapa : ano_etapa;
    resultado.push({
      codigo_habilidade: codigo,
      habilidade: descricao,
      tipo_nivel,
      ano_etapa: ano,
      eixo: eixo || 'Pensamento Computacional',
    });
  }
  return resultado;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let arquivo = null;
  let eixoPadrao = 'Pensamento Computacional';
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--eixo=')) {
      eixoPadrao = args[i].replace(/^--eixo=/, '').replace(/^["']|["']$/g, '');
    } else if (!args[i].startsWith('--')) {
      arquivo = path.resolve(process.cwd(), args[i]);
    }
  }
  return { arquivo, eixoPadrao };
}

async function main() {
  console.log('🔄 Importação de habilidades BNCC Computacional\n');

  const { arquivo, eixoPadrao } = parseArgs();
  const candidatos = arquivo
    ? [arquivo]
    : [
        path.join(process.cwd(), 'Base-Dados-Habilidades.txt'),
        path.join(process.cwd(), 'Base-Dados-Habilidades.tsv'),
      ];

  let caminho = null;
  for (const c of candidatos) {
    if (fs.existsSync(c)) {
      caminho = c;
      break;
    }
  }

  if (!caminho) {
    console.error('❌ Nenhum arquivo encontrado.');
    console.error('   Use: node scripts/import-bncc-habilidades.js <arquivo.txt ou .tsv> [--eixo="Nome do Eixo"]');
    console.error('   Ou coloque Base-Dados-Habilidades.txt (ou .tsv) na raiz do projeto.');
    process.exit(1);
  }

  const ext = path.extname(caminho).toLowerCase();
  const conteudo = fs.readFileSync(caminho, 'utf8');
  const habilidades =
    ext === '.tsv'
      ? parsearTsv(conteudo)
      : parsearTxt(conteudo, eixoPadrao);

  if (habilidades.length === 0) {
    console.error('❌ Nenhuma habilidade válida encontrada no arquivo.');
    process.exit(1);
  }

  console.log(`📄 Arquivo: ${path.relative(process.cwd(), caminho)}`);
  console.log(`✅ ${habilidades.length} habilidades parseadas.\n`);

  const dbConfig = loadDatabaseConfig();
  let conn;
  try {
    conn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      charset: 'utf8mb4',
    });
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }

  const checkSql = 'SELECT 1 FROM bncc_computacional WHERE codigo_habilidade = ? LIMIT 1';
  const insertSql = `
    INSERT INTO bncc_computacional (id, tipo_nivel, ano_etapa, codigo_habilidade, habilidade, eixo, ordem)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  let inseridas = 0;
  let ignoradas = 0;

  for (let i = 0; i < habilidades.length; i++) {
    const row = habilidades[i];
    const [rows] = await conn.execute(checkSql, [row.codigo_habilidade]);
    if (rows.length > 0) {
      ignoradas++;
      continue;
    }
    const id = crypto.randomUUID ? crypto.randomUUID() : Buffer.from(`${row.codigo_habilidade}-${Date.now()}-${i}`).toString('base64').replace(/[+/=]/g, '').slice(0, 36);
    try {
      await conn.execute(insertSql, [
        id,
        row.tipo_nivel,
        row.ano_etapa,
        row.codigo_habilidade,
        row.habilidade,
        row.eixo,
        i + 1,
      ]);
      inseridas++;
      if (inseridas <= 5) console.log(`   Inserida: ${row.codigo_habilidade} – ${row.habilidade.slice(0, 50)}...`);
    } catch (e) {
      console.warn('⚠️  Erro ao inserir', row.codigo_habilidade, e.message);
    }
  }

  console.log(`\n✅ Concluído: ${inseridas} inseridas, ${ignoradas} ignoradas (já existiam).`);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
