<?php
declare(strict_types=1);

/**
 * Endpoint para habilitar/desabilitar Formação Continuada para o professor
 * Somente usuários root podem acessar.
 *
 * POST /api/users/formacao-continuada.php
 * Body JSON: { "user_id": "id-do-usuario", "enable": true|false }
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response_fc(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $currentUser = requireAuth();
    if (($currentUser['role'] ?? null) !== 'root') {
        json_response_fc(403, ['error' => true, 'message' => 'Apenas root pode gerenciar Formação Continuada']);
    }

    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'POST');
    if ($method !== 'POST') {
        json_response_fc(405, ['error' => true, 'message' => 'Método não permitido']);
    }

    $raw = file_get_contents('php://input');
    $data = $raw ? json_decode($raw, true) : [];
    if (!is_array($data)) {
        json_response_fc(400, ['error' => true, 'message' => 'JSON inválido']);
    }

    $userId = trim((string)($data['user_id'] ?? ''));
    $enable = (bool)($data['enable'] ?? false);

    if ($userId === '') {
        json_response_fc(400, ['error' => true, 'message' => 'user_id é obrigatório']);
    }

    global $pdo;
    if (!isset($pdo)) {
        json_response_fc(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
    }

    // Verificar se o usuário existe e é professor
    $stmt = $pdo->prepare("SELECT id, nivel_acesso FROM usuarios WHERE id = ?");
    $stmt->execute([$userId]);
    $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$targetUser) {
        json_response_fc(404, ['error' => true, 'message' => 'Usuário não encontrado']);
    }

    if (($targetUser['nivel_acesso'] ?? '') !== 'professor') {
        json_response_fc(400, ['error' => true, 'message' => 'A Formação Continuada só pode ser habilitada para usuário com perfil professor']);
    }

    $pdo->beginTransaction();

    if ($enable) {
        // Habilitar Formação Continuada apenas para este usuário, sem mexer nos outros
        $update = $pdo->prepare("UPDATE usuarios SET formacao_continuada = 1 WHERE id = ?");
        $update->execute([$userId]);
    } else {
        // Desabilitar apenas para este usuário
        $update = $pdo->prepare("UPDATE usuarios SET formacao_continuada = 0 WHERE id = ?");
        $update->execute([$userId]);
    }

    $pdo->commit();

    json_response_fc(200, [
        'error' => false,
        'message' => $enable
            ? 'Formação Continuada habilitada para o professor selecionado.'
            : 'Formação Continuada desabilitada para o professor selecionado.',
    ]);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Erro em formacao-continuada.php (PDO): ' . $e->getMessage());
    json_response_fc(500, ['error' => true, 'message' => 'Erro no banco de dados']);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Erro em formacao-continuada.php (geral): ' . $e->getMessage());
    json_response_fc(500, ['error' => true, 'message' => 'Erro inesperado']);
}

