<?php
/**
 * Configuração CORS para API EAD
 * IMPORTANTE: Com Access-Control-Allow-Credentials: true, NÃO podemos usar *
 * Devemos sempre especificar a origem exata
 */

// Permitir requisições do subdomínio Cursos e domínio principal
$allowedOrigins = [
    'https://novaedubncc.com.br',         // Domínio principal (para root gerenciar cursos)
    'https://cursos.novaedubncc.com.br',  // Novo subdomínio
    'https://ead.novaedubncc.com.br',     // Mantido para compatibilidade
    'http://localhost:3000',
    'http://localhost:3002',              // Porta do EAD em desenvolvimento
    'http://localhost:5173',
];

// Obter origem da requisição
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Se não houver origem no header, tentar obter do Referer
if (empty($origin) && isset($_SERVER['HTTP_REFERER'])) {
    $referer = parse_url($_SERVER['HTTP_REFERER']);
    if ($referer) {
        $scheme = $referer['scheme'] ?? 'http';
        $host = $referer['host'] ?? '';
        $port = isset($referer['port']) ? ':' . $referer['port'] : '';
        $origin = $scheme . '://' . $host . $port;
    }
}

// IMPORTANTE: Com Access-Control-Allow-Credentials: true, NÃO podemos usar *
// Sempre usar origem específica quando houver origem na requisição
if (!empty($origin)) {
    // Se a origem está na lista de permitidas, usar ela
    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Se não está na lista mas foi enviada, permitir mesmo assim
        // (necessário para funcionar com credentials)
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Credentials: true');
} else {
    // Sem origem (requisição same-origin), usar * (mas sem credentials)
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-ID, X-User-Id, X-User-Role');
header('Access-Control-Max-Age: 3600');

// Responder ao preflight ANTES de qualquer outra coisa
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
