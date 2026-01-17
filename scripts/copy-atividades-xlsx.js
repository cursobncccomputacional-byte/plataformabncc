import fs from 'node:fs';
import path from 'node:path';

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function copyFileSyncSafe(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const projectRoot = process.cwd();
const distPath = path.join(projectRoot, 'dist');
const dest = path.join(distPath, 'atividades.xlsx');

const candidates = [
  path.join(projectRoot, 'atividades.xlsx'),
  path.join(projectRoot, 'public', 'atividades.xlsx'),
];

if (!exists(distPath)) {
  console.warn('[copy-atividades-xlsx] Pasta dist/ não encontrada. Rode o build primeiro.');
  process.exit(0);
}

const source = candidates.find(exists);

if (!source) {
  console.warn(
    '[copy-atividades-xlsx] Nenhum atividades.xlsx encontrado na raiz do projeto ou em public/. Nada para copiar.'
  );
  process.exit(0);
}

copyFileSyncSafe(source, dest);
console.log(`[copy-atividades-xlsx] Copiado: ${path.relative(projectRoot, source)} -> ${path.relative(projectRoot, dest)}`);

