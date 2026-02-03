<?php
/**
 * API de Sessões e Atividades
 * 
 * GET    /api/sessions/index.php?action=list          -> Lista sessões
 * GET    /api/sessions/index.php?action=activities     -> Lista atividades
 * GET    /api/sessions/index.php?action=analytics     -> Analytics de usuários
 * POST   /api/sessions/index.php?action=register       -> Registra atividade
 * POST   /api/sessions/index.php?action=logout         -> Registra logout de sessão
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

// Preflight CORS: responder OPTIONS com 200 antes de qualquer auth
if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        json_response(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

function getClientIp(): string {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function getUserAgent(): string {
    return $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
}

// Autenticação - verificar se está autenticado sem enviar headers ainda
$userId = isAuthenticated();
if (!$userId) {
    json_response(401, ['error' => true, 'message' => 'Não autenticado']);
}

// Obter dados do usuário
$currentUser = getCurrentUser();
if (!$currentUser) {
    json_response(401, ['error' => true, 'message' => 'Usuário não encontrado']);
}

$currentRole = $currentUser['role'] ?? null;
$currentUserId = $currentUser['id'] ?? null;

if (!$currentUserId) {
    json_response(401, ['error' => true, 'message' => 'ID de usuário não encontrado']);
}

$action = $_GET['action'] ?? '';

// Verificar se as tabelas existem
try {
    global $pdo;
    
    // Verificar se tabela sessoes existe
    $checkSessoes = $pdo->query("SHOW TABLES LIKE 'sessoes'");
    $sessoesExists = $checkSessoes->rowCount() > 0;
    
    // Verificar se tabela atividades_sessao existe
    $checkAtividades = $pdo->query("SHOW TABLES LIKE 'atividades_sessao'");
    $atividadesExists = $checkAtividades->rowCount() > 0;
    
    if (!$sessoesExists || !$atividadesExists) {
        json_response(503, [
            'error' => true,
            'message' => 'Tabelas de sessões não encontradas. Execute o script SQL create-sessions-table.sql primeiro.',
            'sessoes_exists' => $sessoesExists,
            'atividades_exists' => $atividadesExists
        ]);
    }
} catch(PDOException $e) {
    json_response(500, [
        'error' => true,
        'message' => 'Erro ao verificar tabelas',
        'details' => $e->getMessage()
    ]);
}

try {
    global $pdo;

    switch ($action) {
        case 'register':
            // Registrar login ou atividade
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                json_response(405, ['error' => true, 'message' => 'Método não permitido']);
            }

            $data = read_json_body();
            $tipo = $data['tipo'] ?? 'activity'; // 'login' ou 'activity'
            $usuarioId = $data['usuario_id'] ?? $currentUserId;

            if ($tipo === 'login') {
                // Registrar login
                // Verificar se já existe uma sessão ativa para este usuário
                $checkSessaoAtiva = $pdo->prepare("
                    SELECT id FROM sessoes 
                    WHERE usuario_id = ? AND data_logout IS NULL 
                    ORDER BY data_login DESC LIMIT 1
                ");
                $checkSessaoAtiva->execute([$usuarioId]);
                $sessaoAtiva = $checkSessaoAtiva->fetch();
                
                if ($sessaoAtiva) {
                    // Retornar sessão existente
                    json_response(200, [
                        'error' => false,
                        'sessao_id' => $sessaoAtiva['id'],
                        'message' => 'Sessão ativa já existe',
                        'existing' => true
                    ]);
                } else {
                    // Criar nova sessão
                    $sessaoId = bin2hex(random_bytes(16));
                    $sessionId = session_id();
                    $ipAddress = getClientIp();
                    $userAgent = getUserAgent();

                    // Buscar criado_por do usuário
                    $stmt = $pdo->prepare("SELECT criado_por FROM usuarios WHERE id = ?");
                    $stmt->execute([$usuarioId]);
                    $user = $stmt->fetch();
                    $criadoPor = $user['criado_por'] ?? null;

                    $stmt = $pdo->prepare("
                        INSERT INTO sessoes (id, usuario_id, session_id, ip_address, user_agent, criado_por)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([$sessaoId, $usuarioId, $sessionId, $ipAddress, $userAgent, $criadoPor]);

                    json_response(200, [
                        'error' => false,
                        'sessao_id' => $sessaoId,
                        'message' => 'Login registrado com sucesso'
                    ]);
                }
            } else {
                // Registrar atividade
                $sessaoId = $data['sessao_id'] ?? null;
                $tipoAtividade = $data['tipo_atividade'] ?? 'view_page';
                $recursoId = $data['recurso_id'] ?? null;
                $recursoTitulo = $data['recurso_titulo'] ?? null;
                $detalhes = $data['detalhes'] ?? null;

                if (!$sessaoId) {
                    // Buscar sessão ativa mais recente do usuário
                    $stmt = $pdo->prepare("
                        SELECT id FROM sessoes 
                        WHERE usuario_id = ? AND data_logout IS NULL 
                        ORDER BY data_login DESC LIMIT 1
                    ");
                    $stmt->execute([$usuarioId]);
                    $sessao = $stmt->fetch();
                    $sessaoId = $sessao['id'] ?? null;
                }

                if (!$sessaoId) {
                    json_response(400, ['error' => true, 'message' => 'Nenhuma sessão ativa encontrada']);
                }

                // Buscar criado_por do usuário
                $stmt = $pdo->prepare("SELECT criado_por FROM usuarios WHERE id = ?");
                $stmt->execute([$usuarioId]);
                $user = $stmt->fetch();
                $criadoPor = $user['criado_por'] ?? null;

                $atividadeId = bin2hex(random_bytes(16));
                $stmt = $pdo->prepare("
                    INSERT INTO atividades_sessao 
                    (id, sessao_id, usuario_id, tipo_atividade, recurso_id, recurso_titulo, detalhes, ip_address, criado_por)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $atividadeId, $sessaoId, $usuarioId, $tipoAtividade, 
                    $recursoId, $recursoTitulo, $detalhes, getClientIp(), $criadoPor
                ]);

                json_response(200, [
                    'error' => false,
                    'atividade_id' => $atividadeId,
                    'message' => 'Atividade registrada com sucesso'
                ]);
            }
            break;

        case 'logout':
            // Registrar logout
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                json_response(405, ['error' => true, 'message' => 'Método não permitido']);
            }

            $data = read_json_body();
            $sessaoId = $data['sessao_id'] ?? null;
            $usuarioId = $data['usuario_id'] ?? $currentUserId;
            $tipoLogout = $data['tipo_logout'] ?? 'manual'; // 'manual', 'inativo', 'timeout', 'forcado'

            if (!$sessaoId) {
                // Buscar sessão ativa mais recente
                $stmt = $pdo->prepare("
                    SELECT id, data_login FROM sessoes 
                    WHERE usuario_id = ? AND data_logout IS NULL 
                    ORDER BY data_login DESC LIMIT 1
                ");
                $stmt->execute([$usuarioId]);
                $sessao = $stmt->fetch();
                
                if (!$sessao) {
                    // Se não houver sessão ativa, retornar sucesso (pode já ter sido encerrada)
                    json_response(200, [
                        'error' => false,
                        'message' => 'Nenhuma sessão ativa encontrada (pode já ter sido encerrada)',
                        'no_session' => true
                    ]);
                }
                
                $sessaoId = $sessao['id'];
                $dataLogin = new DateTime($sessao['data_login']);
            } else {
                $stmt = $pdo->prepare("SELECT data_login, data_logout FROM sessoes WHERE id = ?");
                $stmt->execute([$sessaoId]);
                $sessao = $stmt->fetch();
                if (!$sessao) {
                    json_response(404, ['error' => true, 'message' => 'Sessão não encontrada']);
                }
                // Se já foi encerrada, retornar sucesso
                if ($sessao['data_logout']) {
                    json_response(200, [
                        'error' => false,
                        'message' => 'Sessão já foi encerrada anteriormente',
                        'already_closed' => true
                    ]);
                }
                $dataLogin = new DateTime($sessao['data_login']);
            }

            $dataLogout = new DateTime();
            $tempoSessao = $dataLogout->getTimestamp() - $dataLogin->getTimestamp();

            $stmt = $pdo->prepare("
                UPDATE sessoes 
                SET data_logout = NOW(), tempo_sessao = ?, tipo_logout = ?
                WHERE id = ?
            ");
            $stmt->execute([$tempoSessao, $tipoLogout, $sessaoId]);

            json_response(200, [
                'error' => false,
                'message' => 'Logout registrado com sucesso',
                'tempo_sessao' => $tempoSessao
            ]);
            break;

        case 'list':
            // Listar sessões
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                json_response(405, ['error' => true, 'message' => 'Método não permitido']);
            }

            $usuarioIdFiltro = $_GET['usuario_id'] ?? null;
            $dataInicio = $_GET['data_inicio'] ?? null;
            $dataFim = $_GET['data_fim'] ?? null;
            $limit = (int)($_GET['limit'] ?? 100);
            $offset = (int)($_GET['offset'] ?? 0);

            $where = [];
            $params = [];

            // Filtro por usuário gerenciado (admin só vê seus usuários)
            if ($currentRole === 'admin') {
                $where[] = "s.criado_por = ?";
                $params[] = $currentUserId;
            } elseif ($currentRole === 'root') {
                // Root vê todos
            } else {
                // Outros perfis só veem suas próprias sessões
                $where[] = "s.usuario_id = ?";
                $params[] = $currentUserId;
            }

            if ($usuarioIdFiltro) {
                $where[] = "s.usuario_id = ?";
                $params[] = $usuarioIdFiltro;
            }

            if ($dataInicio) {
                $where[] = "s.data_login >= ?";
                $params[] = $dataInicio;
            }

            if ($dataFim) {
                $where[] = "s.data_login <= ?";
                $params[] = $dataFim;
            }

            $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

            $stmt = $pdo->prepare("
                SELECT 
                    s.id,
                    s.usuario_id,
                    u.nome as usuario_nome,
                    u.usuario as usuario_email,
                    s.session_id,
                    s.ip_address,
                    s.user_agent,
                    s.data_login,
                    s.data_logout,
                    s.tempo_sessao,
                    s.tipo_logout,
                    (SELECT COUNT(*) FROM atividades_sessao WHERE sessao_id = s.id) as total_atividades
                FROM sessoes s
                INNER JOIN usuarios u ON s.usuario_id = u.id
                {$whereClause}
                ORDER BY s.data_login DESC
                LIMIT ? OFFSET ?
            ");
            $params[] = $limit;
            $params[] = $offset;
            $stmt->execute($params);
            $sessoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            json_response(200, [
                'error' => false,
                'sessoes' => $sessoes
            ]);
            break;

        case 'activities':
            // Listar atividades
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                json_response(405, ['error' => true, 'message' => 'Método não permitido']);
            }

            $sessaoIdFiltro = $_GET['sessao_id'] ?? null;
            $usuarioIdFiltro = $_GET['usuario_id'] ?? null;
            $tipoAtividade = $_GET['tipo_atividade'] ?? null;
            $limit = (int)($_GET['limit'] ?? 100);
            $offset = (int)($_GET['offset'] ?? 0);

            $where = [];
            $params = [];

            // Filtro por usuário gerenciado
            if ($currentRole === 'admin') {
                $where[] = "a.criado_por = ?";
                $params[] = $currentUserId;
            } elseif ($currentRole === 'root') {
                // Root vê todos
            } else {
                $where[] = "a.usuario_id = ?";
                $params[] = $currentUserId;
            }

            if ($sessaoIdFiltro) {
                $where[] = "a.sessao_id = ?";
                $params[] = $sessaoIdFiltro;
            }

            if ($usuarioIdFiltro) {
                $where[] = "a.usuario_id = ?";
                $params[] = $usuarioIdFiltro;
            }

            if ($tipoAtividade) {
                $where[] = "a.tipo_atividade = ?";
                $params[] = $tipoAtividade;
            }

            $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

            $stmt = $pdo->prepare("
                SELECT 
                    a.id,
                    a.sessao_id,
                    a.usuario_id,
                    u.nome as usuario_nome,
                    u.usuario as usuario_email,
                    a.tipo_atividade,
                    a.recurso_id,
                    a.recurso_titulo,
                    a.detalhes,
                    a.ip_address,
                    a.data_atividade
                FROM atividades_sessao a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                {$whereClause}
                ORDER BY a.data_atividade DESC
                LIMIT ? OFFSET ?
            ");
            $params[] = $limit;
            $params[] = $offset;
            $stmt->execute($params);
            $atividades = $stmt->fetchAll(PDO::FETCH_ASSOC);

            json_response(200, [
                'error' => false,
                'atividades' => $atividades
            ]);
            break;

        case 'analytics':
            // Analytics de usuários
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                json_response(405, ['error' => true, 'message' => 'Método não permitido']);
            }

            $usuarioIdFiltro = $_GET['usuario_id'] ?? null;
            $dataInicio = $_GET['data_inicio'] ?? null;
            $dataFim = $_GET['data_fim'] ?? null;

            $where = [];
            $params = [];

            // Filtro por usuário gerenciado
            if ($currentRole === 'admin') {
                $where[] = "u.criado_por = ?";
                $params[] = $currentUserId;
            } elseif ($currentRole === 'root') {
                // Root vê todos
            } else {
                $where[] = "u.id = ?";
                $params[] = $currentUserId;
            }

            if ($usuarioIdFiltro) {
                $where[] = "u.id = ?";
                $params[] = $usuarioIdFiltro;
            }

            $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

            // Buscar analytics por usuário
            $stmt = $pdo->prepare("
                SELECT 
                    u.id as usuario_id,
                    u.nome as usuario_nome,
                    u.usuario as usuario_email,
                    COUNT(DISTINCT s.id) as total_sessoes,
                    SUM(s.tempo_sessao) as tempo_total_segundos,
                    COUNT(DISTINCT CASE WHEN a.tipo_atividade LIKE 'view_activity%' THEN a.id END) as total_atividades,
                    COUNT(DISTINCT CASE WHEN a.tipo_atividade LIKE 'view_document%' THEN a.id END) as total_documentos,
                    COUNT(DISTINCT CASE WHEN a.tipo_atividade LIKE 'view_video%' THEN a.id END) as total_videos,
                    MAX(s.data_login) as ultimo_login
                FROM usuarios u
                LEFT JOIN sessoes s ON u.id = s.usuario_id
                LEFT JOIN atividades_sessao a ON s.id = a.sessao_id
                {$whereClause}
                GROUP BY u.id, u.nome, u.usuario
                ORDER BY ultimo_login DESC
            ");
            $stmt->execute($params);
            $analytics = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Formatar resultados
            $resultado = array_map(function($row) {
                return [
                    'userId' => $row['usuario_id'],
                    'userName' => $row['usuario_nome'],
                    'userEmail' => $row['usuario_email'],
                    'totalSessions' => (int)$row['total_sessoes'],
                    'totalTimeSpent' => (int)($row['tempo_total_segundos'] ?? 0) / 60, // converter para minutos
                    'totalActivities' => (int)$row['total_atividades'],
                    'totalDocuments' => (int)$row['total_documentos'],
                    'totalVideos' => (int)$row['total_videos'],
                    'lastLogin' => $row['ultimo_login'] ?? null
                ];
            }, $analytics);

            json_response(200, [
                'error' => false,
                'analytics' => $resultado
            ]);
            break;

        default:
            json_response(400, ['error' => true, 'message' => 'Ação não especificada']);
    }

} catch(PDOException $e) {
    // Log do erro para debug
    error_log("Erro na API de sessões: " . $e->getMessage());
    error_log("SQL State: " . $e->getCode());
    error_log("Trace: " . $e->getTraceAsString());
    
    json_response(500, [
        'error' => true,
        'message' => 'Erro ao processar requisição',
        'details' => $e->getMessage(),
        'code' => $e->getCode(),
        'sql_state' => $e->errorInfo[0] ?? null
    ]);
} catch(Exception $e) {
    error_log("Erro geral na API de sessões: " . $e->getMessage());
    
    json_response(500, [
        'error' => true,
        'message' => 'Erro ao processar requisição',
        'details' => $e->getMessage()
    ]);
}
