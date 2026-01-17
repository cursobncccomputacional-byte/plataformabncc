<?php
/**
 * Endpoint para trocar senha de usuário
 * PUT /api/users/change-password
 * 
 * Requer: Admin ou Root
 * Body: { "user_id": "123", "new_password": "novaSenha123" }
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

// Verificar permissão (admin ou root)
$currentUser = requireAuth();
if ($currentUser['role'] !== 'admin' && $currentUser['role'] !== 'root') {
    http_response_code(403);
    echo json_encode(['error' => true, 'message' => 'Acesso negado']);
    exit;
}

// Obter dados do body
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id']) || !isset($data['new_password'])) {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'user_id e new_password são obrigatórios']);
    exit;
}

$userId = $data['user_id'];
$newPassword = $data['new_password'];

// Validar senha (mínimo 6 caracteres)
if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'A senha deve ter pelo menos 6 caracteres']);
    exit;
}

global $pdo;

try {
    // Verificar se o usuário existe
    $stmt = $pdo->prepare("SELECT id, nivel_acesso FROM usuarios WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => true, 'message' => 'Usuário não encontrado']);
        exit;
    }
    
    // Admin não pode alterar senha de root ou outros admins
    if ($currentUser['role'] === 'admin' && ($user['nivel_acesso'] === 'root' || $user['nivel_acesso'] === 'admin')) {
        http_response_code(403);
        echo json_encode(['error' => true, 'message' => 'Administradores não podem alterar senha de root ou outros admins']);
        exit;
    }
    
    // Gerar hash da nova senha
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
    
    // Atualizar senha no banco
    $updateStmt = $pdo->prepare("UPDATE usuarios SET senha = ? WHERE id = ?");
    $updateStmt->execute([$hashedPassword, $userId]);
    
    http_response_code(200);
    echo json_encode([
        'error' => false,
        'message' => 'Senha alterada com sucesso'
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao alterar senha',
        'details' => $e->getMessage()
    ]);
}
