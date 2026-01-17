<?php
/**
 * Script de diagnóstico para GET /users
 * Este script mostra EXATAMENTE o que está acontecendo
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

echo "<h1>Diagnóstico GET /users</h1>";
echo "<pre>";

echo "=== PASSO 1: Verificando includes ===\n";
try {
    require_once __DIR__ . '/../config/database.php';
    echo "✅ database.php incluído\n";
    
    require_once __DIR__ . '/../config/auth.php';
    echo "✅ auth.php incluído\n";
} catch (Exception $e) {
    echo "❌ ERRO ao incluir: " . $e->getMessage() . "\n";
    exit;
}

echo "\n=== PASSO 2: Verificando sessão ===\n";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    echo "✅ Sessão iniciada\n";
} else {
    echo "✅ Sessão já estava ativa\n";
}

echo "Session ID: " . session_id() . "\n";
echo "user_id na sessão: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'NÃO DEFINIDO') . "\n";
echo "user_role na sessão: " . (isset($_SESSION['user_role']) ? $_SESSION['user_role'] : 'NÃO DEFINIDO') . "\n";

echo "\n=== PASSO 3: Verificando autenticação ===\n";
try {
    $currentUser = requireAuth();
    echo "✅ Usuário autenticado: " . $currentUser['name'] . " (" . $currentUser['role'] . ")\n";
} catch (Exception $e) {
    echo "❌ ERRO em requireAuth: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit;
}

echo "\n=== PASSO 4: Verificando permissão ===\n";
if ($currentUser['role'] !== 'admin' && $currentUser['role'] !== 'root') {
    echo "❌ Acesso negado - role: " . $currentUser['role'] . "\n";
    exit;
}
echo "✅ Permissão OK\n";

echo "\n=== PASSO 5: Verificando conexão com banco ===\n";
global $pdo;
if (!isset($pdo)) {
    echo "❌ Variável \$pdo não está definida!\n";
    exit;
}
echo "✅ PDO disponível\n";

echo "\n=== PASSO 6: Executando query ===\n";
try {
    $stmt = $pdo->query("SELECT * FROM usuarios ORDER BY data_criacao DESC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "✅ Query executada - " . count($users) . " usuários encontrados\n";
} catch (PDOException $e) {
    echo "❌ ERRO na query: " . $e->getMessage() . "\n";
    exit;
}

echo "\n=== PASSO 7: Convertendo dados ===\n";
$usersList = [];
foreach ($users as $user) {
    $usersList[] = [
        'id' => $user['id'],
        'name' => $user['nome'],
        'email' => $user['usuario'],
        'role' => $user['nivel_acesso'],
        'school' => $user['escola'] ?? '',
        'subjects' => json_decode($user['materias'] ?? '[]', true),
        'created_at' => $user['data_criacao'],
        'last_login' => $user['ultimo_login'] ?? null,
        'is_active' => (bool)$user['ativo']
    ];
}
echo "✅ Dados convertidos\n";

echo "\n=== PASSO 8: Testando JSON ===\n";
$json = json_encode([
    'error' => false,
    'users' => $usersList
], JSON_UNESCAPED_UNICODE);

if ($json === false) {
    echo "❌ ERRO ao gerar JSON: " . json_last_error_msg() . "\n";
} else {
    echo "✅ JSON gerado - " . strlen($json) . " bytes\n";
    echo "\n=== RESPOSTA JSON (primeiros 500 chars) ===\n";
    echo substr($json, 0, 500) . "\n";
}

echo "\n</pre>";
echo "<h2>✅ Todos os testes passaram!</h2>";
echo "<p>Se este script funciona mas index.php não, o problema está nos handlers de erro ou no cors.php</p>";
