<?php
/**
 * Endpoint de Cursos EAD
 * GET    /api/courses/index.php -> lista cursos
 * GET    /api/courses/index.php?id=xxx -> detalhes do curso
 * POST   /api/courses/index.php -> cria curso (root apenas)
 * PUT    /api/courses/index.php -> atualiza curso (root apenas)
 * DELETE /api/courses/index.php -> deleta curso (root apenas)
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

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    if ($method === 'GET') {
        $courseId = $_GET['id'] ?? null;

        if ($courseId) {
        // Verificar autenticação
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            json_response(401, ['error' => true, 'message' => 'Não autenticado']);
        }

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

        // Verificar permissão de acesso ao curso
        $userRole = strtolower($currentUser['role'] ?? '');
        
        // Root e professor têm acesso a todos os cursos
        if ($userRole !== 'root' && $userRole !== 'professor') {
            // professor_cursos precisa ter permissão específica
            if ($userRole === 'professor_cursos') {
                $stmt = $pdo->prepare("
                    SELECT id FROM permissoes_cursos 
                    WHERE usuario_id = ? AND curso_id = ?
                ");
                $stmt->execute([$currentUser['id'], $courseId]);
                if (!$stmt->fetch()) {
                    json_response(403, ['error' => true, 'message' => 'Você não tem permissão para acessar este curso']);
                }
            }
        }

        // Buscar aulas do curso organizadas por módulo
        $stmt = $pdo->prepare("
            SELECT 
                id,
                titulo,
                descricao,
                video_url,
                duracao_video,
                thumbnail_url,
                ordem,
                modulo,
                eh_preview,
                recursos
            FROM aulas
            WHERE curso_id = ?
            ORDER BY modulo ASC, ordem ASC
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
                'module' => isset($lesson['modulo']) ? $lesson['modulo'] : 'I', // Módulo I ou II (padrão: I)
                'is_preview' => (bool)$lesson['eh_preview'],
                'resources' => [], // Não usar recursos/documentos, apenas vídeos
            ];
        }

        json_response(200, [
            'error' => false,
            'course' => $courseData,
            'lessons' => $lessonsData
        ]);
    } else {
        // Verificar autenticação
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            json_response(401, ['error' => true, 'message' => 'Não autenticado']);
        }

        // Listar cursos (filtrar por permissão se for professor_cursos)
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;
        $userRole = strtolower($currentUser['role'] ?? '');

        // Root e usuários com can_manage_courses veem todos os cursos (incluindo rascunhos para gerenciamento)
        // Professor e professor_cursos veem apenas cursos publicados
        $canManageCourses = (bool)($currentUser['can_manage_courses'] ?? false);
        if ($userRole === 'root' || $canManageCourses) {
            $sql = "SELECT 
                        c.*,
                        COUNT(DISTINCT i.id) as alunos_inscritos
                    FROM cursos c
                    LEFT JOIN inscricoes i ON i.curso_id = c.id
                    WHERE 1=1"; // Root vê todos os cursos
        } elseif ($userRole === 'professor') {
            $sql = "SELECT 
                        c.*,
                        COUNT(DISTINCT i.id) as alunos_inscritos
                    FROM cursos c
                    LEFT JOIN inscricoes i ON i.curso_id = c.id
                    WHERE c.status = 'publicado'";
        } else {
            // professor_cursos vê apenas cursos permitidos
            $sql = "SELECT 
                        c.*,
                        COUNT(DISTINCT i.id) as alunos_inscritos
                    FROM cursos c
                    INNER JOIN permissoes_cursos pc ON pc.curso_id = c.id
                    LEFT JOIN inscricoes i ON i.curso_id = c.id
                    WHERE c.status = 'publicado' 
                    AND pc.usuario_id = ?";
        }

        $params = [];

        // Se for professor_cursos, adicionar user_id aos parâmetros
        if ($userRole === 'professor_cursos') {
            $params[] = $currentUser['id'];
        }
        
        // Se tiver can_manage_courses, ver todos os cursos (incluindo rascunhos)
        if ($canManageCourses && $userRole !== 'root') {
            $sql = "SELECT 
                        c.*,
                        COUNT(DISTINCT i.id) as alunos_inscritos
                    FROM cursos c
                    LEFT JOIN inscricoes i ON i.curso_id = c.id
                    WHERE 1=1";
            $params = [];
        }

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
                'titulo' => $course['titulo'], // Manter em português para compatibilidade
                'title' => $course['titulo'], // Também em inglês para frontend
                'descricao' => $course['descricao'],
                'description' => $course['descricao'],
                'thumbnail_url' => $course['thumbnail_url'],
                'categoria' => $course['categoria'],
                'category' => $course['categoria'],
                'nome_instrutor' => $course['nome_instrutor'],
                'instructor_name' => $course['nome_instrutor'],
                'bio_instrutor' => $course['bio_instrutor'],
                'instructor_bio' => $course['bio_instrutor'],
                'preco' => (float)$course['preco'],
                'price' => (float)$course['preco'],
                'status' => $course['status'],
                'total_duration' => (int)$course['duracao_total'],
                'total_aulas' => (int)$course['total_aulas'],
                'total_lessons' => (int)$course['total_aulas'],
                'alunos_inscritos' => (int)$course['alunos_inscritos'],
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
    } elseif ($method === 'POST') {

    // POST - Criar curso (root ou can_manage_courses)
        $currentUser = getCurrentUser();
        $userRole = strtolower($currentUser['role'] ?? '');
        $canManage = (bool)($currentUser['can_manage_courses'] ?? false);
        
        if ($userRole !== 'root' && !$canManage) {
            json_response(403, [
                'error' => true,
                'message' => 'Você não tem permissão para criar cursos. Solicite acesso ao administrador.'
            ]);
        }

        $data = read_json_body();
        
        $id = trim((string)($data['id'] ?? ''));
        $titulo = trim((string)($data['titulo'] ?? ''));
        $descricao = trim((string)($data['descricao'] ?? ''));
        $status = (string)($data['status'] ?? 'rascunho');
        $categoria = isset($data['categoria']) ? trim((string)$data['categoria']) : null;
        $nomeInstrutor = isset($data['nome_instrutor']) ? trim((string)$data['nome_instrutor']) : null;
        $bioInstrutor = isset($data['bio_instrutor']) ? trim((string)$data['bio_instrutor']) : null;
        $preco = isset($data['preco']) ? (float)$data['preco'] : 0.00;
        $thumbnailUrl = isset($data['thumbnail_url']) ? trim((string)$data['thumbnail_url']) : null;

        if (empty($id) || empty($titulo)) {
            json_response(400, ['error' => true, 'message' => 'ID e título são obrigatórios']);
        }

        // Verificar se já existe
        $checkStmt = $pdo->prepare("SELECT id FROM cursos WHERE id = ?");
        $checkStmt->execute([$id]);
        if ($checkStmt->fetch()) {
            json_response(409, ['error' => true, 'message' => 'Curso com este ID já existe']);
        }

        $stmt = $pdo->prepare("
            INSERT INTO cursos (
                id, titulo, descricao, thumbnail_url, categoria, 
                nome_instrutor, bio_instrutor, preco, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id, $titulo, $descricao, $thumbnailUrl, $categoria,
            $nomeInstrutor, $bioInstrutor, $preco, $status
        ]);

        json_response(201, [
            'error' => false,
            'message' => 'Curso criado com sucesso',
            'course' => [
                'id' => $id,
                'titulo' => $titulo
            ]
        ]);
    } elseif ($method === 'PUT') {
        $currentUser = getCurrentUser();
        $userRole = strtolower($currentUser['role'] ?? '');
        $canManage = (bool)($currentUser['can_manage_courses'] ?? false);
        
        if ($userRole !== 'root' && !$canManage) {
            json_response(403, [
                'error' => true,
                'message' => 'Você não tem permissão para atualizar cursos. Solicite acesso ao administrador.'
            ]);
        }

        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));

        if (empty($id)) {
            json_response(400, ['error' => true, 'message' => 'ID do curso é obrigatório']);
        }

        // Verificar se existe
        $checkStmt = $pdo->prepare("SELECT id FROM cursos WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            json_response(404, ['error' => true, 'message' => 'Curso não encontrado']);
        }

        $updates = [];
        $params = [];

        if (isset($data['titulo'])) {
            $updates[] = "titulo = ?";
            $params[] = trim((string)$data['titulo']);
        }
        if (isset($data['descricao'])) {
            $updates[] = "descricao = ?";
            $params[] = trim((string)$data['descricao']);
        }
        if (isset($data['status'])) {
            $updates[] = "status = ?";
            $params[] = (string)$data['status'];
        }
        if (isset($data['categoria'])) {
            $updates[] = "categoria = ?";
            $params[] = trim((string)$data['categoria']) ?: null;
        }
        if (isset($data['nome_instrutor'])) {
            $updates[] = "nome_instrutor = ?";
            $params[] = trim((string)$data['nome_instrutor']) ?: null;
        }
        if (isset($data['bio_instrutor'])) {
            $updates[] = "bio_instrutor = ?";
            $params[] = trim((string)$data['bio_instrutor']) ?: null;
        }
        if (isset($data['preco'])) {
            $updates[] = "preco = ?";
            $params[] = (float)$data['preco'];
        }
        if (isset($data['thumbnail_url'])) {
            $updates[] = "thumbnail_url = ?";
            $params[] = trim((string)$data['thumbnail_url']) ?: null;
        }

        if (empty($updates)) {
            json_response(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }

        $params[] = $id;
        $sql = "UPDATE cursos SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        json_response(200, [
            'error' => false,
            'message' => 'Curso atualizado com sucesso'
        ]);
    } elseif ($method === 'DELETE') {
        $currentUser = getCurrentUser();
        $userRole = strtolower($currentUser['role'] ?? '');
        $canManage = (bool)($currentUser['can_manage_courses'] ?? false);
        
        if ($userRole !== 'root' && !$canManage) {
            json_response(403, [
                'error' => true,
                'message' => 'Você não tem permissão para deletar cursos. Solicite acesso ao administrador.'
            ]);
        }

        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));

        if (empty($id)) {
            json_response(400, ['error' => true, 'message' => 'ID do curso é obrigatório']);
        }

        $stmt = $pdo->prepare("DELETE FROM cursos WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            json_response(200, [
                'error' => false,
                'message' => 'Curso deletado com sucesso'
            ]);
        } else {
            json_response(404, ['error' => true, 'message' => 'Curso não encontrado']);
        }
    }

    // Se chegou aqui, método não é suportado
    json_response(405, ['error' => true, 'message' => 'Método não permitido']);

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
