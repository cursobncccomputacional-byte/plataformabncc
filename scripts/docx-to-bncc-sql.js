/**
 * Extrai texto do Word (.docx), parseia linhas no formato (CODIGO) Descrição
 * e gera um arquivo .sql com INSERTs para bncc_computacional.
 *
 * Uso:
 *   node scripts/docx-to-bncc-sql.js Base-Dados-Habilidades.docx
 *   node scripts/docx-to-bncc-sql.js Base-Dados-Habilidades.docx --output=.sql/bncc-inserts.sql
 *   node scripts/docx-to-bncc-sql.js Base-Dados-Habilidades.docx --eixo="Pensamento Computacional"
 *
 * Se o documento tiver títulos de seção "Pensamento Computacional", "Mundo Digital" ou
 * "Cultura Digital", o script usa como eixo para as habilidades seguintes.
 * Caso contrário, use --eixo= para definir um eixo único.
 *
 * Pré-requisito: npm install (mammoth é usado para ler .docx)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mammoth from 'mammoth';

const REGEX_LINHA = /^\s*\(([A-Z0-9]+)\)\s*(.+)\s*$/;
const EIXOS_BNCC = ['Pensamento Computacional', 'Mundo Digital', 'Cultura Digital'];

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

function escapeSql(str) {
  if (str == null) return 'NULL';
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

function idDeterministico(codigo) {
  return crypto.createHash('md5').update(codigo).digest('hex').slice(0, 36);
}

/**
 * Extrai texto do .docx usando mammoth.
 */
async function extrairTextoDocx(caminho) {
  const buffer = fs.readFileSync(caminho);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Parseia o texto: linhas (CODIGO) Descrição e opcionalmente títulos de eixo.
 */
function parsearTexto(conteudo, eixoPadrao) {
  const linhas = conteudo.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const resultado = [];
  let eixoAtual = eixoPadrao || 'Pensamento Computacional';

  for (const linha of linhas) {
    const eixoEncontrado = EIXOS_BNCC.find((e) => linha === e || linha.startsWith(e));
    if (eixoEncontrado && linha.length < 100) {
      eixoAtual = eixoEncontrado;
      continue;
    }
    const m = linha.match(REGEX_LINHA);
    if (!m) continue;
    const codigo = m[1].trim();
    const descricao = m[2].trim();
    const inf = inferirAnoDoCodigo(codigo);
    if (!inf) continue;
    resultado.push({
      id: idDeterministico(codigo),
      codigo_habilidade: codigo,
      habilidade: descricao,
      tipo_nivel: inf.tipo_nivel,
      ano_etapa: inf.ano_etapa,
      eixo: eixoAtual,
    });
  }
  return resultado;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let arquivo = null;
  let output = null;
  let eixoPadrao = 'Pensamento Computacional';
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--output=')) {
      output = args[i].replace(/^--output=/, '').replace(/^["']|["']$/g, '');
    } else if (args[i].startsWith('--eixo=')) {
      eixoPadrao = args[i].replace(/^--eixo=/, '').replace(/^["']|["']$/g, '');
    } else if (!args[i].startsWith('--')) {
      arquivo = args[i];
    }
  }
  return { arquivo, output, eixoPadrao };
}

function gerarSql(linhas) {
  const header = `-- =====================================================
-- INSERTs BNCC Computacional Digital
-- Gerado por scripts/docx-to-bncc-sql.js
-- Execute após: create-bncc-computacional.sql e add-codigo-habilidade-bncc.sql
-- INSERT IGNORE: pode rodar de novo sem duplicar registros (mesmo código = mesmo id).
-- =====================================================

`;
  const inserts = linhas.map((row, i) => {
    const ordem = i + 1;
    return `INSERT IGNORE INTO bncc_computacional (id, tipo_nivel, ano_etapa, codigo_habilidade, habilidade, eixo, ordem) VALUES (${escapeSql(row.id)}, ${escapeSql(row.tipo_nivel)}, ${escapeSql(row.ano_etapa)}, ${escapeSql(row.codigo_habilidade)}, ${escapeSql(row.habilidade)}, ${escapeSql(row.eixo)}, ${ordem});`;
  });
  return header + inserts.join('\n') + '\n';
}

async function main() {
  const { arquivo, output, eixoPadrao } = parseArgs();
  const candidatos = arquivo
    ? [path.resolve(process.cwd(), arquivo)]
    : [
        path.join(process.cwd(), 'Base-Dados-Habilidades.docx'),
        path.join(process.cwd(), 'Base-Dados-Habilidades.doc'),
      ];

  let caminho = null;
  for (const c of candidatos) {
    if (fs.existsSync(c)) {
      caminho = c;
      break;
    }
  }

  if (!caminho) {
    console.error('❌ Arquivo Word não encontrado.');
    console.error('   Use: node scripts/docx-to-bncc-sql.js Base-Dados-Habilidades.docx [--output=.sql/bncc-inserts.sql] [--eixo="Pensamento Computacional"]');
    process.exit(1);
  }

  const ext = path.extname(caminho).toLowerCase();
  let texto;
  if (ext === '.docx' || ext === '.doc') {
    console.log('📄 Lendo Word:', path.relative(process.cwd(), caminho));
    try {
      texto = await extrairTextoDocx(caminho);
    } catch (err) {
      console.error('❌ Erro ao ler .docx. Execute: npm install');
      console.error('   Detalhe:', err.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Arquivo deve ser .docx');
    process.exit(1);
  }

  const habilidades = parsearTexto(texto, eixoPadrao);
  if (habilidades.length === 0) {
    console.error('❌ Nenhuma linha no formato (CODIGO) Descrição encontrada.');
    console.error('   Exemplo: (EI03CO01) Reconhecer padrão de repetição em sequência de sons, movimentos, desenhos.');
    process.exit(1);
  }

  console.log(`✅ ${habilidades.length} habilidades extraídas.`);

  const sql = gerarSql(habilidades);
  const outPath = output
    ? path.resolve(process.cwd(), output)
    : path.join(process.cwd(), '.sql', 'bncc-computacional-inserts.sql');
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`📁 SQL gerado: ${path.relative(process.cwd(), outPath)}`);
  console.log('\nExecute no MySQL: source ' + outPath.replace(/\\/g, '/') + ' (ou copie e cole no seu cliente SQL).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
