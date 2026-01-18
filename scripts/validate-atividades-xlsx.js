import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';

function normalizeHeaderKey(v) {
  return String(v ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove acentos
}

function pickFirstExisting(paths) {
  for (const p of paths) {
    if (!p) continue;
    try {
      fs.accessSync(p, fs.constants.F_OK);
      return p;
    } catch {
      // ignore
    }
  }
  return null;
}

const projectRoot = process.cwd();
const argvPath = process.argv[2];
const candidatePaths = [
  argvPath ? path.resolve(projectRoot, argvPath) : null,
  path.join(projectRoot, 'atividades.xlsx'),
  path.join(projectRoot, 'public', 'atividades.xlsx'),
  path.join(projectRoot, 'dist', 'atividades.xlsx'),
].filter(Boolean);

const filePath = pickFirstExisting(candidatePaths);
if (!filePath) {
  console.error('[validate-atividades-xlsx] Nenhum arquivo encontrado.');
  console.error(
    `- Tente: node scripts/validate-atividades-xlsx.js "caminho/para/atividades.xlsx"\n- Ou coloque em: ./atividades.xlsx ou ./public/atividades.xlsx`
  );
  process.exit(1);
}

const requiredHeaders = ['id', 'titulo', 'tipo'];
const usedHeaders = [
  'id',
  'titulo',
  'descricao',
  'tipo',
  'anos',
  'eixo',
  'objeto',
  'duracao_min',
  'dificuldade',
  'thumb_url',
  'video_url',
  'pdf_estrutura_url',
  'pdf_material_url',
];

const buf = fs.readFileSync(filePath);
const wb = XLSX.read(buf, { type: 'buffer' });
const sheetName = wb.SheetNames[0];
if (!sheetName) {
  console.error('[validate-atividades-xlsx] Planilha sem abas (SheetNames vazio).');
  process.exit(1);
}

const ws = wb.Sheets[sheetName];
const headerRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
const headerRow = Array.isArray(headerRows) && Array.isArray(headerRows[0]) ? headerRows[0] : [];
const headers = headerRow.map((h) => String(h ?? '').trim()).filter(Boolean);
const headersNorm = new Map(headers.map((h) => [normalizeHeaderKey(h), h]));

const missingRequired = requiredHeaders.filter((h) => !headersNorm.has(h));
const missingUsed = usedHeaders.filter((h) => !headersNorm.has(h));

const extraHeaders = headers.filter((h) => !usedHeaders.includes(normalizeHeaderKey(h)));

console.log(`[validate-atividades-xlsx] Arquivo: ${path.relative(projectRoot, filePath)}`);
console.log(`[validate-atividades-xlsx] Aba: ${sheetName}`);
console.log(`[validate-atividades-xlsx] Colunas detectadas (${headers.length}): ${headers.join(', ')}`);

if (missingRequired.length) {
  console.log('');
  console.error(`❌ Faltando colunas obrigatórias para importar: ${missingRequired.join(', ')}`);
  // Heurística: sugerir cabeçalhos parecidos (acentos/caixa)
  for (const req of missingRequired) {
    const found = headers.find((h) => normalizeHeaderKey(h) === req);
    if (found) {
      console.error(`- Você tem "${found}", mas o sistema espera exatamente "${req}" (sem acento/maiúsculas).`);
    }
  }
} else {
  console.log(`✅ Colunas obrigatórias presentes: ${requiredHeaders.join(', ')}`);
}

if (missingUsed.length) {
  console.log(`⚠️  Colunas não encontradas (opcionais, mas usadas pelo sistema): ${missingUsed.join(', ')}`);
}

if (extraHeaders.length) {
  console.log(
    `ℹ️  Colunas extras detectadas (não quebram; hoje o sistema simplesmente ignora): ${extraHeaders.join(', ')}`
  );
}

// Validar linhas como o app faz (regras principais do parseActivitiesFromSheet)
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
let ok = 0;
let skipped = 0;
const problems = [];

for (let i = 0; i < rows.length; i++) {
  const r = rows[i] ?? {};

  // A biblioteca usa os cabeçalhos originais como chaves.
  // Para validação, tentamos acessar pelo nome exato esperado, mas também aceitamos
  // cabeçalhos equivalentes (ex: "Título") e alertamos acima.
  const get = (key) => {
    const direct = r[key];
    if (direct !== undefined) return direct;
    const original = headersNorm.get(key);
    return original ? r[original] : undefined;
  };

  const id = String(get('id') ?? '').trim();
  const titulo = String(get('titulo') ?? '').trim();
  const tipo = String(get('tipo') ?? '').trim().toLowerCase();
  const dificuldade = String(get('dificuldade') ?? '').trim().toLowerCase();

  const reasons = [];
  if (!id) reasons.push('id vazio');
  if (!titulo) reasons.push('titulo vazio');
  if (tipo !== 'plugada' && tipo !== 'desplugada') reasons.push('tipo inválido (use "plugada" ou "desplugada")');
  if (dificuldade && !['facil', 'medio', 'dificil'].includes(dificuldade)) {
    reasons.push('dificuldade inválida (use "facil", "medio" ou "dificil")');
  }

  if (reasons.length) {
    skipped++;
    // +2 por causa do cabeçalho e do index 0
    problems.push({ linhaExcel: i + 2, id, titulo, reasons });
  } else {
    ok++;
  }
}

console.log('');
console.log(`[validate-atividades-xlsx] Linhas: ${rows.length} | Importadas pelo app: ${ok} | Ignoradas: ${skipped}`);

if (problems.length) {
  console.log('');
  console.log('Detalhes das linhas ignoradas:');
  for (const p of problems.slice(0, 30)) {
    const label = p.id ? `id=${p.id}` : p.titulo ? `titulo=${p.titulo}` : 'sem id/titulo';
    console.log(`- Linha ${p.linhaExcel} (${label}): ${p.reasons.join('; ')}`);
  }
  if (problems.length > 30) {
    console.log(`... (+${problems.length - 30} outras)`);
  }
}

process.exit(missingRequired.length ? 2 : 0);

