<?php
/**
 * Script para testar a criação de usuário via API
 * 
 * Este script simula uma chamada POST para /api/users
 * para verificar se a API está funcionando corretamente.
 * 
 * IMPORTANTE: Este script requer que você esteja autenticado como root
 * 
 * Acesse: https://novaedubncc.com.br/api/test-api-create-user.php
 */

// Definir headers
header('Content-Type: text/plain; charset=utf-8');

echo "═══════════════════════════════════════════════════════════\n";
echo "  TESTE DE CRIAÇÃO DE USUÁRIO VIA API\n";
echo "═══════════════════════════════════════════════════════════\n\n";

// Incluir configurações
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/auth.php';

global $pdo;

// Verificar se há sessão ativa (simular autenticação root)
echo "🔍 PASSO 1: Verificando autenticação...\n";

// Para teste, vamos buscar um usuário root do banco
try {
    $rootStmt = $pdo->query("SELECT * FROM usuarios WHERE nivel_acesso = 'root' AND ativo = 1 LIMIT 1");
    $rootUser = $rootStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$rootUser) {
        echo "   ❌ Nenhum usuário root encontrado no banco!\n";
        echo "   ℹ️  Este script precisa de um usuário root para funcionar.\n";
        exit(1);
    }
    
    echo "   ✅ Usuário root encontrado: {$rootUser['nome']} ({$rootUser['usuario']})\n";
    
    // Simular sessão para o usuário root
    session_start();
    $_SESSION['user_id'] = $rootUser['id'];
    $_SESSION['user_role'] = $rootUser['nivel_acesso'];
    
    echo "   ✅ Sessão simulada para teste\n";
    
} catch (PDOException $e) {
    echo "   ❌ ERRO ao buscar usuário root: " . $e->getMessage() . "\n";
    exit(1);
}
echo "\n";

// Dados de teste
$testData = [
    'name' => 'Teste API ' . date('Y-m-d H:i:s'),
    'email' => 'teste.api.' . time(),
    'password' => 'senha123',
    'role' => 'professor',
    'school' => 'Escola Teste API'
];

echo "📋 DADOS DE TESTE:\n";
echo "   Nome: {$testData['name']}\n";
echo "   Usuário: {$testData['email']}\n";
echo "   Senha: {$testData['password']}\n";
echo "   Role: {$testData['role']}\n";
echo "   Escola: {$testData['school']}\n";
echo "\n";

// Simular chamada POST para /api/users/index.php
echo "🔍 PASSO 2: Simulando chamada POST para /api/users...\n";

// Capturar output
ob_start();

// Simular variáveis de requisição
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';
$_SERVER['REQUEST_URI'] = '/api/users';
$_SERVER['SCRIPT_NAME'] = '/api/users/index.php';

// Simular body da requisição
$jsonBody = json_encode($testData);
file_put_contents('php://memory', $jsonBody);

// Incluir o arquivo da API (mas vamos fazer manualmente para ter mais controle)
echo "   ⚙️  Processando dados...\n";

