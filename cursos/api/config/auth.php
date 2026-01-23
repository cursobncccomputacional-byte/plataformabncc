<?php
/**
 * Funções de autenticação e validação de permissões
 * Usa o mesmo sistema de autenticação do domínio principal
 */

require_once __DIR__ . '/database.php';

/**
 * Verificar se o usuário está autenticado
 * Suporta sessão local e headers cross-domain (X-User-Id)
 */
function isAuthenticated() {
    // Verificar se sessão já foi iniciada
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Primeiro: verificar sessão local
    if (isset($_SESSION['user_id'])) {
        return $_SESSION['user_id'];
    }
    
    // Segundo: verificar headers cross-domain (para requisições do domínio principal)
    // getallheaders() pode não funcionar em todos os servidores, usar método alternativo
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    } else {
        // Fallback para servidores que não suportam getallheaders()
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $headerKey = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                $headers[$headerKey] = $value;
            }
        }
    }
    
    // Normalizar chaves dos headers (case-insensitive)
    $normalizedHeaders = [];
    foreach ($headers as $key => $value) {
        $normalizedHeaders[strtolower($key)] = $value;
    }
    
    // Verificar X-User-Id (case-insensitive)
    $userId = null;
    if (isset($normalizedHeaders['x-user-id']) && !empty($normalizedHeaders['x-user-id'])) {
        $userId = $normalizedHeaders['x-user-id'];
    } elseif (isset($_SERVER['HTTP_X_USER_ID']) && !empty($_SERVER['HTTP_X_USER_ID'])) {
        $userId = $_SERVER['HTTP_X_USER_ID'];
    }
    
    if ($userId) {
        // Validar que o usuário existe e está ativo
        global $pdo;
        if (isset($pdo)) {
            try {
                $stmt = $pdo->prepare("SELECT id, nivel_acesso, ativo FROM usuarios WHERE id = ?");
                $stmt->execute([$userId]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($user && (int)$user['ativo'] === 1) {
                    return $userId;
                } else {
                    // Log para debug (remover em produção se necessário)
                    error_log("Usuário não encontrado ou inativo: ID={$userId}, Ativo=" . ($user['ativo'] ?? 'null'));
                }
            } catch (PDOException $e) {
                error_log('Erro ao validar usuário: ' . $e->getMessage());
            }
        } else {
            error_log('PDO não está disponível na função isAuthenticated()');
        }
    } else {
        // Log para debug - verificar se headers estão sendo recebidos
        error_log('X-User-Id não encontrado nos headers. Headers recebidos: ' . json_encode(array_keys($normalizedHeaders)));
    }
    
    // Terceiro: verificar token no header Authorization
    $authHeader = $normalizedHeaders['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    if ($authHeader) {
        $token = str_replace('Bearer ', '', $authHeader);
        // Validar token (implementar JWT se necessário)
        return validateToken($token);
    }
    
    return false;
}

/**
 * Obter usuário atual
 */
function getCurrentUser() {
    global $pdo;
    
    $userId = isAuthenticated();
    if (!$userId) {
        return null;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ? AND ativo = 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if ($user) {
        // Converter para formato compatível com o frontend
        return [
            'id' => $user['id'],
            'name' => $user['nome'],
            'email' => $user['usuario'], // Campo usuario mapeado para email no frontend
            'role' => $user['nivel_acesso'],
            'school' => $user['escola'] ?? '',
            'subjects' => json_decode($user['materias'] ?? '[]', true),
            'created_at' => $user['data_criacao'],
            'last_login' => $user['ultimo_login'] ?? null,
            'is_active' => (bool)($user['ativo'] ?? 0),
            'can_manage_activities' => (bool)($user['can_manage_activities'] ?? 0),
            'can_manage_courses' => (bool)($user['can_manage_courses'] ?? 0),
        ];
    }
    
    return null;
}

/**
 * Validar permissões do usuário
 */
function hasPermission($requiredRole) {
    $user = getCurrentUser();
    
    if (!$user) {
        return false;
    }
    
    // Hierarquia de permissões
    $hierarchy = [
        'aluno' => 1,
        'professor_cursos' => 2,
        'professor' => 3,
        'admin' => 4,
        'root' => 5
    ];
    
    $userLevel = $hierarchy[$user['role']] ?? 0;
    $requiredLevel = $hierarchy[$requiredRole] ?? 0;
    
    // Root tem acesso a tudo
    if ($user['role'] === 'root') {
        return true;
    }
    
    return $userLevel >= $requiredLevel;
}

/**
 * Validar token (simplificado - pode ser melhorado com JWT)
 */
function validateToken($token) {
    global $pdo;
    
    // Por enquanto, usar sessão
    // TODO: Implementar JWT se necessário
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return $_SESSION['user_id'] ?? false;
}

/**
 * Requer autenticação
 */
function requireAuth() {
    // Garantir que sempre retornamos JSON
    if (ob_get_level() > 0) {
        ob_clean();
    }
    header('Content-Type: application/json; charset=utf-8');
    
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'error' => true,
            'message' => 'Não autenticado'
        ]);
        if (ob_get_level() > 0) {
            ob_end_flush();
        }
        exit;
    }
    return $user;
}

/**
 * Requer permissão específica
 */
function requirePermission($role) {
    $user = requireAuth();
    
    if (!hasPermission($role)) {
        http_response_code(403);
        echo json_encode([
            'error' => true,
            'message' => 'Acesso negado. Permissão insuficiente.'
        ]);
        exit;
    }
    
    return $user;
}
