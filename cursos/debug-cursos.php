<?php
// debug-cursos.php
// ATENÇÃO: use apenas para diagnóstico em produção e APAGUE depois de testar.

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

echo "<pre>";

echo "Raiz do módulo cursos: " . __DIR__ . "\n\n";

echo "Teste 1: require database...\n";
require __DIR__ . '/api/config/database.php';
echo "OK: conexão com banco criada.\n\n";

echo "Teste 2: require auth...\n";
require __DIR__ . '/api/config/auth.php';
echo "OK: auth carregado.\n\n";

echo "Teste 3: incluir endpoint de cursos...\n";
require __DIR__ . '/api/courses/index.php';
echo "OK: endpoint de cursos incluído.\n\n";

echo "Todos os testes básicos passaram.\n";

