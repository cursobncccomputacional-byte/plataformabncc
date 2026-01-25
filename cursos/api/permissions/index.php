<?php
/**
 * API de Permissões de Cursos
 * Gerencia quais usuários têm acesso a quais cursos
 * 
 * GET /api/permissions/index.php?user_id=xxx -> cursos permitidos para o usuário
 * GET /api/permissions/index.php?course_id=xxx -> usuários com acesso ao curso
 * POST /api/permissions/index.php -> criar permissão (root apenas)
 * DELETE /api/permissions/index.php -> remover permissão (root apenas)
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// CORS deve ser carregado PRIMEIRO para tratar preflight OPTIONS
require_once __DIR__ . '/../config/cors.php';

// Só carregar database e auth se não for preflight
if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../config/auth.php';
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function json_response(int $status, array $payload): void {
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
    json_response(401, ['error' => true, 'message' => 'Não autenticado']);
}

// Apenas root pode gerenciar permissões
if ($method === 'POST' || $method === 'DELETE') {
    if ($currentUser['role'] !== 'root') {
        json_response(403, ['error' => true, 'message' => 'Apenas root pode gerenciar permissões']);
    }
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    if ($method === 'GET') {
        $userId = $_GET['user_id'] ?? null;
        $courseId = $_GET['course_id'] ?? null;

        if ($userId) {
            // Segurança: se não for root, só pode ver suas próprias permissões
            if (($currentUser['role'] ?? '') !== 'root' && $userId !== ($currentUser['id'] ?? '')) {
                json_response(403, ['error' => true, 'message' => 'Acesso negado']);
            }
            // Buscar cursos permitidos para o usuário
            $stmt = $pdo->prepare("
                SELECT 
                    pc.curso_id,
                    c.titulo as curso_titulo,
                    c.thumbnail_url,
                    pc.criado_em
                FROM permissoes_cursos pc
                INNER JOIN cursos c ON c.id = pc.curso_id
                WHERE pc.usuario_id = ?
                ORDER BY c.titulo ASC
            ");
            $stmt->execute([$userId]);
            $permissions = $stmt->fetchAll();

            json_response(200, [
                'error' => false,
                'permissions' => $permissions
            ]);
        } elseif ($courseId) {
            // Buscar usuários com acesso ao curso
            $stmt = $pdo->prepare("
                SELECT 
                    pc.usuario_id,
                    u.nome as usuario_nome,
                    u.usuario as usuario_email,
                    pc.criado_em
                FROM permissoes_cursos pc
                INNER JOIN usuarios u ON u.id = pc.usuario_id
                WHERE pc.curso_id = ?
                ORDER BY u.nome ASC
            ");
            $stmt->execute([$courseId]);
            $permissions = $stmt->fetchAll();

            json_response(200, [
                'error' => false,
                'permissions' => $permissions
            ]);
        } else {
            json_response(400, ['error' => true, 'message' => 'Informe user_id ou course_id']);
        }
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $userId = trim((string)($data['user_id'] ?? ''));
        $courseId = trim((string)($data['course_id'] ?? ''));

        if (empty($userId) || empty($courseId)) {
            json_response(400, ['error' => true, 'message' => 'user_id e course_id são obrigatórios']);
        }

        // Verificar se o usuário existe
        $stmt = $pdo->prepare("SELECT id, nivel_acesso, can_manage_courses FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            json_response(404, ['error' => true, 'message' => 'Usuário não encontrado']);
        }

        // Permitir atribuir permissões para professor_cursos, admin ou usuários com can_manage_courses
        $canManage = (bool)($user['can_manage_courses'] ?? false);
        $role = strtolower((string)($user['nivel_acesso'] ?? ''));
        if ($role !== 'professor_cursos' && $role !== 'admin' && !$canManage) {
            json_response(400, ['error' => true, 'message' => 'Permissões de curso só podem ser atribuídas a usuários com perfil professor_cursos/admin ou com permissão can_manage_courses']);
        }

        // Verificar se o curso existe
        $stmt = $pdo->prepare("SELECT id, status, alunos_inscritos FROM cursos WHERE id = ?");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$course) {
            json_response(404, ['error' => true, 'message' => 'Curso não encontrado']);
        }

        // Verificar se já existe
        $stmt = $pdo->prepare("SELECT id FROM permissoes_cursos WHERE usuario_id = ? AND curso_id = ?");
        $stmt->execute([$userId, $courseId]);
        if ($stmt->fetch()) {
            json_response(409, ['error' => true, 'message' => 'Permissão já existe']);
        }

        // Criar permissão
        $stmt = $pdo->prepare("
            INSERT INTO permissoes_cursos (usuario_id, curso_id, criado_por)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$userId, $courseId, $currentUser['id']]);

        // Se o curso já está publicado, criar inscrição automaticamente
        // (isso faz o curso aparecer em "Meus Cursos" sem precisar clicar em "Explorar Cursos")
        $inscrito = false;
        if (($course['status'] ?? '') === 'publicado') {
            $stmt = $pdo->prepare("SELECT id FROM inscricoes WHERE usuario_id = ? AND curso_id = ?");
            $stmt->execute([$userId, $courseId]);
            if (!$stmt->fetch()) {
                $stmt = $pdo->prepare("INSERT INTO inscricoes (usuario_id, curso_id, inscrito_em) VALUES (?, ?, NOW())");
                $stmt->execute([$userId, $courseId]);

                // Atualizar contador de inscritos
                $stmt = $pdo->prepare("UPDATE cursos SET alunos_inscritos = alunos_inscritos + 1 WHERE id = ?");
                $stmt->execute([$courseId]);
            }
            $inscrito = true;
        }

        json_response(201, [
            'error' => false,
            'message' => 'Permissão criada com sucesso',
            'enrollment_created' => $inscrito
        ]);
    }

    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $userId = trim((string)($data['user_id'] ?? ''));
        $courseId = trim((string)($data['course_id'] ?? ''));

        if (empty($userId) || empty($courseId)) {
            json_response(400, ['error' => true, 'message' => 'user_id e course_id são obrigatórios']);
        }

        // Buscar se existe inscrição antes de remover (para ajustar contador)
        $hadEnrollment = false;
        $stmt = $pdo->prepare("SELECT id FROM inscricoes WHERE usuario_id = ? AND curso_id = ?");
        $stmt->execute([$userId, $courseId]);
        if ($stmt->fetch()) {
            $hadEnrollment = true;
        }

        $stmt = $pdo->prepare("DELETE FROM permissoes_cursos WHERE usuario_id = ? AND curso_id = ?");
        $stmt->execute([$userId, $courseId]);

        if ($stmt->rowCount() > 0) {
            // Remover inscrição também (para o curso sumir de "Meus Cursos")
            $stmt = $pdo->prepare("DELETE FROM inscricoes WHERE usuario_id = ? AND curso_id = ?");
            $stmt->execute([$userId, $courseId]);

            if ($hadEnrollment) {
                // Evitar contador negativo
                $stmt = $pdo->prepare("UPDATE cursos SET alunos_inscritos = GREATEST(alunos_inscritos - 1, 0) WHERE id = ?");
                $stmt->execute([$courseId]);
            }

            json_response(200, [
                'error' => false,
                'message' => 'Permissão removida com sucesso',
                'enrollment_removed' => $hadEnrollment
            ]);
        } else {
            json_response(404, ['error' => true, 'message' => 'Permissão não encontrada']);
        }
    }

    json_response(405, ['error' => true, 'message' => 'Método não permitido']);

} catch (PDOException $e) {
    error_log('Erro ao gerenciar permissões: ' . $e->getMessage());
    json_response(500, [
        'error' => true,
        'message' => 'Erro ao gerenciar permissões'
    ]);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response(500, [
        'error' => true,
        'message' => 'Erro inesperado'
    ]);
}