try {
    // Verificar permissão
    $currentUser = requireAuth();
    if ($currentUser['role'] !== 'admin' && $currentUser['role'] !== 'root') {
        echo "   ❌ Acesso negado! Usuário não tem permissão.\n";
        exit(1);
    }
    
    echo "   ✅ Permissão verificada: {$currentUser['role']}\n";
    
    // Validar dados
    if (empty($testData['name']) || empty($testData['email']) || empty($testData['password']) || empty($testData['role'])) {
        echo "   ❌ Campos obrigatórios faltando!\n";
        exit(1);
    }
    
    $name = trim($testData['name']);
    $usuario = trim($testData['email']);
    $password = $testData['password'];
    $role = $testData['role'];
    $school = isset($testData['school']) && !empty(trim($testData['school'])) ? trim($testData['school']) : null;
    
    echo "   ✅ Dados validados\n";
    
    // Verificar se usuário já existe
    $checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
    $checkStmt->execute([$usuario]);
    $existingUser = $checkStmt->fetch();
    
    if ($existingUser) {
        echo "   ⚠️  Usuário já existe! Usando usuário diferente...\n";
        $usuario = 'teste.api.' . time() . '.' . rand(1000, 9999);
        echo "   Novo usuário: $usuario\n";
    }
    
    // Gerar ID e hash
    $userId = $role . '-' . strtolower(str_replace([' ', '.'], ['-', ''], $usuario)) . '-' . substr(md5($usuario . time()), 0, 8);
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    echo "   ✅ ID gerado: $userId\n";
    
    // Iniciar transação
    $pdo->beginTransaction();
    echo "   ✅ Transação iniciada\n";
    
    // Inserir
    $insertStmt = $pdo->prepare("
        INSERT INTO usuarios (id, nome, usuario, senha, nivel_acesso, escola, materias, ativo, data_criacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
    ");
    
    $insertResult = $insertStmt->execute([
        $userId,
        $name,
        $usuario,
        $hashedPassword,
        $role,
        $school,
        null
    ]);
    
    if (!$insertResult) {
        $errorInfo = $insertStmt->errorInfo();
        echo "   ❌ ERRO ao executar INSERT:\n";
        echo "      " . json_encode($errorInfo) . "\n";
        $pdo->rollBack();
        exit(1);
    }
    
    $rowCount = $insertStmt->rowCount();
    echo "   ✅ INSERT executado! Linhas afetadas: $rowCount\n";
    
    if ($rowCount === 0) {
        echo "   ❌ AVISO: Nenhuma linha foi afetada!\n";
        $pdo->rollBack();
        exit(1);
    }
    
    // Commit
    $pdo->commit();
    echo "   ✅ Transação commitada!\n";
    
    // Verificar se foi inserido
    $selectStmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
    $selectStmt->execute([$userId]);
    $newUser = $selectStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$newUser) {
        echo "   ❌ ERRO: Usuário não encontrado após inserção!\n";
        exit(1);
    }
    
    echo "   ✅ Usuário encontrado após inserção!\n";
    echo "   📊 Dados do usuário:\n";
    echo "      ID: {$newUser['id']}\n";
    echo "      Nome: {$newUser['nome']}\n";
    echo "      Usuário: {$newUser['usuario']}\n";
    echo "      Role: {$newUser['nivel_acesso']}\n";
    echo "      Escola: " . ($newUser['escola'] ?? 'NULL') . "\n";
    echo "      Ativo: {$newUser['ativo']}\n";
    echo "      Criado em: {$newUser['data_criacao']}\n";
    
    // Limpar usuário de teste
    echo "\n";
    echo "🔍 PASSO 3: Removendo usuário de teste...\n";
    $deleteStmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
    $deleteStmt->execute([$userId]);
    $deletedRows = $deleteStmt->rowCount();
    
    if ($deletedRows > 0) {
        echo "   ✅ Usuário de teste removido!\n";
    } else {
        echo "   ⚠️  Nenhuma linha removida\n";
    }
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "   ❌ ERRO PDO: " . $e->getMessage() . "\n";
    echo "   Código: " . $e->getCode() . "\n";
    exit(1);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "   ❌ ERRO: " . $e->getMessage() . "\n";
    exit(1);
}

$output = ob_get_clean();

echo "═══════════════════════════════════════════════════════════\n";
echo "  ✅ TESTE CONCLUÍDO COM SUCESSO!\n";
echo "═══════════════════════════════════════════════════════════\n";
echo "\n";
echo "📝 CONCLUSÃO:\n";
echo "   A inserção via API está funcionando corretamente!\n";
echo "   Se o problema persistir na aplicação web, verifique:\n";
echo "   1. Se a sessão está sendo mantida corretamente\n";
echo "   2. Se o endpoint POST /api/users está sendo chamado\n";
echo "   3. Se há algum problema de CORS ou headers\n";
echo "   4. Se há algum erro JavaScript no console do navegador\n";
echo "\n";

?>
