<?php
/**
 * Endpoint de usuários (JSON)
 *
 * GET    /api/users/index.php            -> lista usuários
 * POST   /api/users/index.php            -> cria usuário
 * DELETE /api/users/index.php            -> remove usuário (body: { user_id })
 *
 * Obs: este arquivo estava com trechos corrompidos e causava erro 500 (parse error).
 * Esta versão é propositalmente simples e robusta.
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// CORS + preflight (mantém o comportamento esperado no frontend)
require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        json_response(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

// Autenticação + autorização
$currentUser = requireAuth();
if (($currentUser['role'] ?? null) !== 'admin' && ($currentUser['role'] ?? null) !== 'root') {
    json_response(403, ['error' => true, 'message' => 'Acesso negado']);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
    }

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM usuarios ORDER BY data_criacao DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
                'is_active' => (bool)($user['ativo'] ?? 0),
            ];
        }

        json_response(200, ['error' => false, 'users' => $usersList]);
    }

    if ($method === 'POST') {
        $data = read_json_body();

        $name = trim((string)($data['name'] ?? ''));
        $usuario = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');
        $role = (string)($data['role'] ?? '');
        $school = isset($data['school']) && trim((string)$data['school']) !== '' ? trim((string)$data['school']) : null;
        $subjects = isset($data['subjects']) && is_array($data['subjects']) ? $data['subjects'] : [];

        if ($name === '' || $usuario === '' || $password === '' || $role === '') {
            json_response(400, ['error' => true, 'message' => 'Campos obrigatórios: name, email, password, role']);
        }
        if (strlen($password) < 6) {
            json_response(400, ['error' => true, 'message' => 'A senha deve ter pelo menos 6 caracteres']);
        }

        $allowedRoles = ['root', 'admin', 'professor', 'aluno'];
        if (!in_array($role, $allowedRoles, true)) {
            json_response(400, ['error' => true, 'message' => 'Nível de acesso inválido']);
        }

        // Admin só cria professor/aluno
        if ($currentUser['role'] === 'admin' && ($role === 'root' || $role === 'admin')) {
            json_response(403, ['error' => true, 'message' => 'Administradores só podem criar professores e alunos']);
        }

        if (($role === 'professor' || $role === 'aluno') && empty($school)) {
            json_response(400, ['error' => true, 'message' => 'Escola é obrigatória para professores e alunos']);
        }

        // Verificar duplicidade
        $checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $checkStmt->execute([$usuario]);
        if ($checkStmt->fetch()) {
            json_response(409, ['error' => true, 'message' => 'Este usuário já está cadastrado']);
        }

        $userId = $role . '-' . strtolower(str_replace([' ', '.'], ['-', ''], $usuario)) . '-' . substr(md5($usuario . microtime(true)), 0, 8);
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $materiasJson = !empty($subjects) ? json_encode($subjects, JSON_UNESCAPED_UNICODE) : null;

        $pdo->beginTransaction();
        $insertStmt = $pdo->prepare("
            INSERT INTO usuarios (id, nome, usuario, senha, nivel_acesso, escola, materias, ativo, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
        ");
        $insertStmt->execute([$userId, $name, $usuario, $hashedPassword, $role, $school, $materiasJson]);
        $pdo->commit();

        // Retornar usuário criado
        $selectStmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
        $selectStmt->execute([$userId]);
        $newUser = $selectStmt->fetch(PDO::FETCH_ASSOC);
        if (!$newUser) {
            json_response(500, ['error' => true, 'message' => 'Usuário criado mas não encontrado']);
        }

        json_response(201, [
            'error' => false,
            'message' => 'Usuário criado com sucesso',
            'user' => [
                'id' => $newUser['id'],
                'name' => $newUser['nome'],
                'email' => $newUser['usuario'],
                'role' => $newUser['nivel_acesso'],
                'school' => $newUser['escola'] ?? '',
                'subjects' => json_decode($newUser['materias'] ?? '[]', true),
                'created_at' => $newUser['data_criacao'],
                'last_login' => $newUser['ultimo_login'] ?? null,
                'is_active' => (bool)($newUser['ativo'] ?? 0),
            ],
        ]);
    }

    if ($method === 'DELETE') {
        $data = read_json_body();
        $userId = (string)($data['user_id'] ?? ($_GET['id'] ?? ''));
        $userId = trim($userId);
        if ($userId === '') {
            json_response(400, ['error' => true, 'message' => 'ID do usuário não fornecido']);
        }

        if ($userId === ($currentUser['id'] ?? '')) {
            json_response(403, ['error' => true, 'message' => 'Você não pode deletar sua própria conta']);
        }

        $checkStmt = $pdo->prepare("SELECT id, nivel_acesso FROM usuarios WHERE id = ?");
        $checkStmt->execute([$userId]);
        $userToDelete = $checkStmt->fetch(PDO::FETCH_ASSOC);
        if (!$userToDelete) {
            json_response(404, ['error' => true, 'message' => 'Usuário não encontrado']);
        }

        // Só root pode apagar root
        if (($userToDelete['nivel_acesso'] ?? '') === 'root' && ($currentUser['role'] ?? '') !== 'root') {
            json_response(403, ['error' => true, 'message' => 'Apenas root pode deletar usuários root']);
        }

        $deleteStmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
        $deleteStmt->execute([$userId]);
        if ($deleteStmt->rowCount() === 0) {
            json_response(500, ['error' => true, 'message' => 'Erro ao deletar usuário']);
        }

        json_response(200, ['error' => false, 'message' => 'Usuário deletado com sucesso']);
    }

    json_response(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(500, ['error' => true, 'message' => 'Erro no banco de dados', 'details' => $e->getMessage()]);
} catch (Throwable $e) {
    json_response(500, ['error' => true, 'message' => 'Erro no servidor', 'details' => $e->getMessage()]);
}

// Método não suportado
if (ob_get_level() > 0) {
    ob_clean();
}
header('Content-Type: application/json; charset=utf-8');
http_response_code(405);
echo json_encode(['error' => true, 'message' => 'Método não permitido']);
if (ob_get_level() > 0) {
    ob_end_flush();
}
exit;