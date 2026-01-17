<?php
/**
 * Endpoint para gerenciar usuários
 * GET /api/users - Listar usuários
 * POST /api/users - Criar usuário
 * 
 * Requer: Admin ou Root
 */

// Iniciar buffer de saída para capturar qualquer output inesperado
ob_start();

// Capturar todos os erros e retornar como JSON
error_reporting(E_ALL);
ini_set('display_errors', 0); // Não exibir erros na tela, apenas logar

// Handler de erros fatal
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_clean();
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => true,
            'message' => 'Erro fatal no servidor',
            'details' => $error['message'] . ' em ' . $error['file'] . ':' . $error['line']
        ]);
        exit;
    }
});

// Handler de exceções não capturadas
set_exception_handler(function($exception) {
    ob_clean();
    error_log("API: Exceção não capturada - " . $exception->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => true,
        'message' => 'Erro no servidor',
        'details' => $exception->getMessage()
    ]);
    exit;
});

// Log do método HTTP recebido ANTES de qualquer processamento
error_log("API: ===== INÍCIO DO ARQUIVO /users/index.php =====");
error_log("API: REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'NÃO DEFINIDO'));
error_log("API: REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'NÃO DEFINIDO'));
error_log("API: SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'NÃO DEFINIDO'));
error_log("API: QUERY_STRING: " . ($_SERVER['QUERY_STRING'] ?? 'NÃO DEFINIDO'));

try {
    // Limpar qualquer output que possa ter sido gerado antes
    if (ob_get_level() > 0) {
        ob_clean();
    }
    
    // Definir headers ANTES de incluir outros arquivos
    header('Content-Type: application/json; charset=utf-8');
    
    require_once __DIR__ . '/../config/cors.php';
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../config/auth.php';
    
    // Verificar permissão (admin ou root)
    $currentUser = requireAuth();
    if ($currentUser['role'] !== 'admin' && $currentUser['role'] !== 'root') {
        ob_clean();
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => true, 'message' => 'Acesso negado']);
        exit;
    }
} catch(Exception $e) {
    ob_clean();
    error_log("API: Erro ao inicializar - " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao inicializar endpoint',
        'details' => $e->getMessage()
    ]);
    exit;
} catch(Error $e) {
    ob_clean();
    error_log("API: Erro fatal ao inicializar - " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => true,
        'message' => 'Erro fatal ao inicializar endpoint',
        'details' => $e->getMessage()
    ]);
    exit;
}

global $pdo;

