<?php
/**
 * Script para testar criação de usuário via requisição HTTP real
 * 
 * Este script faz uma requisição POST real para a API
 * simulando o que o frontend faria
 * 
 * IMPORTANTE: Você precisa estar logado primeiro!
 * 1. Faça login na aplicação web
 * 2. Copie o session_id do cookie
 * 3. Execute este script
 * 
 * OU simplesmente acesse este script após fazer login
 */

header('Content-Type: text/plain; charset=utf-8');

echo "═══════════════════════════════════════════════════════════\n";
echo "  TESTE DE CRIAÇÃO VIA HTTP (Simulando Frontend)\n";
echo "═══════════════════════════════════════════════════════════\n\n";

// Verificar se há sessão ativa
session_start();

if (!isset($_SESSION['user_id'])) {
    echo "❌ ERRO: Você precisa estar logado primeiro!\n";
    echo "\n";
    echo "📋 INSTRUÇÕES:\n";
    echo "1. Faça login na aplicação web (https://novaedubncc.com.br)\n";
    echo "2. Com a sessão ativa, acesse este script novamente\n";
    echo "3. Ou copie o PHPSESSID do cookie e defina manualmente\n";
    echo "\n";
    echo "📋 Sessão atual:\n";
    echo "   Session ID: " . session_id() . "\n";
    echo "   user_id: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'NÃO DEFINIDO') . "\n";
    exit(1);
}

echo "✅ Sessão ativa encontrada!\n";
echo "   Session ID: " . session_id() . "\n";
echo "   User ID: {$_SESSION['user_id']}\n";
echo "   User Role: {$_SESSION['user_role']}\n";
echo "\n";

// Dados de teste
$testData = [
    'name' => 'Teste HTTP ' . date('H:i:s'),
    'email' => 'teste.http.' . time(),
    'password' => 'senha123',
    'role' => 'professor',
    'school' => 'Escola Teste HTTP'
];

echo "📋 DADOS DE TESTE:\n";
echo "   Nome: {$testData['name']}\n";
echo "   Usuário: {$testData['email']}\n";
echo "   Senha: {$testData['password']}\n";
echo "   Role: {$testData['role']}\n";
echo "   Escola: {$testData['school']}\n";
echo "\n";

// Fazer requisição POST para a API
echo "🔍 Fazendo requisição POST para /api/users...\n";

// Usar URL relativa ou absoluta baseada no servidor atual
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$baseUrl = "$protocol://$host";

// Tentar diferentes URLs
$urls = [
    "$baseUrl/api/users",
    "$baseUrl/api/users/",
    "$baseUrl/api/users/index.php"
];

$url = $urls[0]; // Começar com a primeira
echo "   Tentando URL: $url\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Seguir redirecionamentos
curl_setopt($ch, CURLOPT_MAXREDIRS, 5); // Máximo de 5 redirecionamentos
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Cookie: ' . session_name() . '=' . session_id()
]);
curl_setopt($ch, CURLOPT_COOKIE, session_name() . '=' . session_id());
curl_setopt($ch, CURLOPT_COOKIEFILE, ''); // Usar cookies da sessão atual
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Para desenvolvimento (remover em produção)
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Para desenvolvimento (remover em produção)

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
$error = curl_error($ch);
curl_close($ch);

echo "   Status HTTP: $httpCode\n";
echo "   URL final: $finalUrl\n";

if ($error) {
    echo "   ❌ ERRO cURL: $error\n";
    exit(1);
}

// Se for redirecionamento, tentar a URL final
if ($httpCode >= 300 && $httpCode < 400 && $finalUrl !== $url) {
    echo "   ⚠️  Redirecionamento detectado, tentando URL final...\n";
    $ch = curl_init($finalUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Cookie: ' . session_name() . '=' . session_id()
    ]);
    curl_setopt($ch, CURLOPT_COOKIE, session_name() . '=' . session_id());
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "   Status HTTP (após redirecionamento): $httpCode\n";
    
    if ($error) {
        echo "   ❌ ERRO cURL: $error\n";
        exit(1);
    }
}

echo "   ✅ Resposta recebida\n";
echo "\n";

// Decodificar resposta
$responseData = json_decode($response, true);

if (!$responseData) {
    echo "❌ ERRO: Resposta não é JSON válido\n";
    echo "Resposta recebida:\n";
    echo substr($response, 0, 500) . "\n";
    exit(1);
}

echo "📋 RESPOSTA DA API:\n";
echo json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
echo "\n";

if (isset($responseData['error']) && $responseData['error']) {
    echo "❌ ERRO na criação:\n";
    echo "   Mensagem: " . ($responseData['message'] ?? 'Erro desconhecido') . "\n";
    if (isset($responseData['details'])) {
        echo "   Detalhes: " . $responseData['details'] . "\n";
    }
    exit(1);
}

if (isset($responseData['user'])) {
    echo "✅ USUÁRIO CRIADO COM SUCESSO!\n";
    echo "   ID: {$responseData['user']['id']}\n";
    echo "   Nome: {$responseData['user']['name']}\n";
    echo "   Email: {$responseData['user']['email']}\n";
    echo "   Role: {$responseData['user']['role']}\n";
    echo "\n";
    
    // Verificar se está no banco
    require_once __DIR__ . '/config/database.php';
    global $pdo;
    
    $checkStmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
    $checkStmt->execute([$responseData['user']['id']]);
    $userInDb = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userInDb) {
        echo "✅ Usuário encontrado no banco de dados!\n";
        echo "   Nome no banco: {$userInDb['nome']}\n";
        echo "   Usuário no banco: {$userInDb['usuario']}\n";
        echo "\n";
        echo "🔍 Removendo usuário de teste...\n";
        $deleteStmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
        $deleteStmt->execute([$responseData['user']['id']]);
        echo "✅ Usuário de teste removido!\n";
    } else {
        echo "❌ ERRO: Usuário NÃO encontrado no banco de dados!\n";
        echo "   Isso indica que a inserção falhou silenciosamente.\n";
    }
} else {
    echo "⚠️  AVISO: Resposta não contém campo 'user'\n";
    echo "   Isso pode indicar um problema na API.\n";
}

echo "\n";
echo "═══════════════════════════════════════════════════════════\n";
echo "  TESTE CONCLUÍDO\n";
echo "═══════════════════════════════════════════════════════════\n";

?>
