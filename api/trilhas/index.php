<?php
/**
 * API de Trilhas Pedagógicas
 * CRUD completo para trilhas que agrupam atividades
 * 
 * GET    /api/trilhas/index.php -> lista trilhas
 * GET    /api/trilhas/index.php?id=xxx -> detalhes da trilha
 * GET    /api/trilhas/index.php?tipo=eixo_bncc -> trilhas por tipo
 * POST   /api/trilhas/index.php -> cria trilha (requer root)
 * PUT    /api/trilhas/index.php -> atualiza trilha (requer root)
 * DELETE /api/trilhas/index.php -> deleta trilha (requer root)
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response_trilha(int $status, array $payload): void {
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
        json_response_trilha(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Para GET, não precisa autenticação obrigatória (trilhas podem ser públicas)
$currentUser = getCurrentUser();

// Verificar permissão apenas para operações de escrita
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    if (!$currentUser) {
        json_response_trilha(401, ['error' => true, 'message' => 'Não autenticado']);
    }
    
    // Apenas root pode gerenciar trilhas
    if (($currentUser['role'] ?? '') !== 'root') {
        json_response_trilha(403, ['error' => true, 'message' => 'Acesso negado. Apenas root pode gerenciar trilhas']);
    }
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response_trilha(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
    }

    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        $tipo = $_GET['tipo'] ?? null;
        
        if ($id) {
            // Buscar trilha específica
            $stmt = $pdo->prepare("SELECT * FROM trilhas WHERE id = ?");
            $stmt->execute([$id]);
            $trilha = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$trilha) {
                json_response_trilha(404, ['error' => true, 'message' => 'Trilha não encontrada']);
            }
            
            // Buscar atividades associadas automaticamente
            $atividades = [];
            if ($trilha['tipo'] === 'eixo_bncc') {
                // Buscar atividades que têm este eixo BNCC no array JSON
                $stmtAtiv = $pdo->prepare("
                    SELECT id, nome_atividade, descricao, tipo, etapa, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
                    FROM atividades 
                    WHERE JSON_CONTAINS(COALESCE(eixos_bncc, '[]'), ?) 
                    AND ativo = 1
                    ORDER BY criado_em DESC
                ");
                $eixoJson = json_encode($trilha['valor']);
                $stmtAtiv->execute([$eixoJson]);
                $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
            } elseif ($trilha['tipo'] === 'etapa') {
                // Buscar atividades que têm esta etapa
                $stmtAtiv = $pdo->prepare("
                    SELECT id, nome_atividade, descricao, tipo, etapa, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
                    FROM atividades 
                    WHERE etapa = ? 
                    AND ativo = 1
                    ORDER BY criado_em DESC
                ");
                $stmtAtiv->execute([$trilha['valor']]);
                $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
            } elseif ($trilha['tipo'] === 'disciplina_transversal') {
                // Buscar atividades que têm esta disciplina transversal no array JSON
                $stmtAtiv = $pdo->prepare("
                    SELECT id, nome_atividade, descricao, tipo, etapa, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
                    FROM atividades 
                    WHERE JSON_CONTAINS(COALESCE(disciplinas_transversais, '[]'), ?) 
                    AND ativo = 1
                    ORDER BY criado_em DESC
                ");
                $disciplinaJson = json_encode($trilha['valor']);
                $stmtAtiv->execute([$disciplinaJson]);
                $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
            }
            
            // Processar atividades
            $atividadesData = [];
            foreach ($atividades as $atividade) {
                $eixosBncc = [];
                if (isset($atividade['eixos_bncc'])) {
                    if (is_string($atividade['eixos_bncc'])) {
                        $decoded = json_decode($atividade['eixos_bncc'], true);
                        $eixosBncc = is_array($decoded) ? $decoded : [];
                    }
                }
                
                $atividadesData[] = [
                    'id' => $atividade['id'],
                    'nome_atividade' => $atividade['nome_atividade'] ?? '',
                    'descricao' => $atividade['descricao'] ?? null,
                    'tipo' => $atividade['tipo'] ?? null,
                    'etapa' => $atividade['etapa'] ?? null,
                    'eixos_bncc' => $eixosBncc,
                    'thumbnail_url' => $atividade['thumbnail_url'] ?? null,
                    'video_url' => $atividade['video_url'] ?? null,
                    'duracao' => $atividade['duracao'] ?? null,
                    'nivel_dificuldade' => $atividade['nivel_dificuldade'] ?? null,
                ];
            }
            
            json_response_trilha(200, [
                'error' => false,
                'trilha' => $trilha,
                'atividades' => $atividadesData,
                'total_atividades' => count($atividadesData)
            ]);
        } else {
            // Listar todas as trilhas (com filtro opcional por tipo)
            $sql = "SELECT * FROM trilhas WHERE ativo = 1";
            $params = [];
            
            if ($tipo) {
                $sql .= " AND tipo = ?";
                $params[] = $tipo;
            }
            
            $sql .= " ORDER BY ordem ASC, titulo ASC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $trilhas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            json_response_trilha(200, [
                'error' => false,
                'trilhas' => $trilhas,
                'total' => count($trilhas)
            ]);
        }
    }

    if ($method === 'POST') {
        $data = read_json_body();
        
        $id = trim((string)($data['id'] ?? ''));
        $titulo = trim((string)($data['titulo'] ?? ''));
        $descricao = isset($data['descricao']) && trim((string)$data['descricao']) !== '' 
            ? trim((string)$data['descricao']) 
            : null;
        $tipo = (string)($data['tipo'] ?? '');
        $valor = trim((string)($data['valor'] ?? ''));
        $thumbnailUrl = isset($data['thumbnail_url']) && trim((string)$data['thumbnail_url']) !== '' 
            ? trim((string)$data['thumbnail_url']) 
            : null;
        $ordem = isset($data['ordem']) ? (int)$data['ordem'] : 0;
        
        // Validações
        if (empty($id)) {
            json_response_trilha(400, ['error' => true, 'message' => 'ID da trilha é obrigatório']);
        }
        if (empty($titulo)) {
            json_response_trilha(400, ['error' => true, 'message' => 'Título é obrigatório']);
        }
        if (empty($tipo)) {
            json_response_trilha(400, ['error' => true, 'message' => 'Tipo é obrigatório']);
        }
        if (empty($valor)) {
            json_response_trilha(400, ['error' => true, 'message' => 'Valor é obrigatório']);
        }
        
        $allowedTipos = ['eixo_bncc', 'etapa', 'disciplina_transversal'];
        if (!in_array($tipo, $allowedTipos, true)) {
            json_response_trilha(400, ['error' => true, 'message' => 'Tipo inválido. Use: eixo_bncc, etapa ou disciplina_transversal']);
        }
        
        // Verificar se já existe
        $checkStmt = $pdo->prepare("SELECT id FROM trilhas WHERE id = ?");
        $checkStmt->execute([$id]);
        if ($checkStmt->fetch()) {
            json_response_trilha(409, ['error' => true, 'message' => 'Trilha com este ID já existe']);
        }
        
        // Criar trilha
        try {
            $stmt = $pdo->prepare("
                INSERT INTO trilhas (id, titulo, descricao, tipo, valor, thumbnail_url, ordem, ativo)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            ");
            
            $stmt->execute([$id, $titulo, $descricao, $tipo, $valor, $thumbnailUrl, $ordem]);
        } catch (PDOException $e) {
            error_log('Erro no INSERT: ' . $e->getMessage());
            json_response_trilha(500, ['error' => true, 'message' => 'Erro ao criar trilha: ' . $e->getMessage()]);
        }
        
        json_response_trilha(201, [
            'error' => false,
            'message' => 'Trilha criada com sucesso',
            'trilha' => [
                'id' => $id,
                'titulo' => $titulo
            ]
        ]);
    }

    if ($method === 'PUT') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));
        
        if (empty($id)) {
            json_response_trilha(400, ['error' => true, 'message' => 'ID da trilha é obrigatório']);
        }
        
        // Verificar se existe
        $checkStmt = $pdo->prepare("SELECT id FROM trilhas WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            json_response_trilha(404, ['error' => true, 'message' => 'Trilha não encontrada']);
        }
        
        $updates = [];
        $params = [];
        
        if (isset($data['titulo'])) {
            $updates[] = "titulo = ?";
            $params[] = trim((string)$data['titulo']);
        }
        if (isset($data['descricao'])) {
            $updates[] = "descricao = ?";
            $params[] = trim((string)$data['descricao']) ?: null;
        }
        if (isset($data['tipo'])) {
            $updates[] = "tipo = ?";
            $params[] = (string)$data['tipo'];
        }
        if (isset($data['valor'])) {
            $updates[] = "valor = ?";
            $params[] = trim((string)$data['valor']);
        }
        if (isset($data['thumbnail_url'])) {
            $updates[] = "thumbnail_url = ?";
            $params[] = trim((string)$data['thumbnail_url']) ?: null;
        }
        if (isset($data['ordem'])) {
            $updates[] = "ordem = ?";
            $params[] = (int)$data['ordem'];
        }
        if (isset($data['ativo'])) {
            $updates[] = "ativo = ?";
            $params[] = (int)$data['ativo'];
        }
        
        if (empty($updates)) {
            json_response_trilha(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }
        
        $params[] = $id;
        $sql = "UPDATE trilhas SET " . implode(', ', $updates) . " WHERE id = ?";
        
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } catch (PDOException $e) {
            error_log('Erro no UPDATE: ' . $e->getMessage());
            json_response_trilha(500, ['error' => true, 'message' => 'Erro ao atualizar trilha: ' . $e->getMessage()]);
        }
        
        json_response_trilha(200, [
            'error' => false,
            'message' => 'Trilha atualizada com sucesso'
        ]);
    }

    if ($method === 'DELETE') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));
        
        if (empty($id)) {
            json_response_trilha(400, ['error' => true, 'message' => 'ID da trilha é obrigatório']);
        }
        
        // Verificar se existe
        $checkStmt = $pdo->prepare("SELECT id FROM trilhas WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            json_response_trilha(404, ['error' => true, 'message' => 'Trilha não encontrada']);
        }
        
        // Soft delete (marcar como inativo ao invés de deletar)
        try {
            $stmt = $pdo->prepare("UPDATE trilhas SET ativo = 0 WHERE id = ?");
            $stmt->execute([$id]);
        } catch (PDOException $e) {
            error_log('Erro no DELETE: ' . $e->getMessage());
            json_response_trilha(500, ['error' => true, 'message' => 'Erro ao deletar trilha: ' . $e->getMessage()]);
        }
        
        json_response_trilha(200, [
            'error' => false,
            'message' => 'Trilha deletada com sucesso'
        ]);
    }

} catch (PDOException $e) {
    error_log('Erro PDO: ' . $e->getMessage());
    json_response_trilha(500, [
        'error' => true,
        'message' => 'Erro no banco de dados',
        'details' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response_trilha(500, [
        'error' => true,
        'message' => 'Erro interno do servidor',
        'details' => $e->getMessage()
    ]);
}
