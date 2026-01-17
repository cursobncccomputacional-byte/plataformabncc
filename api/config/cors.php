<?php
/**
 * Configuração CORS para permitir requisições do frontend
 */

// Permitir requisições do frontend
// Se o frontend estiver no mesmo domínio, usar o domínio específico
$allowedOrigins = [
    'https://novaedubncc.com.br',
    'https://www.novaedubncc.com.br',
    'http://localhost:3000',
    'http://localhost:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-ID');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 3600');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
