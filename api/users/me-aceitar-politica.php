<?php
/**
 * LGPD - Registrar aceite da Política de Privacidade pelo titular (primeiro acesso)
 * POST /api/users/me-aceitar-politica.php
 * Body: { "aceite": true, "versao": "1.0" }
 */

require_once __DIR__ . '/../config/cors.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

$userId = isAuthenticated();
if (!$userId) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(401);
    echo json_encode(['error' => true, 'message' => 'Não autenticado']);
    exit;
}

$raw = file_get_contents('php://input');
$data = is_string($raw) && trim($raw) !== '' ? json_decode($raw, true) : [];
$aceite = !empty($data['aceite']);
$versao = $aceite ? (trim((string)($data['versao'] ?? '1.0')) ?: '1.0') : null;

if (!$aceite) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'É necessário confirmar o aceite.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE usuarios SET data_aceite_politica_privacidade = NOW(), versao_politica_privacidade = ? WHERE id = ?");
    $stmt->execute([$versao, $userId]);
    $affected = $stmt->rowCount();
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'data_aceite_politica_privacidade') !== false || strpos($e->getMessage(), 'Unknown column') !== false) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode(['error' => true, 'message' => 'Recurso de aceite não disponível. Execute o script add-lgpd-consent-usuarios.sql no banco.']);
        exit;
    }
    throw $e;
}

header('Content-Type: application/json; charset=utf-8');
http_response_code(200);
echo json_encode([
    'error' => false,
    'message' => 'Aceite registrado com sucesso.',
    'data_aceite_politica_privacidade' => date('c'),
    'versao_politica_privacidade' => $versao,
], JSON_UNESCAPED_UNICODE);
