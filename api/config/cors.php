<?php
/**
 * Configuração CORS para permitir requisições do frontend
 * Suporta diferentes origens dinamicamente para funcionar em diferentes redes
 */

// Lista de origens conhecidas e confiáveis
$knownOrigins = [
    'https://cursos.novaedubncc.com.br',  // Novo subdomínio principal
    'https://novaedubncc.com.br',         // Mantido para compatibilidade durante migração
    'https://www.novaedubncc.com.br',     // Mantido para compatibilidade
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
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

// SIMPLIFICADO: Seguir padrão do projeto que funciona
// Usar * para permitir qualquer origem (funciona em same-origin com credentials)
if (!empty($origin) && in_array($origin, $knownOrigins)) {
    // Para origens conhecidas, usar origem específica (melhor para credentials)
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    // Para outras origens, usar * (como no projeto que funciona)
    // Isso funciona porque em same-origin, o navegador não bloqueia
    header('Access-Control-Allow-Origin: *');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
// REMOVIDO: Access-Control-Allow-Credentials: true
// O projeto que funciona usa Access-Control-Allow-Origin: * SEM credentials
// Mas o frontend usa credentials: 'include' - isso funciona em same-origin
header('Access-Control-Max-Age: 3600');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
