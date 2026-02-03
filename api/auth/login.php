<?php
/**
 * Endpoint de Login
 * POST /api/auth/login
 * 
 * Body: { "email": "marcus.lopes", "password": "?&,6bsMrD08a" }
 */

require_once __DIR__ . '/../config/cors.php';

// Preflight CORS: responder OPTIONS com 200 para origem cursos.novaedubncc.com.br
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

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
    // O hash fornecido é bcrypt ($2a$), então usamos password_verify
    if (!password_verify($password, $user['senha'])) {
        http_response_code(401);
        echo json_encode(['error' => true, 'message' => 'Credenciais inválidas']);
        exit;
    }
    
    // Atualizar último login
    $updateStmt = $pdo->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);
    
    // Criar sessão
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_usuario'] = $user['usuario'];
    $_SESSION['user_role'] = $user['nivel_acesso'];
    
    // Registrar sessão no banco de dados
    try {
        $sessaoId = bin2hex(random_bytes(16));
        $sessionId = session_id();
        
        // Obter IP e User Agent
        $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
        $ipAddress = '0.0.0.0';
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        $ipAddress = $ip;
                        break 2;
                    }
                }
            }
        }
        if ($ipAddress === '0.0.0.0') {
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }
        
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        $criadoPor = $user['criado_por'] ?? null;
        
        // Verificar se a tabela sessoes existe antes de inserir
        $checkTable = $pdo->query("SHOW TABLES LIKE 'sessoes'");
        if ($checkTable->rowCount() > 0) {
            // Verificar se já existe uma sessão ativa para este usuário
            $checkSessaoAtiva = $pdo->prepare("
                SELECT id FROM sessoes 
                WHERE usuario_id = ? AND data_logout IS NULL 
                ORDER BY data_login DESC LIMIT 1
            ");
            $checkSessaoAtiva->execute([$user['id']]);
            $sessaoAtiva = $checkSessaoAtiva->fetch();
            
            if (!$sessaoAtiva) {
                // Só criar nova sessão se não houver uma ativa
                $stmtSessao = $pdo->prepare("
                    INSERT INTO sessoes (id, usuario_id, session_id, ip_address, user_agent, criado_por)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmtSessao->execute([$sessaoId, $user['id'], $sessionId, $ipAddress, $userAgent, $criadoPor]);
                $_SESSION['sessao_id'] = $sessaoId; // Guardar para usar no logout
            } else {
                // Usar sessão existente
                $_SESSION['sessao_id'] = $sessaoAtiva['id'];
            }
        }
    } catch(PDOException $e) {
        // Log do erro mas não interromper o login
        error_log("Erro ao registrar sessão no login: " . $e->getMessage());
        error_log("SQL Error: " . print_r($e->errorInfo, true));
    }
    
    $userPayload = [
        'id' => $user['id'],
        'name' => $user['nome'],
        'email' => $user['usuario'],
        'role' => $user['nivel_acesso'],
        'school' => $user['escola'],
        'subjects' => json_decode($user['materias'] ?? '[]', true),
        'created_at' => $user['data_criacao'],
        'last_login' => $user['ultimo_login'],
        'is_active' => (bool)$user['ativo']
    ];
    if (array_key_exists('data_aceite_politica_privacidade', $user)) {
        $userPayload['data_aceite_politica_privacidade'] = $user['data_aceite_politica_privacidade'];
    }
    if (array_key_exists('versao_politica_privacidade', $user)) {
        $userPayload['versao_politica_privacidade'] = $user['versao_politica_privacidade'];
    }
    $response = [
        'error' => false,
        'user' => $userPayload,
        'session_id' => session_id(),
        'sessao_id' => $sessaoId ?? null
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