// Log do método HTTP ANTES de processar qualquer requisição
$httpMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'NÃO DEFINIDO');
error_log("API: ===== MÉTODO HTTP DETECTADO: $httpMethod =====");
error_log("API: REQUEST_METHOD original: " . ($_SERVER['REQUEST_METHOD'] ?? 'NÃO DEFINIDO'));
error_log("API: REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'NÃO DEFINIDO'));

// ============================================
// POST - Criar usuário (VERIFICAR PRIMEIRO)
// ============================================
if ($httpMethod === 'POST') {
    error_log("API: ===== PROCESSANDO POST /users =====");
    error_log("API: Content-Type recebido: " . ($_SERVER['CONTENT_TYPE'] ?? 'não definido'));
    
    try {
        // Garantir que o header Content-Type está definido ANTES de qualquer output
        if (ob_get_level() > 0) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        
        // Obter dados do body
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        
        // Verificar se o JSON foi decodificado corretamente
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'error' => true, 
                'message' => 'JSON inválido: ' . json_last_error_msg()
            ]);
            if (ob_get_level() > 0) {
                ob_end_flush();
            }
            exit;
        }
        
        // Validar campos obrigatórios
        if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['role'])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Campos obrigatórios: name, email, password, role']);
            if (ob_get_level() > 0) {
                ob_end_flush();
            }
            exit;
        }
    
        $name = trim($data['name']);
        $usuario = trim($data['email']); // Frontend envia como "email", mas é "usuario" no banco
        $password = $data['password'];
        $role = $data['role'];
        // Para root e admin, escola pode ser NULL ou string vazia
        // Para professor e aluno, escola é obrigatória (já validado acima)
        $school = isset($data['school']) && !empty(trim($data['school'])) ? trim($data['school']) : null;
        $subjects = isset($data['subjects']) && is_array($data['subjects']) ? $data['subjects'] : [];
        
        error_log("API: Dados recebidos - Name: $name, Usuario: $usuario, Role: $role, School: " . ($school ?? 'NULL'));
        
        // Validar senha
        if (strlen($password) < 6) {
            http_response_code(400);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => true, 'message' => 'A senha deve ter pelo menos 6 caracteres']);
            if (ob_get_level() > 0) {
                ob_end_flush();
            }
            exit;
        }
        
        // Validar nível de acesso
        $allowedRoles = ['root', 'admin', 'professor', 'aluno'];
        if (!in_array($role, $allowedRoles)) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Nível de acesso inválido']);
            if (ob_get_level() > 0) {
                ob_end_flush();
            }
            exit;
        }
        
        // Admin só pode criar professor e aluno
        if ($currentUser['role'] === 'admin' && ($role === 'root' || $role === 'admin')) {
            http_response_code(403);
            echo json_encode(['error' => true, 'message' => 'Administradores só podem criar professores e alunos']);
            if (ob_get_level() > 0) {
                ob_end_flush();
            }
            exit;
        }
        
        // Escola é obrigatória apenas para professor e aluno
        if (($role === 'professor' || $role === 'aluno') && empty($school)) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Escola é obrigatória para professores e alunos']);
            if (ob_get_level() > 0) {
                ob_end_flush();
            }
            exit;
        }
    
    try {
        // Verificar se usuário já existe
        $checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $checkStmt->execute([$usuario]);
        $existingUser = $checkStmt->fetch();
        if ($existingUser) {
            error_log("API: Usuário já existe - ID: " . $existingUser['id']);
            ob_clean();
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(409);
            echo json_encode(['error' => true, 'message' => 'Este usuário já está cadastrado']);
            if (ob_get_level() > 0) {
                ob_end_flush();
            }
            exit;
        }
        error_log("API: Usuário não existe, prosseguindo com criação");
        
        // Gerar ID único
        $userId = $role . '-' . strtolower(str_replace([' ', '.'], ['-', ''], $usuario)) . '-' . substr(md5($usuario . time()), 0, 8);
        
        // Gerar hash da senha
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        
        // Preparar materias como JSON
        $materiasJson = !empty($subjects) ? json_encode($subjects) : null;
        
        // Iniciar transação para garantir atomicidade
        $pdo->beginTransaction();
        
        try {
            // Inserir usuário no banco
            $insertStmt = $pdo->prepare("
                INSERT INTO usuarios (id, nome, usuario, senha, nivel_acesso, escola, materias, ativo, data_criacao)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
            ");
            
            error_log("API: Tentando inserir usuário - ID: $userId, Nome: $name, Usuário: $usuario, Role: $role, School: " . ($school ?? 'NULL'));
            error_log("API: Hash da senha: " . substr($hashedPassword, 0, 20) . "...");
            error_log("API: Materias JSON: " . ($materiasJson ?? 'NULL'));
            
            $insertResult = $insertStmt->execute([
                $userId,
                $name,
                $usuario,
                $hashedPassword,
                $role,
                $school,
                $materiasJson
            ]);
            
            if (!$insertResult) {
                $errorInfo = $insertStmt->errorInfo();
                error_log("API: Erro ao executar INSERT - " . json_encode($errorInfo));
                $pdo->rollBack();
                http_response_code(500);
                echo json_encode([
                    'error' => true,
                    'message' => 'Erro ao inserir usuário no banco de dados',
                    'details' => $errorInfo[2] ?? 'Erro desconhecido'
                ]);
                exit;
            }
            
            // Verificar se a inserção realmente funcionou
            $rowCount = $insertStmt->rowCount();
            error_log("API: Linhas afetadas pelo INSERT: $rowCount");
            
            if ($rowCount === 0) {
                error_log("API: AVISO - INSERT executado mas nenhuma linha foi afetada!");
                $pdo->rollBack();
                http_response_code(500);
                echo json_encode([
                    'error' => true,
                    'message' => 'Usuário não foi inserido no banco de dados (nenhuma linha afetada)'
                ]);
                exit;
            }
            
            // Commit da transação
            $pdo->commit();
            error_log("API: Transação commitada com sucesso - ID: $userId");
            
            // Buscar usuário criado (após commit)
            $selectStmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
            $selectStmt->execute([$userId]);
            $newUser = $selectStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$newUser) {
                error_log("API: ERRO CRÍTICO - Usuário inserido mas não encontrado ao buscar!");
                http_response_code(500);
                echo json_encode([
                    'error' => true,
                    'message' => 'Usuário foi inserido mas não foi encontrado no banco de dados'
                ]);
                exit;
            }
            
            error_log("API: Usuário encontrado após inserção: " . json_encode($newUser));
            
            // Converter para formato inglês
            $response = [
                'error' => false,
                'message' => 'Usuário criado com sucesso',
                'user' => [
                    'id' => $newUser['id'],
                    'name' => $newUser['nome'],
                    'email' => $newUser['usuario'],
                    'role' => $newUser['nivel_acesso'],
                    'school' => $newUser['escola'] ?? '',
                    'subjects' => json_decode($newUser['materias'] ?? '[]', true),
                    'created_at' => $newUser['data_criacao'],
                    'last_login' => $newUser['ultimo_login'] ?? null,
                    'is_active' => (bool)$newUser['ativo']
                ]
            ];
            
            error_log("API: Resposta final POST: " . json_encode($response));
            error_log("API: Verificando estrutura - error: " . ($response['error'] ? 'true' : 'false'));
            error_log("API: Verificando estrutura - user existe: " . (isset($response['user']) ? 'sim' : 'não'));
            error_log("API: Verificando estrutura - users existe: " . (isset($response['users']) ? 'sim' : 'não'));
            
            // Garantir que o header está definido antes de enviar a resposta
            ob_clean(); // Limpar qualquer output anterior
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(201);
            $jsonResponse = json_encode($response);
            error_log("API: ===== ENVIANDO RESPOSTA POST =====");
            error_log("API: Status HTTP: 201");
            error_log("API: JSON final a ser enviado: " . $jsonResponse);
            error_log("API: Tamanho do JSON: " . strlen($jsonResponse) . " bytes");
            error_log("API: ====================================");
            echo $jsonResponse;
            if (ob_get_level() > 0) {
                ob_end_flush(); // Enviar o buffer
            }
            exit;
        
        } catch(PDOException $e) {
            // Rollback em caso de erro
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log("API: Exceção PDO ao criar usuário: " . $e->getMessage());
            error_log("API: Código do erro: " . $e->getCode());
            error_log("API: Trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'error' => true,
                'message' => 'Erro ao criar usuário',
                'details' => $e->getMessage()
            ]);
            exit;
        } catch(Exception $e) {
            // Rollback em caso de erro
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            ob_clean();
            error_log("API: Exceção genérica ao criar usuário: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'error' => true,
                'message' => $e->getMessage()
            ]);
            if (ob_get_level() > 0) {
                ob_end_flush();
            }
            exit;
        }
    } catch(Exception $e) {
        // Catch para o try externo (linha 246)
        ob_clean();
        error_log("API: Erro ao processar criação de usuário - " . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => true,
            'message' => 'Erro ao processar criação de usuário',
            'details' => $e->getMessage()
        ]);
        if (ob_get_level() > 0) {
            ob_end_flush();
        }
        exit;
    }
    } catch(Exception $e) {
        // Catch para o try do POST (linha 181)
        ob_clean();
        error_log("API: Erro no POST - " . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => true,
            'message' => 'Erro ao processar requisição POST',
            'details' => $e->getMessage()
        ]);
        if (ob_get_level() > 0) {
            ob_end_flush();
        }
        exit;
    } catch(Error $e) {
        // Catch para erros fatais no POST
        ob_clean();
        error_log("API: Erro fatal no POST - " . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => true,
            'message' => 'Erro fatal ao processar requisição POST',
            'details' => $e->getMessage()
        ]);
        if (ob_get_level() > 0) {
            ob_end_flush();
        }
        exit;
    }
}

// Método não suportado
if (ob_get_level() > 0) {
    ob_clean();
}
header('Content-Type: application/json; charset=utf-8');
http_response_code(405);
echo json_encode(['error' => true, 'message' => 'Método não permitido']);
if (ob_get_level() > 0) {
    ob_end_flush();
}
exit;