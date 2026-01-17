<?php
/**
 * Teste SIMPLIFICADO do GET /users
 * Este script testa apenas a parte essencial sem toda a complexidade
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Iniciar buffer
ob_start();

try {
    // Incluir configurações
    require_once __DIR__ . '/config/database.php';
    require_once __DIR__ . '/config/auth.php';
    
    // Iniciar sessão
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Verificar autenticação
    $currentUser = requireAuth();
    
    if ($currentUser['role'] !== 'admin' && $currentUser['role'] !== 'root') {
        ob_end_clean();
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(403);
        echo json_encode(['error' => true, 'message' => 'Acesso negado']);
        exit;
    }
    
    // Buscar usuários
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM usuarios ORDER BY data_criacao DESC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Converter
    $usersList = [];
    foreach ($users as $user) {
        $usersList[] = [
            'id' => $user['id'],
            'name' => $user['nome'],
            'email' => $user['usuario'],
            'role' => $user['nivel_acesso'],
            'school' => $user['escola'] ?? '',
            'subjects' => json_decode($user['materias'] ?? '[]', true),
            'created_at' => $user['data_criacao'],
            'last_login' => $user['ultimo_login'] ?? null,
            'is_active' => (bool)$user['ativo']
        ];
    }
    
    // Limpar buffer e enviar resposta
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(200);
    echo json_encode([
        'error' => false,
        'users' => $usersList
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Erro PDO',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch(Exception $e) {
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Erro',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch(Error $e) {
    ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Erro fatal',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
