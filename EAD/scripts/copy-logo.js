/**
 * Script para copiar logos do EAD para a pasta dist após o build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(__dirname, '../dist');

const logosToCopy = [
  'nova-edu-ead.png',
  'nova-edu-ead-branco.png',
  'favicon-ead.png',
  'video-ead-hero.mp4',
];

console.log('[copy-logo] Copiando logos do EAD...');

logosToCopy.forEach((logo) => {
  const source = path.join(publicDir, logo);
  const dest = path.join(distDir, logo);

  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`[copy-logo] ✅ Copiado: ${logo}`);
  } else {
    console.warn(`[copy-logo] ⚠️  Arquivo não encontrado: ${source}`);
  }
});

console.log('[copy-logo] Concluído!');
