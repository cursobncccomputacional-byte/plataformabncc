<?php
/**
 * API - Configuração de acesso do perfil "teste_professor" às atividades.
 *
 * GET  /api/activities/teste-professor-access.php
 *   -> retorna { allowed_activity_ids: string[] }
 *
 * POST /api/activities/teste-professor-access.php
 *   Body: { activity_ids: string[] }
 *   -> substitui a lista inteira (whitelist) e retorna a lista salva.
 *
 * Segurança:
 * - somente root ou usuário com can_manage_activities
 */
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response_tp(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body_tp(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return [];
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        json_response_tp(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

function require_manage_activities_or_root(?array $user): void {
    if (!$user) {
        json_response_tp(401, ['error' => true, 'message' => 'Não autenticado']);
    }
    $role = strtolower((string)($user['role'] ?? ''));
    $canManage = (bool)($user['can_manage_activities'] ?? false);
    if ($role !== 'root' && !$canManage) {
        json_response_tp(403, ['error' => true, 'message' => 'Sem permissão para configurar acesso do Teste Professor']);
    }
}

function get_allowed_ids(PDO $pdo, ?bool &$tableExists = null): array {
    $tableExists = false;
    try {
        $tableExists = ($pdo->query("SHOW TABLES LIKE 'teste_professor_atividades_liberadas'")->rowCount() ?? 0) > 0;
        if (!$tableExists) return [];
        $stmt = $pdo->query("SELECT activity_id FROM teste_professor_atividades_liberadas ORDER BY activity_id ASC");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        $ids = [];
        foreach ($rows as $r) {
            $id = trim((string)($r['activity_id'] ?? ''));
            if ($id !== '') $ids[] = $id;
        }
        return $ids;
    } catch (Throwable $e) {
        return [];
    }
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$currentUser = getCurrentUser();

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response_tp(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    // Se não veio usuário pela sessão, tenta pelo header (fallback)
    if (!$currentUser) {
        $headers = getallheaders();
        if (isset($headers['X-User-Id'])) {
            $userId = $headers['X-User-Id'];
            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ? AND ativo = 1");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $currentUser = [
                    'id' => $user['id'],
                    'can_manage_activities' => (bool)($user['can_manage_activities'] ?? 0),
                    'role' => $user['nivel_acesso'],
                ];
            }
        }
    }
    require_manage_activities_or_root($currentUser);

    if ($method === 'GET') {
        $tableExists = null;
        json_response_tp(200, [
            'error' => false,
            'allowed_activity_ids' => get_allowed_ids($pdo, $tableExists),
            'table_exists' => (bool)$tableExists,
        ]);
    }

    if ($method === 'POST') {
        $data = read_json_body_tp();
        $idsRaw = $data['activity_ids'] ?? null;
        if (!is_array($idsRaw)) {
            json_response_tp(400, ['error' => true, 'message' => 'Campo activity_ids deve ser um array']);
        }

        $normalized = [];
        foreach ($idsRaw as $v) {
            $id = trim((string)$v);
            if ($id === '') continue;
            $normalized[$id] = true;
        }
        $ids = array_keys($normalized);

        // Substituir lista inteira (simples e idempotente)
        $pdo->beginTransaction();
        try {
            $pdo->exec("DELETE FROM teste_professor_atividades_liberadas");
            if (!empty($ids)) {
                $stmt = $pdo->prepare("INSERT INTO teste_professor_atividades_liberadas (activity_id) VALUES (?)");
                foreach ($ids as $id) {
                    $stmt->execute([$id]);
                }
            }
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }

        json_response_tp(200, [
            'error' => false,
            'message' => 'Configuração salva',
            'allowed_activity_ids' => get_allowed_ids($pdo),
        ]);
    }

    json_response_tp(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (Throwable $e) {
    error_log('teste-professor-access: ' . $e->getMessage() . ' em ' . $e->getFile() . ':' . $e->getLine());
    json_response_tp(500, ['error' => true, 'message' => 'Erro interno', 'details' => $e->getMessage()]);
}

