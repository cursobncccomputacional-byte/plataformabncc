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

// Nunca usar Access-Control-Allow-Origin: * com credentials (navegador bloqueia).
// Sempre usar origem específica quando o front envia cookies/credenciais.
$allowOrigin = false;
if (!empty($origin)) {
    if (in_array($origin, $knownOrigins)) {
        $allowOrigin = true;
    } else {
        // Permitir domínio principal e subdomínios (ex.: cursos.novaedubncc.com.br de outro PC)
        $host = parse_url($origin, PHP_URL_HOST);
        $domain = 'novaedubncc.com.br';
        if ($host && ($host === $domain || substr($host, -strlen($domain) - 1) === '.' . $domain)) {
            $allowOrigin = true;
        }
    }
}
if ($allowOrigin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-ID, X-User-Id, X-User-Role');
// REMOVIDO: Access-Control-Allow-Credentials: true
// O projeto que funciona usa Access-Control-Allow-Origin: * SEM credentials
// Mas o frontend usa credentials: 'include' - isso funciona em same-origin
header('Access-Control-Max-Age: 3600');

// OPTIONS (preflight) é tratado no script que inclui este arquivo, para evitar
// que a função shutdown do script envie 500 ao dar exit aqui.
