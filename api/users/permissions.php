<?php
/**
 * API de Permissões de Usuários (RBAC)
 * Gerencia permissões can_manage_activities e can_manage_courses
 * 
 * GET  /api/users/permissions.php?user_id=xxx -> obter permissões do usuário
 * POST /api/users/permissions.php -> atualizar permissões (root apenas)
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response_perm(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$currentUser = requireAuth();

// Apenas root pode gerenciar permissões
if ($method === 'POST') {
    if (($currentUser['role'] ?? null) !== 'root') {
        json_response_perm(403, ['error' => true, 'message' => 'Apenas root pode gerenciar permissões']);
    }
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response_perm(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    if ($method === 'GET') {
        $userId = $_GET['user_id'] ?? null;

        if (!$userId) {
            json_response_perm(400, ['error' => true, 'message' => 'user_id é obrigatório']);
        }

        // Buscar permissões do usuário
        $stmt = $pdo->prepare("
            SELECT 
                id,
                nome,
                usuario,
                nivel_acesso,
                can_manage_activities,
                can_manage_courses
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            json_response_perm(404, ['error' => true, 'message' => 'Usuário não encontrado']);
        }

        json_response_perm(200, [
            'error' => false,
            'user' => [
                'id' => $user['id'],
                'name' => $user['nome'],
                'email' => $user['usuario'],
                'role' => $user['nivel_acesso'],
                'can_manage_activities' => (bool)($user['can_manage_activities'] ?? 0),
                'can_manage_courses' => (bool)($user['can_manage_courses'] ?? 0),
            ]
        ]);
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $userId = trim((string)($data['user_id'] ?? ''));
        $canManageActivities = isset($data['can_manage_activities']) ? (bool)$data['can_manage_activities'] : null;
        $canManageCourses = isset($data['can_manage_courses']) ? (bool)$data['can_manage_courses'] : null;

        if (empty($userId)) {
            json_response_perm(400, ['error' => true, 'message' => 'user_id é obrigatório']);
        }

        // Verificar se o usuário existe
        $stmt = $pdo->prepare("SELECT id, nivel_acesso FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$targetUser) {
            json_response_perm(404, ['error' => true, 'message' => 'Usuário não encontrado']);
        }

        // Verificar se é admin ou professor (apenas esses podem receber permissões)
        $role = $targetUser['nivel_acesso'] ?? '';
        if ($role !== 'admin' && $role !== 'professor' && $role !== 'teste_professor') {
            json_response_perm(400, ['error' => true, 'message' => 'Permissões só podem ser atribuídas a usuários Admin, Professor ou Teste Professor']);
        }

        // Atualizar apenas os campos fornecidos
        $updates = [];
        $params = [];

        if ($canManageActivities !== null) {
            $updates[] = "can_manage_activities = ?";
            $params[] = $canManageActivities ? 1 : 0;
        }

        if ($canManageCourses !== null) {
            $updates[] = "can_manage_courses = ?";
            $params[] = $canManageCourses ? 1 : 0;
        }

        if (empty($updates)) {
            json_response_perm(400, ['error' => true, 'message' => 'Nenhuma permissão fornecida para atualizar']);
        }

        $params[] = $userId;
        $sql = "UPDATE usuarios SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        json_response_perm(200, [
            'error' => false,
            'message' => 'Permissões atualizadas com sucesso'
        ]);
    }

    json_response_perm(405, ['error' => true, 'message' => 'Método não permitido']);

} catch (PDOException $e) {
    error_log('Erro ao gerenciar permissões: ' . $e->getMessage());
    json_response_perm(500, [
        'error' => true,
        'message' => 'Erro ao gerenciar permissões'
    ]);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response_perm(500, [
        'error' => true,
        'message' => 'Erro inesperado'
    ]);
}
