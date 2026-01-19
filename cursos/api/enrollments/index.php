<?php
/**
 * Endpoint de Inscrições EAD
 * POST /api/enrollments/index.php -> inscrever em curso
 * GET /api/enrollments/index.php?user_id=xxx -> cursos do usuário
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
        json_response(400, ['error' => true, 'message' => 'JSON inválido']);
    }
    return $data;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$currentUser = requireAuth();
$userId = $currentUser['id'] ?? null;

if (!$userId) {
    json_response(401, ['error' => true, 'message' => 'Não autenticado']);
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response(500, ['error' => true, 'message' => 'Erro de conexão']);
    }

    if ($method === 'GET') {
        // Buscar cursos do usuário
        $stmt = $pdo->prepare("
            SELECT 
                i.*,
                c.titulo as titulo_curso,
                c.thumbnail_url,
                c.nome_instrutor,
                c.total_aulas,
                c.duracao_total
            FROM inscricoes i
            INNER JOIN cursos c ON c.id = i.curso_id
            WHERE i.usuario_id = ?
            ORDER BY i.inscrito_em DESC
        ");
        $stmt->execute([$userId]);
        $enrollments = $stmt->fetchAll();

        $enrollmentsData = [];
        foreach ($enrollments as $enrollment) {
            $enrollmentsData[] = [
                'id' => (int)$enrollment['id'],
                'user_id' => $enrollment['usuario_id'],
                'course_id' => $enrollment['curso_id'],
                'enrolled_at' => $enrollment['inscrito_em'],
                'completed_at' => $enrollment['concluido_em'],
                'progress_percentage' => (float)$enrollment['progresso_percentual'],
                'last_accessed_at' => $enrollment['ultimo_acesso_em'],
                'course_title' => $enrollment['titulo_curso'],
                'thumbnail_url' => $enrollment['thumbnail_url'],
                'instructor_name' => $enrollment['nome_instrutor'],
                'total_lessons' => (int)$enrollment['total_aulas'],
                'total_duration' => (int)$enrollment['duracao_total'],
            ];
        }

        json_response(200, [
            'error' => false,
            'enrollments' => $enrollmentsData
        ]);
    } elseif ($method === 'POST') {
        // Inscrever em curso
        $data = read_json_body();
        $courseId = $data['course_id'] ?? null;

        if (!$courseId) {
            json_response(400, ['error' => true, 'message' => 'course_id é obrigatório']);
        }

        // Verificar se já está inscrito
        $stmt = $pdo->prepare("SELECT id FROM inscricoes WHERE usuario_id = ? AND curso_id = ?");
        $stmt->execute([$userId, $courseId]);
        if ($stmt->fetch()) {
            json_response(400, ['error' => true, 'message' => 'Já inscrito neste curso']);
        }

        // Verificar se curso existe e está publicado
        $stmt = $pdo->prepare("SELECT id FROM cursos WHERE id = ? AND status = 'publicado'");
        $stmt->execute([$courseId]);
        if (!$stmt->fetch()) {
            json_response(404, ['error' => true, 'message' => 'Curso não encontrado']);
        }

        // Criar inscrição
        $stmt = $pdo->prepare("
            INSERT INTO inscricoes (usuario_id, curso_id, inscrito_em)
            VALUES (?, ?, NOW())
        ");
        $stmt->execute([$userId, $courseId]);

        // Atualizar contador de inscritos
        $stmt = $pdo->prepare("
            UPDATE cursos 
            SET alunos_inscritos = alunos_inscritos + 1
            WHERE id = ?
        ");
        $stmt->execute([$courseId]);

        json_response(201, [
            'error' => false,
            'message' => 'Inscrição realizada com sucesso'
        ]);
    } else {
        json_response(405, ['error' => true, 'message' => 'Método não permitido']);
    }

} catch (PDOException $e) {
    error_log('Erro: ' . $e->getMessage());
    json_response(500, ['error' => true, 'message' => 'Erro ao processar']);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response(500, ['error' => true, 'message' => 'Erro inesperado']);
}
