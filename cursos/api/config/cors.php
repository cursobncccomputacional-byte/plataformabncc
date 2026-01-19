<?php
/**
 * Configuração CORS para API EAD
 */

// Permitir requisições do subdomínio Cursos
$allowedOrigins = [
    'https://cursos.novaedubncc.com.br',  // Novo subdomínio
    'https://ead.novaedubncc.com.br',     // Mantido para compatibilidade
    'http://localhost:3000',
    'http://localhost:3002',              // Porta do EAD em desenvolvimento
    'http://localhost:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-ID');
header('Access-Control-Allow-Credentials: true');

// Responder ao preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
