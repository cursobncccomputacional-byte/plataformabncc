/**
 * Script para listar todos os arquivos e pastas do projeto
 * Útil para comparar com o servidor e verificar o que falta
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(date) {
  return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0];
}

function listFiles(dir, baseDir = dir, level = 0, output = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    const stats = fs.statSync(fullPath);
    
    if (item.isDirectory()) {
      output.push({
        type: 'folder',
        path: relativePath,
        name: item.name,
        size: '-',
        modified: formatDate(stats.mtime),
        permissions: stats.mode.toString(8).slice(-3)
      });
      
      // Recursivamente listar conteúdo da pasta
      listFiles(fullPath, baseDir, level + 1, output);
    } else {
      output.push({
        type: 'file',
        path: relativePath,
        name: item.name,
        size: formatBytes(stats.size),
        sizeBytes: stats.size,
        modified: formatDate(stats.mtime),
        permissions: stats.mode.toString(8).slice(-3)
      });
    }
  });
  
  return output;
}

function generateReport(directory, outputFile) {
  console.log(`\n${colors.bright}${colors.blue}📋 Gerando relatório de arquivos...${colors.reset}\n`);
  console.log(`Diretório: ${directory}\n`);
  
  if (!fs.existsSync(directory)) {
    console.error(`${colors.red}❌ Diretório não encontrado: ${directory}${colors.reset}`);
    return;
  }
  
  const files = listFiles(directory);
  
  // Ordenar: pastas primeiro, depois arquivos, ambos por nome
  files.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.path.localeCompare(b.path);
  });
  
  // Gerar relatório em texto
  let report = `# Relatório de Arquivos - ${new Date().toLocaleString('pt-BR')}\n\n`;
  report += `Diretório: ${directory}\n`;
  report += `Total: ${files.length} itens\n\n`;
  report += `| Tipo | Caminho | Nome | Tamanho | Modificado | Permissões |\n`;
  report += `|------|---------|------|---------|------------|------------|\n`;
  
  files.forEach(item => {
    const icon = item.type === 'folder' ? '📁' : '📄';
    report += `| ${icon} ${item.type} | ${item.path} | ${item.name} | ${item.size} | ${item.modified} | ${item.permissions} |\n`;
  });
  
  // Salvar relatório
  fs.writeFileSync(outputFile, report, 'utf8');
  console.log(`${colors.green}✅ Relatório salvo em: ${outputFile}${colors.reset}\n`);
  
  // Estatísticas
  const folders = files.filter(f => f.type === 'folder').length;
  const fileCount = files.filter(f => f.type === 'file').length;
  const totalSize = files
    .filter(f => f.type === 'file' && f.sizeBytes)
    .reduce((sum, f) => sum + f.sizeBytes, 0);
  
  console.log(`${colors.bright}📊 Estatísticas:${colors.reset}`);
  console.log(`   Pastas: ${folders}`);
  console.log(`   Arquivos: ${fileCount}`);
  console.log(`   Tamanho total: ${formatBytes(totalSize)}\n`);
  
  // Listar arquivos grandes (> 500 KB)
  const largeFiles = files
    .filter(f => f.type === 'file' && f.sizeBytes > 500 * 1024)
    .sort((a, b) => b.sizeBytes - a.sizeBytes);
  
  if (largeFiles.length > 0) {
    console.log(`${colors.yellow}⚠️  Arquivos grandes (> 500 KB):${colors.reset}`);
    largeFiles.forEach(f => {
      console.log(`   ${f.path} - ${f.size}`);
    });
    console.log('');
  }
  
  // Gerar JSON também
  const jsonFile = outputFile.replace('.md', '.json');
  fs.writeFileSync(jsonFile, JSON.stringify(files, null, 2), 'utf8');
  console.log(`${colors.green}✅ JSON salvo em: ${jsonFile}${colors.reset}\n`);
  
  return files;
}

// Executar
const distDir = path.join(__dirname, '..', 'dist');
const apiDir = path.join(__dirname, '..', 'api');
const outputDist = path.join(__dirname, '..', 'relatorio-dist.md');
const outputApi = path.join(__dirname, '..', 'relatorio-api.md');

console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════${colors.reset}`);
console.log(`${colors.bright}${colors.blue}  Listador de Arquivos - Plataforma BNCC${colors.reset}`);
console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════${colors.reset}`);

// Listar dist/
if (fs.existsSync(distDir)) {
  generateReport(distDir, outputDist);
} else {
  console.log(`${colors.yellow}⚠️  Pasta dist/ não encontrada${colors.reset}\n`);
}

// Listar api/
if (fs.existsSync(apiDir)) {
  generateReport(apiDir, outputApi);
} else {
  console.log(`${colors.yellow}⚠️  Pasta api/ não encontrada${colors.reset}\n`);
}

console.log(`${colors.green}✅ Processo concluído!${colors.reset}\n`);
