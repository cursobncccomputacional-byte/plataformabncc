<?php
/**
 * Endpoint para obter usuário atual
 * GET /api/auth/me
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

$user = requireAuth();

http_response_code(200);
echo json_encode([
    'error' => false,
    'user' => $user
]);
