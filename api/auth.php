<?php
/**
 * Endpoint de Autenticação (Compatível com padrão LandingGrupoRaca)
 * Suporta: /api/auth.php?action=login
 * 
 * Body: { "email": "usuario", "password": "senha" }
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';

// Obter ação da query string
$action = $_GET['action'] ?? '';

// Roteamento baseado na ação
switch ($action) {
    case 'login':
        handleLogin();
        break;
    
    case 'logout':
        handleLogout();
        break;
    
    case 'me':
        handleMe();
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Ação não especificada']);
        exit;
}

function handleLogin() {
    global $pdo;
    
    // Apenas POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => true, 'message' => 'Método não permitido']);
        exit;
    }

    // Obter dados do body
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Email e senha são obrigatórios']);
        exit;
    }

    $usuario = $data['email']; // Frontend envia como "email", mas é o campo "usuario" no banco
    $password = $data['password'];

    try {
        // Buscar usuário no banco (usando campo usuario)
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ? AND ativo = 1");
        $stmt->execute([$usuario]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => true, 'message' => 'Credenciais inválidas']);
            exit;
        }
        
        // Verificar senha
        if (!password_verify($password, $user['senha'])) {
            http_response_code(401);
            echo json_encode(['error' => true, 'message' => 'Credenciais inválidas']);
            exit;
        }
        
        // Atualizar último login
        $updateStmt = $pdo->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?");
        $updateStmt->execute([$user['id']]);
        
        // Criar sessão
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_usuario'] = $user['usuario'];
        $_SESSION['user_role'] = $user['nivel_acesso'];
        
        // Converter dados para formato inglês (para o frontend)
        $response = [
            'error' => false,
            'success' => true, // Compatível com projeto que funciona
            'user' => [
                'id' => $user['id'],
                'name' => $user['nome'],
                'email' => $user['usuario'], // Campo usuario mapeado para email no frontend
                'role' => $user['nivel_acesso'],
                'school' => $user['escola'],
                'subjects' => json_decode($user['materias'] ?? '[]', true),
                'created_at' => $user['data_criacao'],
                'last_login' => $user['ultimo_login'],
                'is_active' => (bool)$user['ativo'],
                'can_manage_activities' => (bool)($user['can_manage_activities'] ?? 0),
                'can_manage_courses' => (bool)($user['can_manage_courses'] ?? 0)
            ],
            'session_id' => session_id()
        ];
        
        http_response_code(200);
        echo json_encode($response);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'error' => true,
            'message' => 'Erro ao processar login',
            'details' => $e->getMessage()
        ]);
    }
}

function handleLogout() {
    // Apenas POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => true, 'message' => 'Método não permitido']);
        exit;
    }

    // Destruir sessão
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    session_destroy();
    
    http_response_code(200);
    echo json_encode(['error' => false, 'message' => 'Logout realizado com sucesso']);
}

function handleMe() {
    global $pdo;
    
    // Verificar se está autenticado
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => true, 'message' => 'Não autenticado']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ? AND ativo = 1");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => true, 'message' => 'Usuário não encontrado']);
            exit;
        }
        
        $response = [
            'error' => false,
            'user' => [
                'id' => $user['id'],
                'name' => $user['nome'],
                'email' => $user['usuario'],
                'role' => $user['nivel_acesso'],
                'school' => $user['escola'],
                'subjects' => json_decode($user['materias'] ?? '[]', true),
                'created_at' => $user['data_criacao'],
                'last_login' => $user['ultimo_login'],
                'is_active' => (bool)$user['ativo'],
                'can_manage_activities' => (bool)($user['can_manage_activities'] ?? 0),
                'can_manage_courses' => (bool)($user['can_manage_courses'] ?? 0)
            ]
        ];
        
        http_response_code(200);
        echo json_encode($response);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'error' => true,
            'message' => 'Erro ao obter usuário',
            'details' => $e->getMessage()
        ]);
    }
}
