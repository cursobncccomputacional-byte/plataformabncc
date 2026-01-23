<?php
/**
 * Script de varredura de estrutura de arquivos
 * ATENÇÃO: Use apenas para debug. Apague este arquivo após usar!
 * 
 * Como usar:
 * 1. Envie este arquivo para a raiz do subdomínio cursos no servidor
 * 2. Acesse: https://cursos.novaedubncc.com.br/scan-arquivos.php
 * 3. Copie o resultado e apague o arquivo do servidor
 */

declare(strict_types=1);

$root = __DIR__; // diretório onde este script está
$maxDepth = 10;  // profundidade máxima de pastas

header('Content-Type: text/plain; charset=utf-8');

echo "========================================\n";
echo "SCAN DE ESTRUTURA DE ARQUIVOS\n";
echo "========================================\n";
echo "Raiz analisada: {$root}\n";
echo "Data/Hora: " . date('Y-m-d H:i:s') . "\n";
echo "========================================\n\n";

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

$files = [];
$dirs = [];

foreach ($iterator as $fileInfo) {
    $depth = $iterator->getDepth();
    if ($depth > $maxDepth) {
        continue;
    }

    $path = $fileInfo->getPathname();
    $path = str_replace('\\', '/', $path);
    
    // Ignorar alguns diretórios pesados
    if (strpos($path, '/vendor/') !== false ||
        strpos($path, '/node_modules/') !== false ||
        strpos($path, '/.git/') !== false ||
        strpos($path, '/.vscode/') !== false ||
        strpos($path, '/dist/') !== false) { // Ignorar dist para não ficar muito grande
        continue;
    }

    if ($fileInfo->isDir()) {
        $dirs[] = $path;
    } else {
        $files[] = $path;
    }
}

echo "DIRETÓRIOS ENCONTRADOS:\n";
echo "-----------------------------\n";
foreach ($dirs as $dir) {
    echo "[DIR]  {$dir}\n";
}

echo "\n\nARQUIVOS ENCONTRADOS:\n";
echo "-----------------------------\n";
foreach ($files as $file) {
    $size = filesize($file);
    $sizeStr = $size < 1024 ? "{$size}B" : ($size < 1048576 ? round($size/1024, 2) . "KB" : round($size/1048576, 2) . "MB");
    echo "[FILE] {$file} ({$sizeStr})\n";
}

echo "\n\n========================================\n";
echo "ARQUIVOS IMPORTANTES PARA VERIFICAR:\n";
echo "========================================\n";

$importantFiles = [
    'api/config/cors.php',
    'api/config/database.php',
    'api/config/auth.php',
    'api/courses/index.php',
    'api/permissions/index.php',
    'config-database-ead.php',
];

foreach ($importantFiles as $file) {
    $fullPath = $root . '/' . $file;
    if (file_exists($fullPath)) {
        echo "✓ {$file} - EXISTE\n";
    } else {
        echo "✗ {$file} - NÃO ENCONTRADO\n";
    }
}

echo "\n========================================\n";
echo "FIM DO SCAN\n";
echo "========================================\n";