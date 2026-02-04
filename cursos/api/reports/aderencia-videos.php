<?php
/**
 * Relatório de Aderência aos Vídeos (Formação Continuada)
 * GET ?course_id=xxx (opcional) -> lista por usuário/curso: % assistido, % concluído
 * Apenas root ou can_manage_courses.
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

$currentUser = getCurrentUser();
if (!$currentUser) {
    http_response_code(401);
    echo json_encode(['error' => true, 'message' => 'Não autenticado']);
    exit;
}

$role = strtolower($currentUser['role'] ?? '');
$canManage = (bool)($currentUser['can_manage_courses'] ?? false);
if ($role !== 'root' && !$canManage) {
    http_response_code(403);
    echo json_encode(['error' => true, 'message' => 'Sem permissão para acessar este relatório']);
    exit;
}

try {
    global $pdo;
    if (!isset($pdo)) {
        http_response_code(500);
        echo json_encode(['error' => true, 'message' => 'Erro de conexão']);
        exit;
    }

    $courseId = isset($_GET['course_id']) ? trim((string)$_GET['course_id']) : null;

    // Total de vídeos e duração total por curso (aula_videos)
    $sqlTotals = "
        SELECT 
            m.curso_id,
            COUNT(av.id) AS total_videos,
            COALESCE(SUM(av.duracao_video), 0) AS total_segundos_curso
        FROM aula_videos av
        INNER JOIN aulas a ON a.id = av.aula_id
        INNER JOIN modulos m ON m.id = a.modulo_id
        WHERE av.ativo = 1
        " . ($courseId ? " AND m.curso_id = :course_id" : "") . "
        GROUP BY m.curso_id
    ";
    $stmtTotals = $pdo->prepare($sqlTotals);
    if ($courseId) $stmtTotals->bindValue(':course_id', $courseId);
    $stmtTotals->execute();
    $totalsByCourse = [];
    while ($row = $stmtTotals->fetch(PDO::FETCH_ASSOC)) {
        $totalsByCourse[$row['curso_id']] = [
            'total_videos' => (int)$row['total_videos'],
            'total_segundos_curso' => (int)$row['total_segundos_curso'],
        ];
    }

    // Inscrições com nome do curso e do usuário
    $sqlInsc = "
        SELECT i.usuario_id, i.curso_id, i.progresso_percentual AS inscricao_percentual, i.ultimo_acesso_em,
               c.titulo AS curso_titulo,
               u.nome AS usuario_nome, u.usuario AS usuario_email
        FROM inscricoes i
        INNER JOIN cursos c ON c.id = i.curso_id
        INNER JOIN usuarios u ON u.id = i.usuario_id
        WHERE 1=1
        " . ($courseId ? " AND i.curso_id = :course_id2" : "") . "
        ORDER BY c.titulo ASC, u.nome ASC
    ";
    $stmtInsc = $pdo->prepare($sqlInsc);
    if ($courseId) $stmtInsc->bindValue(':course_id2', $courseId);
    $stmtInsc->execute();
    $inscricoes = $stmtInsc->fetchAll(PDO::FETCH_ASSOC);

    // Progresso agregado por (usuario_id, curso_id)
    $sqlProgress = "
        SELECT 
            usuario_id,
            curso_id,
            COUNT(*) AS itens_com_progresso,
            SUM(CASE WHEN esta_concluida = 1 THEN 1 ELSE 0 END) AS videos_concluidos,
            COALESCE(SUM(segundos_assistidos), 0) AS total_segundos_assistidos,
            COALESCE(SUM(total_segundos), 0) AS total_segundos_registrados,
            MAX(ultima_visualizacao_em) AS ultima_visualizacao
        FROM progresso_aulas
        WHERE 1=1
        " . ($courseId ? " AND curso_id = :course_id3" : "") . "
        GROUP BY usuario_id, curso_id
    ";
    $stmtProgress = $pdo->prepare($sqlProgress);
    if ($courseId) $stmtProgress->bindValue(':course_id3', $courseId);
    $stmtProgress->execute();
    $progressMap = [];
    while ($row = $stmtProgress->fetch(PDO::FETCH_ASSOC)) {
        $key = $row['usuario_id'] . '|' . $row['curso_id'];
        $progressMap[$key] = $row;
    }

    $rows = [];
    foreach ($inscricoes as $i) {
        $cid = $i['curso_id'];
        $uid = $i['usuario_id'];
        $totals = $totalsByCourse[$cid] ?? ['total_videos' => 0, 'total_segundos_curso' => 0];
        $totalVideos = $totals['total_videos'];
        $totalSegundosCurso = $totals['total_segundos_curso'];
        $key = $uid . '|' . $cid;
        $prog = $progressMap[$key] ?? null;

        $videosConcluidos = $prog ? (int)$prog['videos_concluidos'] : 0;
        $segundosAssistidos = $prog ? (int)$prog['total_segundos_assistidos'] : 0;

        $percentual_assistido = $totalSegundosCurso > 0
            ? round((min($segundosAssistidos, $totalSegundosCurso) / $totalSegundosCurso) * 100, 1)
            : 0;
        $percentual_concluido = $totalVideos > 0
            ? round(($videosConcluidos / $totalVideos) * 100, 1)
            : 0;

        $rows[] = [
            'usuario_id' => $uid,
            'usuario_nome' => $i['usuario_nome'] ?? '',
            'usuario_email' => $i['usuario_email'] ?? '',
            'curso_id' => $cid,
            'curso_titulo' => $i['curso_titulo'] ?? '',
            'total_videos' => $totalVideos,
            'videos_concluidos' => $videosConcluidos,
            'total_segundos_curso' => $totalSegundosCurso,
            'segundos_assistidos' => $segundosAssistidos,
            'percentual_assistido' => $percentual_assistido,
            'percentual_concluido' => $percentual_concluido,
            'ultimo_acesso_em' => $i['ultimo_acesso_em'] ?? null,
            'ultima_visualizacao' => $prog['ultima_visualizacao'] ?? null,
        ];
    }

    echo json_encode([
        'error' => false,
        'relatorio' => $rows,
        'total_linhas' => count($rows),
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log('aderencia-videos: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Erro ao gerar relatório']);
}
