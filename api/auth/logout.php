<?php
/**
 * Endpoint de Logout
 * POST /api/auth/logout
 */

require_once __DIR__ . '/../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

session_start();

// Destruir sessão
session_destroy();

http_response_code(200);
echo json_encode([
    'error' => false,
    'message' => 'Logout realizado com sucesso'
]);
