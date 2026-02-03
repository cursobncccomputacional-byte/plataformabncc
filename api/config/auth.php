<?php
/**
 * Funções de autenticação e validação de permissões
 */

require_once __DIR__ . '/database.php';

/**
 * Verificar se o usuário está autenticado
 */
function isAuthenticated() {
    // Verificar se sessão já foi iniciada
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (isset($_SESSION['user_id'])) {
        return $_SESSION['user_id'];
    }
    
    // Verificar headers X-User-Id (para requisições cross-domain)
    $headers = getallheaders();
    if (isset($headers['X-User-Id'])) {
        return $headers['X-User-Id'];
    }
    
    // Verificar token no header Authorization
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
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
        // Converter para formato inglês (para o frontend)
        $profile = [
            'id' => $user['id'],
            'can_manage_activities' => (bool)($user['can_manage_activities'] ?? 0),
            'can_manage_courses' => (bool)($user['can_manage_courses'] ?? 0),
            'name' => $user['nome'],
            'email' => $user['usuario'], // Campo usuario mapeado para email no frontend
            'role' => $user['nivel_acesso'],
            'school' => $user['escola'],
            'subjects' => json_decode($user['materias'] ?? '[]', true),
            'created_at' => $user['data_criacao'],
            'last_login' => $user['ultimo_login'],
            'is_active' => (bool)$user['ativo']
        ];
        if (array_key_exists('data_aceite_politica_privacidade', $user)) {
            $profile['data_aceite_politica_privacidade'] = $user['data_aceite_politica_privacidade'];
        }
        if (array_key_exists('versao_politica_privacidade', $user)) {
            $profile['versao_politica_privacidade'] = $user['versao_politica_privacidade'];
        }
        return $profile;
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
        'professor' => 2,
        'teste_professor' => 2,
        'admin' => 3,
        'root' => 4
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
