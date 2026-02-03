<?php
/**
 * LGPD - Solicitação de exclusão de dados pelo titular (Art. 18)
 * POST /api/users/me-solicitar-exclusao.php
 * Registra a solicitação do usuário; a exclusão efetiva é feita pelo controlador (ex.: root/admin).
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

try {
    $update = $pdo->prepare("UPDATE usuarios SET solicitacao_exclusao_em = NOW() WHERE id = ?");
    $update->execute([$userId]);
    $affected = $update->rowCount();

    header('Content-Type: application/json; charset=utf-8');
    http_response_code(200);
    echo json_encode([
        'error' => false,
        'message' => 'Solicitação de exclusão dos seus dados foi registrada. Nossa equipe entrará em contato para confirmar o processo, em conformidade com a LGPD.',
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    // Se a coluna solicitacao_exclusao_em não existir, executar add-lgpd-consent-usuarios.sql
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Erro ao registrar solicitação. Tente novamente ou contate o Encarregado de Dados.']);
}
