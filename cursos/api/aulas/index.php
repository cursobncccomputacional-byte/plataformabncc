<?php
/**
 * API de Aulas (Formação Continuada)
 * CRUD completo para aulas dentro de módulos
 * 
 * GET    /api/aulas/index.php?modulo_id=xxx -> lista aulas de um módulo
 * GET    /api/aulas/index.php?id=xxx -> detalhes da aula
 * POST   /api/aulas/index.php -> cria aula (requer can_manage_courses)
 * PUT    /api/aulas/index.php -> atualiza aula (requer can_manage_courses)
 * DELETE /api/aulas/index.php -> deleta aula (requer can_manage_courses)
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

function json_response_aula(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$currentUser = getCurrentUser();

if (!$currentUser) {
    json_response_aula(401, ['error' => true, 'message' => 'Não autenticado']);
}

// Verificar permissão para operações de escrita
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    $userRole = strtolower($currentUser['role'] ?? '');
    $canManage = (bool)($currentUser['can_manage_courses'] ?? false);
    
    if ($userRole !== 'root' && !$canManage) {
        json_response_aula(403, [
            'error' => true,
            'message' => 'Você não tem permissão para gerenciar aulas. Solicite acesso ao administrador.'
        ]);
    }
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        json_response_aula(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response_aula(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    if ($method === 'GET') {
        $aulaId = $_GET['id'] ?? null;
        $moduloId = $_GET['modulo_id'] ?? null;

        if ($aulaId) {
            // Buscar aula específica
            $stmt = $pdo->prepare("
                SELECT a.*, m.titulo_modulo, m.curso_id, c.titulo as curso_titulo
                FROM aulas a
                INNER JOIN modulos m ON m.id = a.modulo_id
                INNER JOIN cursos c ON c.id = m.curso_id
                WHERE a.id = ?
            ");
            $stmt->execute([$aulaId]);
            $aula = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$aula) {
                json_response_aula(404, ['error' => true, 'message' => 'Aula não encontrada']);
            }

            json_response_aula(200, [
                'error' => false,
                'aula' => [
                    'id' => $aula['id'],
                    'curso_id' => $aula['curso_id'],
                    'curso_titulo' => $aula['curso_titulo'],
                    'modulo_id' => $aula['modulo_id'],
                    'modulo_titulo' => $aula['titulo_modulo'],
                    'titulo' => $aula['titulo'],
                    'descricao' => $aula['descricao'],
                    'video_url' => $aula['video_url'],
                    'duracao_video' => (int)($aula['duracao_video'] ?? 0),
                    'thumbnail_url' => $aula['thumbnail_url'],
                    'ordem' => (int)($aula['ordem'] ?? 0),
                    'criado_em' => $aula['criado_em'],
                    'atualizado_em' => $aula['atualizado_em'],
                ]
            ]);
        } elseif ($moduloId) {
            // Listar aulas de um módulo
            $stmt = $pdo->prepare("
                SELECT a.*
                FROM aulas a
                WHERE a.modulo_id = ?
                ORDER BY a.ordem ASC, a.criado_em ASC
            ");
            $stmt->execute([$moduloId]);
            $aulas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $aulasData = [];
            foreach ($aulas as $aula) {
                $aulasData[] = [
                    'id' => $aula['id'],
                    'modulo_id' => $aula['modulo_id'],
                    'titulo' => $aula['titulo'],
                    'descricao' => $aula['descricao'],
                    'video_url' => $aula['video_url'],
                    'duracao_video' => (int)($aula['duracao_video'] ?? 0),
                    'thumbnail_url' => $aula['thumbnail_url'],
                    'ordem' => (int)($aula['ordem'] ?? 0),
                    'criado_em' => $aula['criado_em'],
                    'atualizado_em' => $aula['atualizado_em'],
                ];
            }

            json_response_aula(200, [
                'error' => false,
                'aulas' => $aulasData,
                'count' => count($aulasData)
            ]);
        } else {
            json_response_aula(400, ['error' => true, 'message' => 'Informe id ou modulo_id']);
        }
    }

    if ($method === 'POST') {
        $data = read_json_body();

        $id = trim((string)($data['id'] ?? ''));
        $moduloId = trim((string)($data['modulo_id'] ?? ''));
        $titulo = trim((string)($data['titulo'] ?? ''));
        $descricao = isset($data['descricao']) ? trim((string)$data['descricao']) : null;
        $videoUrl = trim((string)($data['video_url'] ?? ''));
        $duracaoVideo = isset($data['duracao_video']) ? (int)$data['duracao_video'] : 0;
        $thumbnailUrl = isset($data['thumbnail_url']) ? trim((string)$data['thumbnail_url']) : null;
        $ordem = isset($data['ordem']) ? (int)$data['ordem'] : 0;

        // Validações
        if (empty($id) || empty($moduloId) || empty($titulo) || empty($videoUrl)) {
            json_response_aula(400, [
                'error' => true,
                'message' => 'Campos obrigatórios: id, modulo_id, titulo, video_url'
            ]);
        }

        // Verificar se o módulo existe e obter curso_id
        $checkModulo = $pdo->prepare("SELECT id, curso_id FROM modulos WHERE id = ?");
        $checkModulo->execute([$moduloId]);
        $modulo = $checkModulo->fetch(PDO::FETCH_ASSOC);
        
        if (!$modulo) {
            json_response_aula(404, ['error' => true, 'message' => 'Módulo não encontrado']);
        }

        $cursoId = $modulo['curso_id'];

        // Verificar se já existe aula com este ID
        $checkAula = $pdo->prepare("SELECT id FROM aulas WHERE id = ?");
        $checkAula->execute([$id]);
        if ($checkAula->fetch()) {
            json_response_aula(409, ['error' => true, 'message' => 'Aula com este ID já existe']);
        }

        // Criar aula
        $stmt = $pdo->prepare("
            INSERT INTO aulas (
                id, curso_id, modulo_id, titulo, descricao, video_url, 
                duracao_video, thumbnail_url, ordem
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id, $cursoId, $moduloId, $titulo, $descricao, $videoUrl,
            $duracaoVideo, $thumbnailUrl, $ordem
        ]);

        json_response_aula(201, [
            'error' => false,
            'message' => 'Aula criada com sucesso',
            'aula' => [
                'id' => $id,
                'titulo' => $titulo
            ]
        ]);
    }

    if ($method === 'PUT') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));

        if (empty($id)) {
            json_response_aula(400, ['error' => true, 'message' => 'ID da aula é obrigatório']);
        }

        // Verificar se existe
        $checkStmt = $pdo->prepare("SELECT id FROM aulas WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            json_response_aula(404, ['error' => true, 'message' => 'Aula não encontrada']);
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
        if (isset($data['video_url'])) {
            $updates[] = "video_url = ?";
            $params[] = trim((string)$data['video_url']);
        }
        if (isset($data['duracao_video'])) {
            $updates[] = "duracao_video = ?";
            $params[] = (int)$data['duracao_video'];
        }
        if (isset($data['thumbnail_url'])) {
            $updates[] = "thumbnail_url = ?";
            $params[] = trim((string)$data['thumbnail_url']) ?: null;
        }
        if (isset($data['ordem'])) {
            $updates[] = "ordem = ?";
            $params[] = (int)$data['ordem'];
        }
        if (isset($data['modulo_id'])) {
            // Se mudar de módulo, verificar se o novo módulo existe e obter curso_id
            $newModuloId = trim((string)$data['modulo_id']);
            $checkModulo = $pdo->prepare("SELECT id, curso_id FROM modulos WHERE id = ?");
            $checkModulo->execute([$newModuloId]);
            $modulo = $checkModulo->fetch(PDO::FETCH_ASSOC);
            
            if (!$modulo) {
                json_response_aula(404, ['error' => true, 'message' => 'Módulo não encontrado']);
            }

            $updates[] = "modulo_id = ?";
            $params[] = $newModuloId;
            $updates[] = "curso_id = ?";
            $params[] = $modulo['curso_id'];
        }

        if (empty($updates)) {
            json_response_aula(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }

        $params[] = $id;
        $sql = "UPDATE aulas SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        json_response_aula(200, [
            'error' => false,
            'message' => 'Aula atualizada com sucesso'
        ]);
    }

    if ($method === 'DELETE') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));

        if (empty($id)) {
            json_response_aula(400, ['error' => true, 'message' => 'ID da aula é obrigatório']);
        }

        $stmt = $pdo->prepare("DELETE FROM aulas WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            json_response_aula(200, [
                'error' => false,
                'message' => 'Aula deletada com sucesso'
            ]);
        } else {
            json_response_aula(404, ['error' => true, 'message' => 'Aula não encontrada']);
        }
    }

    json_response_aula(405, ['error' => true, 'message' => 'Método não permitido']);

} catch (PDOException $e) {
    error_log('Erro ao gerenciar aulas: ' . $e->getMessage());
    json_response_aula(500, [
        'error' => true,
        'message' => 'Erro ao gerenciar aulas'
    ]);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response_aula(500, [
        'error' => true,
        'message' => 'Erro inesperado'
    ]);
}
