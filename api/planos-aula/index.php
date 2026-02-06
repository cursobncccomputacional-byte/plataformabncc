<?php
/**
 * API de Planos de Aula
 *
 * GET    /api/planos-aula/index.php              -> lista planos (opcional: atividade_id)
 * GET    /api/planos-aula/index.php?id=123       -> obtém plano específico
 * POST   /api/planos-aula/index.php              -> cria plano (apenas root)
 * PATCH  /api/planos-aula/index.php              -> atualiza plano (apenas root)
 * DELETE /api/planos-aula/index.php              -> remove plano (apenas root)
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/../config/cors.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function lessonplan_json_out(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function lessonplan_read_json(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        lessonplan_json_out(400, ['error' => true, 'message' => 'JSON inválido']);
    }
    return $data;
}

// Autenticação obrigatória para todos os métodos
$currentUser = requireAuth();
$currentRole = $currentUser['role'] ?? null;

global $pdo;
if (!isset($pdo)) {
    lessonplan_json_out(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

try {
    if ($method === 'GET') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $atividadeId = isset($_GET['atividade_id']) ? trim((string)$_GET['atividade_id']) : '';

        if ($id > 0) {
            $stmt = $pdo->prepare("SELECT * FROM planos_aula WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                lessonplan_json_out(404, ['error' => true, 'message' => 'Plano de aula não encontrado']);
            }

            $item = [
                'id' => (int)$row['id'],
                'atividade_id' => $row['atividade_id'],
                'titulo' => $row['titulo'],
                'descricao' => $row['descricao'],
                'pdf_url' => $row['pdf_url'],
                'thumb_url' => $row['thumb_url'],
                'created_by' => $row['created_by'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
            ];

            lessonplan_json_out(200, ['error' => false, 'plano' => $item]);
        }

        $sql = "SELECT * FROM planos_aula WHERE 1=1";
        $params = [];

        if ($atividadeId !== '') {
            $sql .= " AND atividade_id = ?";
            $params[] = $atividadeId;
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $list = [];
        foreach ($rows as $r) {
            $list[] = [
                'id' => (int)$r['id'],
                'atividade_id' => $r['atividade_id'],
                'titulo' => $r['titulo'],
                'descricao' => $r['descricao'],
                'pdf_url' => $r['pdf_url'],
                'thumb_url' => $r['thumb_url'],
                'created_by' => $r['created_by'],
                'created_at' => $r['created_at'],
                'updated_at' => $r['updated_at'],
            ];
        }

        lessonplan_json_out(200, ['error' => false, 'planos' => $list, 'count' => count($list)]);
    }

    // As operações de escrita são apenas para root
    if (in_array($method, ['POST', 'PATCH', 'DELETE'], true)) {
        if ($currentRole !== 'root') {
            lessonplan_json_out(403, ['error' => true, 'message' => 'Acesso negado. Apenas root pode gerenciar planos de aula.']);
        }
    }

    if ($method === 'POST') {
        $data = lessonplan_read_json();

        $atividadeId = trim((string)($data['atividade_id'] ?? ''));
        $titulo = trim((string)($data['titulo'] ?? ''));
        $descricao = isset($data['descricao']) ? trim((string)$data['descricao']) : '';
        $pdfUrl = trim((string)($data['pdf_url'] ?? ''));
        $thumbUrl = isset($data['thumb_url']) ? trim((string)$data['thumb_url']) : '';

        if ($atividadeId === '' || $titulo === '' || $pdfUrl === '') {
            lessonplan_json_out(400, ['error' => true, 'message' => 'atividade_id, titulo e pdf_url são obrigatórios']);
        }

        // Garantir que atividade existe
        $checkAtv = $pdo->prepare("SELECT id FROM atividades WHERE id = ?");
        $checkAtv->execute([$atividadeId]);
        if ($checkAtv->fetch() === false) {
            lessonplan_json_out(400, ['error' => true, 'message' => 'Atividade vinculada não encontrada']);
        }

        // Validar unicidade 1:1
        $checkPlano = $pdo->prepare("SELECT id FROM planos_aula WHERE atividade_id = ?");
        $checkPlano->execute([$atividadeId]);
        if ($checkPlano->fetch()) {
            lessonplan_json_out(400, ['error' => true, 'message' => 'Já existe um plano de aula vinculado a esta atividade']);
        }

        $stmt = $pdo->prepare("INSERT INTO planos_aula (atividade_id, titulo, descricao, pdf_url, thumb_url, created_by) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $atividadeId,
            $titulo,
            $descricao !== '' ? $descricao : null,
            $pdfUrl,
            $thumbUrl !== '' ? $thumbUrl : null,
            $currentUser['id'] ?? null,
        ]);

        $id = (int)$pdo->lastInsertId();

        $sel = $pdo->prepare("SELECT * FROM planos_aula WHERE id = ?");
        $sel->execute([$id]);
        $row = $sel->fetch(PDO::FETCH_ASSOC);

        $item = [
            'id' => (int)$row['id'],
            'atividade_id' => $row['atividade_id'],
            'titulo' => $row['titulo'],
            'descricao' => $row['descricao'],
            'pdf_url' => $row['pdf_url'],
            'thumb_url' => $row['thumb_url'],
            'created_by' => $row['created_by'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];

        lessonplan_json_out(201, ['error' => false, 'plano' => $item]);
    }

    if ($method === 'PATCH') {
        $data = lessonplan_read_json();
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id <= 0) {
            lessonplan_json_out(400, ['error' => true, 'message' => 'ID inválido']);
        }

        $updates = [];
        $params = [];

        if (array_key_exists('atividade_id', $data)) {
            $atividadeId = trim((string)$data['atividade_id']);
            if ($atividadeId === '') {
                lessonplan_json_out(400, ['error' => true, 'message' => 'atividade_id não pode ser vazio']);
            }
            // Verificar existência da atividade
            $checkAtv = $pdo->prepare("SELECT id FROM atividades WHERE id = ?");
            $checkAtv->execute([$atividadeId]);
            if ($checkAtv->fetch() === false) {
                lessonplan_json_out(400, ['error' => true, 'message' => 'Atividade vinculada não encontrada']);
            }
            // Garantir unicidade para nova atividade (exceto o próprio registro)
            $checkPlano = $pdo->prepare("SELECT id FROM planos_aula WHERE atividade_id = ? AND id <> ?");
            $checkPlano->execute([$atividadeId, $id]);
            if ($checkPlano->fetch()) {
                lessonplan_json_out(400, ['error' => true, 'message' => 'Já existe um plano de aula vinculado a esta atividade']);
            }
            $updates[] = 'atividade_id = ?';
            $params[] = $atividadeId;
        }

        if (array_key_exists('titulo', $data)) {
            $titulo = trim((string)$data['titulo']);
            if ($titulo === '') {
                lessonplan_json_out(400, ['error' => true, 'message' => 'titulo não pode ser vazio']);
            }
            $updates[] = 'titulo = ?';
            $params[] = $titulo;
        }

        if (array_key_exists('descricao', $data)) {
            $descricao = trim((string)$data['descricao']);
            $updates[] = 'descricao = ?';
            $params[] = $descricao !== '' ? $descricao : null;
        }

        if (array_key_exists('pdf_url', $data)) {
            $pdfUrl = trim((string)$data['pdf_url']);
            if ($pdfUrl === '') {
                lessonplan_json_out(400, ['error' => true, 'message' => 'pdf_url não pode ser vazio']);
            }
            $updates[] = 'pdf_url = ?';
            $params[] = $pdfUrl;
        }

        if (array_key_exists('thumb_url', $data)) {
            $thumbUrl = trim((string)$data['thumb_url']);
            $updates[] = 'thumb_url = ?';
            $params[] = $thumbUrl !== '' ? $thumbUrl : null;
        }

        if (empty($updates)) {
            lessonplan_json_out(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }

        $updates[] = 'updated_at = NOW()';

        $sql = "UPDATE planos_aula SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            // Pode ter atualizado mas mantido os mesmos valores; ainda assim retornar o registro
        }

        $sel = $pdo->prepare("SELECT * FROM planos_aula WHERE id = ?");
        $sel->execute([$id]);
        $row = $sel->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            lessonplan_json_out(404, ['error' => true, 'message' => 'Plano de aula não encontrado']);
        }

        $item = [
            'id' => (int)$row['id'],
            'atividade_id' => $row['atividade_id'],
            'titulo' => $row['titulo'],
            'descricao' => $row['descricao'],
            'pdf_url' => $row['pdf_url'],
            'thumb_url' => $row['thumb_url'],
            'created_by' => $row['created_by'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];

        lessonplan_json_out(200, ['error' => false, 'plano' => $item]);
    }

    if ($method === 'DELETE') {
        $data = lessonplan_read_json();
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id <= 0) {
            lessonplan_json_out(400, ['error' => true, 'message' => 'ID inválido']);
        }

        $stmt = $pdo->prepare("DELETE FROM planos_aula WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            lessonplan_json_out(404, ['error' => true, 'message' => 'Plano de aula não encontrado']);
        }

        lessonplan_json_out(200, ['error' => false, 'message' => 'Plano de aula removido com sucesso']);
    }

    // Método não suportado
    lessonplan_json_out(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (Throwable $e) {
    error_log('Erro em planos-aula: ' . $e->getMessage());
    lessonplan_json_out(500, ['error' => true, 'message' => 'Erro ao processar planos de aula']);
}

