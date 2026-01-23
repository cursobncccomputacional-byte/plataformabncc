<?php
/**
 * API de Módulos (Formação Continuada)
 * CRUD completo para módulos dentro de cursos
 * 
 * GET    /api/modulos/index.php?curso_id=xxx -> lista módulos de um curso
 * GET    /api/modulos/index.php?id=xxx -> detalhes do módulo
 * POST   /api/modulos/index.php -> cria módulo (requer can_manage_courses)
 * PUT    /api/modulos/index.php -> atualiza módulo (requer can_manage_courses)
 * DELETE /api/modulos/index.php -> deleta módulo (requer can_manage_courses)
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

function json_response_mod(int $status, array $payload): void {
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
    json_response_mod(401, ['error' => true, 'message' => 'Não autenticado']);
}

// Verificar permissão para operações de escrita
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    $userRole = strtolower($currentUser['role'] ?? '');
    $canManage = (bool)($currentUser['can_manage_courses'] ?? false);
    
    if ($userRole !== 'root' && !$canManage) {
        json_response_mod(403, [
            'error' => true,
            'message' => 'Você não tem permissão para gerenciar cursos. Solicite acesso ao administrador.'
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
        json_response_mod(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response_mod(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    if ($method === 'GET') {
        $moduloId = $_GET['id'] ?? null;
        $cursoId = $_GET['curso_id'] ?? null;

        if ($moduloId) {
            // Buscar módulo específico
            $stmt = $pdo->prepare("
                SELECT m.*, c.titulo as curso_titulo
                FROM modulos m
                INNER JOIN cursos c ON c.id = m.curso_id
                WHERE m.id = ?
            ");
            $stmt->execute([$moduloId]);
            $modulo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$modulo) {
                json_response_mod(404, ['error' => true, 'message' => 'Módulo não encontrado']);
            }

            // Buscar aulas do módulo
            $stmtAulas = $pdo->prepare("
                SELECT id, titulo, video_url, ordem, duracao_video
                FROM aulas
                WHERE modulo_id = ?
                ORDER BY ordem ASC
            ");
            $stmtAulas->execute([$moduloId]);
            $aulas = $stmtAulas->fetchAll(PDO::FETCH_ASSOC);

            json_response_mod(200, [
                'error' => false,
                'modulo' => [
                    'id' => $modulo['id'],
                    'curso_id' => $modulo['curso_id'],
                    'curso_titulo' => $modulo['curso_titulo'],
                    'titulo_modulo' => $modulo['titulo_modulo'],
                    'descricao' => $modulo['descricao'],
                    'ordem' => (int)$modulo['ordem'],
                    'criado_em' => $modulo['criado_em'],
                    'atualizado_em' => $modulo['atualizado_em'],
                    'aulas' => $aulas,
                ]
            ]);
        } elseif ($cursoId) {
            // Listar módulos de um curso
            $stmt = $pdo->prepare("
                SELECT m.*, 
                       COUNT(a.id) as total_aulas
                FROM modulos m
                LEFT JOIN aulas a ON a.modulo_id = m.id
                WHERE m.curso_id = ?
                GROUP BY m.id
                ORDER BY m.ordem ASC, m.criado_em ASC
            ");
            $stmt->execute([$cursoId]);
            $modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $modulosData = [];
            foreach ($modulos as $modulo) {
                $modulosData[] = [
                    'id' => $modulo['id'],
                    'curso_id' => $modulo['curso_id'],
                    'titulo_modulo' => $modulo['titulo_modulo'],
                    'descricao' => $modulo['descricao'],
                    'ordem' => (int)$modulo['ordem'],
                    'total_aulas' => (int)$modulo['total_aulas'],
                    'criado_em' => $modulo['criado_em'],
                    'atualizado_em' => $modulo['atualizado_em'],
                ];
            }

            json_response_mod(200, [
                'error' => false,
                'modulos' => $modulosData,
                'count' => count($modulosData)
            ]);
        } else {
            json_response_mod(400, ['error' => true, 'message' => 'Informe id ou curso_id']);
        }
    }

    if ($method === 'POST') {
        $data = read_json_body();

        $id = trim((string)($data['id'] ?? ''));
        $cursoId = trim((string)($data['curso_id'] ?? ''));
        $tituloModulo = trim((string)($data['titulo_modulo'] ?? ''));
        $descricao = isset($data['descricao']) ? trim((string)$data['descricao']) : null;
        $ordem = isset($data['ordem']) ? (int)$data['ordem'] : 0;

        // Validações
        if (empty($id) || empty($cursoId) || empty($tituloModulo)) {
            json_response_mod(400, [
                'error' => true,
                'message' => 'Campos obrigatórios: id, curso_id, titulo_modulo'
            ]);
        }

        // Verificar se o curso existe
        $checkCurso = $pdo->prepare("SELECT id FROM cursos WHERE id = ?");
        $checkCurso->execute([$cursoId]);
        if (!$checkCurso->fetch()) {
            json_response_mod(404, ['error' => true, 'message' => 'Curso não encontrado']);
        }

        // Verificar se já existe módulo com este ID
        $checkModulo = $pdo->prepare("SELECT id FROM modulos WHERE id = ?");
        $checkModulo->execute([$id]);
        if ($checkModulo->fetch()) {
            json_response_mod(409, ['error' => true, 'message' => 'Módulo com este ID já existe']);
        }

        // Criar módulo
        $stmt = $pdo->prepare("
            INSERT INTO modulos (id, curso_id, titulo_modulo, descricao, ordem)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$id, $cursoId, $tituloModulo, $descricao, $ordem]);

        json_response_mod(201, [
            'error' => false,
            'message' => 'Módulo criado com sucesso',
            'modulo' => [
                'id' => $id,
                'titulo_modulo' => $tituloModulo
            ]
        ]);
    }

    if ($method === 'PUT') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));

        if (empty($id)) {
            json_response_mod(400, ['error' => true, 'message' => 'ID do módulo é obrigatório']);
        }

        // Verificar se existe
        $checkStmt = $pdo->prepare("SELECT id FROM modulos WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            json_response_mod(404, ['error' => true, 'message' => 'Módulo não encontrado']);
        }

        $updates = [];
        $params = [];

        if (isset($data['titulo_modulo'])) {
            $updates[] = "titulo_modulo = ?";
            $params[] = trim((string)$data['titulo_modulo']);
        }
        if (isset($data['descricao'])) {
            $updates[] = "descricao = ?";
            $params[] = trim((string)$data['descricao']) ?: null;
        }
        if (isset($data['ordem'])) {
            $updates[] = "ordem = ?";
            $params[] = (int)$data['ordem'];
        }

        if (empty($updates)) {
            json_response_mod(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }

        $params[] = $id;
        $sql = "UPDATE modulos SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        json_response_mod(200, [
            'error' => false,
            'message' => 'Módulo atualizado com sucesso'
        ]);
    }

    if ($method === 'DELETE') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));

        if (empty($id)) {
            json_response_mod(400, ['error' => true, 'message' => 'ID do módulo é obrigatório']);
        }

        $stmt = $pdo->prepare("DELETE FROM modulos WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            json_response_mod(200, [
                'error' => false,
                'message' => 'Módulo deletado com sucesso'
            ]);
        } else {
            json_response_mod(404, ['error' => true, 'message' => 'Módulo não encontrado']);
        }
    }

    json_response_mod(405, ['error' => true, 'message' => 'Método não permitido']);

} catch (PDOException $e) {
    error_log('Erro ao gerenciar módulos: ' . $e->getMessage());
    json_response_mod(500, [
        'error' => true,
        'message' => 'Erro ao gerenciar módulos'
    ]);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response_mod(500, [
        'error' => true,
        'message' => 'Erro inesperado'
    ]);
}
