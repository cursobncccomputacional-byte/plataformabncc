<?php
/**
 * API de Demandas (Gestão Interna)
 * Apenas usuários root.
 *
 * GET    /api/demandas/index.php           -> lista demandas (opcional: semana=YYYY-Www)
 * POST   /api/demandas/index.php           -> cria demanda
 * PATCH  /api/demandas/index.php           -> atualiza demanda ou conclui (body: id, concluir? ou campos)
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

function json_out(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        json_out(400, ['error' => true, 'message' => 'JSON inválido']);
    }
    return $data;
}

$currentUser = requireAuth();
if (($currentUser['role'] ?? null) !== 'root') {
    json_out(403, ['error' => true, 'message' => 'Acesso negado. Apenas root.']);
}

global $pdo;
if (!isset($pdo)) {
    json_out(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

try {
    if ($method === 'GET') {
        $semana = $_GET['semana'] ?? null; // YYYY-Www (ex: 2025-W05)

        $sql = "SELECT d.id, d.nome, d.descricao, d.responsavel_id, d.data_prevista, d.data_conclusao, d.created_at, d.updated_at,
                u.nome AS responsavel_nome
                FROM demandas d
                LEFT JOIN usuarios u ON u.id = d.responsavel_id
                WHERE 1=1";
        $params = [];

        if ($semana !== null && $semana !== '') {
            // Filtro por semana: data_prevista na semana ou data_conclusao na semana
            // Formato ISO 8601: YYYY-Www (ex: 2025-W05)
            if (preg_match('/^(\d{4})-W(\d{2})$/', $semana, $m)) {
                $year = (int) $m[1];
                $week = (int) $m[2];
                $start = (new DateTime())->setISODate($year, $week)->setTime(0, 0, 0)->format('Y-m-d');
                $end = (new DateTime())->setISODate($year, $week, 7)->setTime(23, 59, 59)->format('Y-m-d');
                $sql .= " AND ( (d.data_prevista BETWEEN ? AND ?) OR (DATE(d.data_conclusao) BETWEEN ? AND ?) )";
                $params = array_merge($params, [$start, $end, $start, $end]);
            }
        }

        $sql .= " ORDER BY d.data_prevista ASC, d.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $list = [];
        foreach ($rows as $r) {
            $list[] = [
                'id' => (int) $r['id'],
                'nome' => $r['nome'],
                'descricao' => $r['descricao'] ?? '',
                'responsavel_id' => $r['responsavel_id'],
                'responsavel_nome' => $r['responsavel_nome'] ?? null,
                'data_prevista' => $r['data_prevista'],
                'data_conclusao' => $r['data_conclusao'],
                'created_at' => $r['created_at'],
                'updated_at' => $r['updated_at'],
            ];
        }

        json_out(200, ['error' => false, 'demandas' => $list]);
    }

    if ($method === 'POST') {
        $data = read_json();
        $nome = trim((string) ($data['nome'] ?? ''));
        $descricao = trim((string) ($data['descricao'] ?? ''));
        $responsavel_id = isset($data['responsavel_id']) && $data['responsavel_id'] !== '' ? (string) $data['responsavel_id'] : null;
        $data_prevista = isset($data['data_prevista']) && $data['data_prevista'] !== '' ? (string) $data['data_prevista'] : null;

        if ($nome === '') {
            json_out(400, ['error' => true, 'message' => 'Nome é obrigatório']);
        }

        if ($responsavel_id !== null) {
            $check = $pdo->prepare("SELECT id FROM usuarios WHERE id = ? AND nivel_acesso = 'root' AND ativo = 1");
            $check->execute([$responsavel_id]);
            if ($check->fetch() === false) {
                json_out(400, ['error' => true, 'message' => 'Responsável deve ser um usuário root']);
            }
        }

        $stmt = $pdo->prepare("INSERT INTO demandas (nome, descricao, responsavel_id, data_prevista) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nome, $descricao ?: null, $responsavel_id, $data_prevista]);
        $id = (int) $pdo->lastInsertId();

        $sel = $pdo->prepare("SELECT d.id, d.nome, d.descricao, d.responsavel_id, d.data_prevista, d.data_conclusao, d.created_at, d.updated_at, u.nome AS responsavel_nome FROM demandas d LEFT JOIN usuarios u ON u.id = d.responsavel_id WHERE d.id = ?");
        $sel->execute([$id]);
        $row = $sel->fetch(PDO::FETCH_ASSOC);
        $item = [
            'id' => (int) $row['id'],
            'nome' => $row['nome'],
            'descricao' => $row['descricao'] ?? '',
            'responsavel_id' => $row['responsavel_id'],
            'responsavel_nome' => $row['responsavel_nome'] ?? null,
            'data_prevista' => $row['data_prevista'],
            'data_conclusao' => $row['data_conclusao'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
        json_out(201, ['error' => false, 'demanda' => $item]);
    }

    if ($method === 'PATCH') {
        $data = read_json();
        $id = isset($data['id']) ? (int) $data['id'] : 0;
        if ($id <= 0) {
            json_out(400, ['error' => true, 'message' => 'ID inválido']);
        }

        if (!empty($data['concluir'])) {
            $stmt = $pdo->prepare("UPDATE demandas SET data_conclusao = NOW(), updated_at = NOW() WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) {
                json_out(404, ['error' => true, 'message' => 'Demanda não encontrada']);
            }
            $sel = $pdo->prepare("SELECT d.id, d.nome, d.descricao, d.responsavel_id, d.data_prevista, d.data_conclusao, d.created_at, d.updated_at, u.nome AS responsavel_nome FROM demandas d LEFT JOIN usuarios u ON u.id = d.responsavel_id WHERE d.id = ?");
            $sel->execute([$id]);
            $row = $sel->fetch(PDO::FETCH_ASSOC);
            $item = [
                'id' => (int) $row['id'],
                'nome' => $row['nome'],
                'descricao' => $row['descricao'] ?? '',
                'responsavel_id' => $row['responsavel_id'],
                'responsavel_nome' => $row['responsavel_nome'] ?? null,
                'data_prevista' => $row['data_prevista'],
                'data_conclusao' => $row['data_conclusao'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
            ];
            json_out(200, ['error' => false, 'demanda' => $item]);
        }

        if (!empty($data['reabrir'])) {
            $stmt = $pdo->prepare("UPDATE demandas SET data_conclusao = NULL, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) {
                json_out(404, ['error' => true, 'message' => 'Demanda não encontrada']);
            }
            $sel = $pdo->prepare("SELECT d.id, d.nome, d.descricao, d.responsavel_id, d.data_prevista, d.data_conclusao, d.created_at, d.updated_at, u.nome AS responsavel_nome FROM demandas d LEFT JOIN usuarios u ON u.id = d.responsavel_id WHERE d.id = ?");
            $sel->execute([$id]);
            $row = $sel->fetch(PDO::FETCH_ASSOC);
            $item = [
                'id' => (int) $row['id'],
                'nome' => $row['nome'],
                'descricao' => $row['descricao'] ?? '',
                'responsavel_id' => $row['responsavel_id'],
                'responsavel_nome' => $row['responsavel_nome'] ?? null,
                'data_prevista' => $row['data_prevista'],
                'data_conclusao' => $row['data_conclusao'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
            ];
            json_out(200, ['error' => false, 'demanda' => $item]);
        }

        $updates = [];
        $params = [];
        if (array_key_exists('nome', $data)) {
            $updates[] = 'nome = ?';
            $params[] = trim((string) $data['nome']);
        }
        if (array_key_exists('descricao', $data)) {
            $updates[] = 'descricao = ?';
            $params[] = trim((string) $data['descricao']) ?: null;
        }
        if (array_key_exists('responsavel_id', $data)) {
            $rid = $data['responsavel_id'] !== '' && $data['responsavel_id'] !== null ? (string) $data['responsavel_id'] : null;
            if ($rid !== null) {
                $check = $pdo->prepare("SELECT id FROM usuarios WHERE id = ? AND nivel_acesso = 'root' AND ativo = 1");
                $check->execute([$rid]);
                if ($check->fetch() === false) {
                    json_out(400, ['error' => true, 'message' => 'Responsável deve ser um usuário root']);
                }
            }
            $updates[] = 'responsavel_id = ?';
            $params[] = $rid;
        }
        if (array_key_exists('data_prevista', $data)) {
            $updates[] = 'data_prevista = ?';
            $params[] = $data['data_prevista'] !== '' && $data['data_prevista'] !== null ? (string) $data['data_prevista'] : null;
        }

        if (count($updates) === 0) {
            json_out(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }
        $params[] = $id;
        $sql = "UPDATE demandas SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        if ($stmt->rowCount() === 0) {
            json_out(404, ['error' => true, 'message' => 'Demanda não encontrada']);
        }
        $sel = $pdo->prepare("SELECT d.id, d.nome, d.descricao, d.responsavel_id, d.data_prevista, d.data_conclusao, d.created_at, d.updated_at, u.nome AS responsavel_nome FROM demandas d LEFT JOIN usuarios u ON u.id = d.responsavel_id WHERE d.id = ?");
        $sel->execute([$id]);
        $row = $sel->fetch(PDO::FETCH_ASSOC);
        $item = [
            'id' => (int) $row['id'],
            'nome' => $row['nome'],
            'descricao' => $row['descricao'] ?? '',
            'responsavel_id' => $row['responsavel_id'],
            'responsavel_nome' => $row['responsavel_nome'] ?? null,
            'data_prevista' => $row['data_prevista'],
            'data_conclusao' => $row['data_conclusao'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
        json_out(200, ['error' => false, 'demanda' => $item]);
    }

    json_out(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (Throwable $e) {
    json_out(500, ['error' => true, 'message' => 'Erro interno: ' . $e->getMessage()]);
}
