<?php
/**
 * Endpoint de Progresso EAD
 * GET /api/progress/index.php?course_id=xxx -> progresso do curso
 * POST /api/progress/index.php -> atualizar progresso
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
        $courseId = $_GET['course_id'] ?? null;
        
        if (!$courseId) {
            json_response(400, ['error' => true, 'message' => 'course_id é obrigatório']);
        }

        // Buscar progresso das aulas
        $stmt = $pdo->prepare("
            SELECT 
                pa.*,
                a.titulo as titulo_aula,
                a.ordem
            FROM progresso_aulas pa
            INNER JOIN aulas a ON a.id = pa.aula_id
            WHERE pa.usuario_id = ? AND pa.curso_id = ?
            ORDER BY a.ordem ASC
        ");
        $stmt->execute([$userId, $courseId]);
        $progress = $stmt->fetchAll();

        // Calcular progresso geral
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total_aulas,
                SUM(CASE WHEN pa.esta_concluida = 1 THEN 1 ELSE 0 END) as aulas_concluidas
            FROM aulas a
            LEFT JOIN progresso_aulas pa ON pa.aula_id = a.id AND pa.usuario_id = ?
            WHERE a.curso_id = ?
        ");
        $stmt->execute([$userId, $courseId]);
        $stats = $stmt->fetch();

        $percentage = $stats['total_aulas'] > 0 
            ? ($stats['aulas_concluidas'] / $stats['total_aulas']) * 100 
            : 0;

        // Atualizar progresso na inscrição
        $stmt = $pdo->prepare("
            UPDATE inscricoes 
            SET progresso_percentual = ?, ultimo_acesso_em = NOW()
            WHERE usuario_id = ? AND curso_id = ?
        ");
        $stmt->execute([$percentage, $userId, $courseId]);

        $progressData = [];
        foreach ($progress as $p) {
            $progressData[] = [
                'id' => (int)$p['id'],
                'user_id' => $p['usuario_id'],
                'course_id' => $p['curso_id'],
                'lesson_id' => $p['aula_id'],
                'watched_seconds' => (int)$p['segundos_assistidos'],
                'total_seconds' => (int)$p['total_segundos'],
                'is_completed' => (bool)$p['esta_concluida'],
                'completed_at' => $p['concluida_em'],
                'last_watched_at' => $p['ultima_visualizacao_em'],
                'lesson_title' => $p['titulo_aula'],
                'order_index' => (int)$p['ordem'],
            ];
        }

        // Incluir progresso de avaliações (avaliação ao final da aula - Módulo I)
        try {
            $stmtAv = $pdo->prepare("
                SELECT aula_id, concluida_em FROM progresso_avaliacoes
                WHERE usuario_id = ? AND curso_id = ?
            ");
            $stmtAv->execute([$userId, $courseId]);
            while ($row = $stmtAv->fetch(PDO::FETCH_ASSOC)) {
                $progressData[] = [
                    'id' => 0,
                    'user_id' => $userId,
                    'course_id' => $courseId,
                    'lesson_id' => 'avaliacao-' . $row['aula_id'],
                    'watched_seconds' => 0,
                    'total_seconds' => 0,
                    'is_completed' => true,
                    'completed_at' => $row['concluida_em'],
                    'last_watched_at' => $row['concluida_em'],
                    'lesson_title' => 'Avaliação',
                    'order_index' => 0,
                ];
            }
        } catch (PDOException $e) {
            // Tabela progresso_avaliacoes pode não existir ainda
        }

        json_response(200, [
            'error' => false,
            'progress' => $progressData,
            'percentage' => round($percentage, 2),
            'completed_lessons' => (int)$stats['aulas_concluidas'],
            'total_lessons' => (int)$stats['total_aulas']
        ]);
    } elseif ($method === 'POST') {
        $data = read_json_body();
        $courseId = $data['course_id'] ?? null;
        $lessonId = $data['lesson_id'] ?? null;
        $watchedSeconds = (int)($data['watched_seconds'] ?? 0);
        $totalSeconds = (int)($data['total_seconds'] ?? 0);
        $isCompleted = (bool)($data['is_completed'] ?? false);

        if (!$courseId || !$lessonId) {
            json_response(400, ['error' => true, 'message' => 'course_id e lesson_id são obrigatórios']);
        }

        // Avaliação ao final da aula (lesson_id = "avaliacao-{aula_id}")
        if (strpos($lessonId, 'avaliacao-') === 0) {
            $aulaId = substr($lessonId, strlen('avaliacao-'));
            if ($aulaId === '') {
                json_response(400, ['error' => true, 'message' => 'aula_id inválido para avaliação']);
            }
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO progresso_avaliacoes (usuario_id, curso_id, aula_id)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE concluida_em = NOW()
                ");
                $stmt->execute([$userId, $courseId, $aulaId]);
            } catch (PDOException $e) {
                error_log('progresso_avaliacoes: ' . $e->getMessage());
                json_response(500, ['error' => true, 'message' => 'Erro ao registrar conclusão da avaliação']);
            }
            json_response(200, ['error' => false, 'message' => 'Avaliação marcada como concluída']);
        }

        // Verificar se já existe progresso
        $stmt = $pdo->prepare("
            SELECT id FROM progresso_aulas 
            WHERE usuario_id = ? AND curso_id = ? AND aula_id = ?
        ");
        $stmt->execute([$userId, $courseId, $lessonId]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Atualizar
            $stmt = $pdo->prepare("
                UPDATE progresso_aulas 
                SET segundos_assistidos = ?, total_segundos = ?, 
                    esta_concluida = ?, ultima_visualizacao_em = NOW(),
                    concluida_em = CASE WHEN ? = 1 AND concluida_em IS NULL THEN NOW() ELSE concluida_em END
                WHERE usuario_id = ? AND curso_id = ? AND aula_id = ?
            ");
            $stmt->execute([$watchedSeconds, $totalSeconds, $isCompleted ? 1 : 0, $isCompleted ? 1 : 0, $userId, $courseId, $lessonId]);
        } else {
            // Criar
            $stmt = $pdo->prepare("
                INSERT INTO progresso_aulas 
                (usuario_id, curso_id, aula_id, segundos_assistidos, total_segundos, esta_concluida, concluida_em, ultima_visualizacao_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $completedAt = $isCompleted ? date('Y-m-d H:i:s') : null;
            $stmt->execute([$userId, $courseId, $lessonId, $watchedSeconds, $totalSeconds, $isCompleted ? 1 : 0, $completedAt]);
        }

        json_response(200, [
            'error' => false,
            'message' => 'Progresso atualizado'
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
