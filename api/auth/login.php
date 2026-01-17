<?php
/**
 * Endpoint de Login
 * POST /api/auth/login
 * 
 * Body: { "email": "marcus.lopes", "password": "?&,6bsMrD08a" }
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

// Obter dados do body
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'Email e senha são obrigatórios']);
    exit;
}

$usuario = $data['email']; // Frontend envia como "email", mas é o campo "usuario" no banco
$password = $data['password'];

try {
    // Buscar usuário no banco (usando campo usuario)
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ? AND ativo = 1");
    $stmt->execute([$usuario]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => true, 'message' => 'Credenciais inválidas']);
        exit;
    }
    
    // Verificar senha
    // O hash fornecido é bcrypt ($2a$), então usamos password_verify
    if (!password_verify($password, $user['senha'])) {
        http_response_code(401);
        echo json_encode(['error' => true, 'message' => 'Credenciais inválidas']);
        exit;
    }
    
    // Atualizar último login
    $updateStmt = $pdo->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);
    
    // Criar sessão
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_usuario'] = $user['usuario'];
    $_SESSION['user_role'] = $user['nivel_acesso'];
    
    // Converter dados para formato inglês (para o frontend)
    $response = [
        'error' => false,
        'user' => [
            'id' => $user['id'],
            'name' => $user['nome'],
            'email' => $user['usuario'], // Campo usuario mapeado para email no frontend
            'role' => $user['nivel_acesso'],
            'school' => $user['escola'],
            'subjects' => json_decode($user['materias'] ?? '[]', true),
            'created_at' => $user['data_criacao'],
            'last_login' => $user['ultimo_login'],
            'is_active' => (bool)$user['ativo']
        ],
        'session_id' => session_id()
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao processar login',
        'details' => $e->getMessage()
    ]);
}
