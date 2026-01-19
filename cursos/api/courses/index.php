<?php
/**
 * Endpoint de Cursos EAD
 * GET /api/courses/index.php -> lista cursos
 * GET /api/courses/index.php?id=xxx -> detalhes do curso
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

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method !== 'GET') {
    json_response(405, ['error' => true, 'message' => 'Método não permitido']);
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    $courseId = $_GET['id'] ?? null;

    if ($courseId) {
        // Buscar curso específico com aulas
        $stmt = $pdo->prepare("
            SELECT 
                c.*,
                COUNT(DISTINCT i.id) as alunos_inscritos
            FROM cursos c
            LEFT JOIN inscricoes i ON i.curso_id = c.id
            WHERE c.id = ? AND c.status = 'publicado'
            GROUP BY c.id
        ");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch();

        if (!$course) {
            json_response(404, ['error' => true, 'message' => 'Curso não encontrado']);
        }

        // Buscar aulas do curso
        $stmt = $pdo->prepare("
            SELECT 
                id,
                titulo,
                descricao,
                video_url,
                duracao_video,
                thumbnail_url,
                ordem,
                eh_preview,
                recursos
            FROM aulas
            WHERE curso_id = ?
            ORDER BY ordem ASC
        ");
        $stmt->execute([$courseId]);
        $lessons = $stmt->fetchAll();

        // Converter JSON strings para arrays e renomear campos para API
        $courseData = [
            'id' => $course['id'],
            'title' => $course['titulo'],
            'description' => $course['descricao'],
            'thumbnail_url' => $course['thumbnail_url'],
            'category' => $course['categoria'],
            'instructor_name' => $course['nome_instrutor'],
            'instructor_bio' => $course['bio_instrutor'],
            'price' => (float)$course['preco'],
            'status' => $course['status'],
            'total_duration' => (int)$course['duracao_total'],
            'total_lessons' => (int)$course['total_aulas'],
            'enrolled_count' => (int)$course['alunos_inscritos'],
            'rating' => (float)$course['avaliacao'],
            'created_at' => $course['criado_em'],
            'updated_at' => $course['atualizado_em'],
        ];

        $lessonsData = [];
        foreach ($lessons as $lesson) {
            $lessonsData[] = [
                'id' => $lesson['id'],
                'title' => $lesson['titulo'],
                'description' => $lesson['descricao'],
                'video_url' => $lesson['video_url'],
                'video_duration' => (int)$lesson['duracao_video'],
                'thumbnail_url' => $lesson['thumbnail_url'],
                'order_index' => (int)$lesson['ordem'],
                'is_preview' => (bool)$lesson['eh_preview'],
                'resources' => json_decode($lesson['recursos'] ?? '[]', true) ?: [],
            ];
        }

        json_response(200, [
            'error' => false,
            'course' => $courseData,
            'lessons' => $lessonsData
        ]);
    } else {
        // Listar todos os cursos publicados
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = "SELECT 
                    c.*,
                    COUNT(DISTINCT i.id) as alunos_inscritos
                FROM cursos c
                LEFT JOIN inscricoes i ON i.curso_id = c.id
                WHERE c.status = 'publicado'";

        $params = [];

        if ($category) {
            $sql .= " AND c.categoria = ?";
            $params[] = $category;
        }

        if ($search) {
            $sql .= " AND (c.titulo LIKE ? OR c.descricao LIKE ?)";
            $searchTerm = "%{$search}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " GROUP BY c.id ORDER BY c.criado_em DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $courses = $stmt->fetchAll();

        $coursesData = [];
        foreach ($courses as $course) {
            $coursesData[] = [
                'id' => $course['id'],
                'title' => $course['titulo'],
                'description' => $course['descricao'],
                'thumbnail_url' => $course['thumbnail_url'],
                'category' => $course['categoria'],
                'instructor_name' => $course['nome_instrutor'],
                'instructor_bio' => $course['bio_instrutor'],
                'price' => (float)$course['preco'],
                'status' => $course['status'],
                'total_duration' => (int)$course['duracao_total'],
                'total_lessons' => (int)$course['total_aulas'],
                'enrolled_count' => (int)$course['alunos_inscritos'],
                'rating' => (float)$course['avaliacao'],
                'created_at' => $course['criado_em'],
                'updated_at' => $course['atualizado_em'],
            ];
        }

        json_response(200, [
            'error' => false,
            'courses' => $coursesData,
            'count' => count($coursesData)
        ]);
    }

} catch (PDOException $e) {
    error_log('Erro ao buscar cursos: ' . $e->getMessage());
    json_response(500, [
        'error' => true,
        'message' => 'Erro ao buscar cursos'
    ]);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response(500, [
        'error' => true,
        'message' => 'Erro inesperado'
    ]);
}
