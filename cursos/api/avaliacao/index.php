<?php
/**
 * API de Avaliações (perguntas ao final da aula)
 * GET    ?aula_id=xxx -> lista perguntas (qualquer usuário autenticado)
 * POST   -> cria pergunta (can_manage_courses ou root)
 * PUT    -> atualiza pergunta
 * DELETE -> remove pergunta
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

function json_out(int $status, array $payload): void {
    if (!headers_sent()) {
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
    return is_array($data) ? $data : [];
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$currentUser = getCurrentUser();

if (!$currentUser) {
    json_out(401, ['error' => true, 'message' => 'Não autenticado']);
}

$userRole = strtolower($currentUser['role'] ?? '');
$canManage = (bool)($currentUser['can_manage_courses'] ?? false);
$isWrite = in_array($method, ['POST', 'PUT', 'DELETE'], true);
if ($isWrite && $userRole !== 'root' && !$canManage) {
    json_out(403, ['error' => true, 'message' => 'Sem permissão para gerenciar avaliações.']);
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_out(500, ['error' => true, 'message' => 'Erro de conexão']);
    }

    if ($method === 'GET') {
        $aulaId = isset($_GET['aula_id']) ? trim((string)$_GET['aula_id']) : '';
        if ($aulaId === '') {
            json_out(400, ['error' => true, 'message' => 'aula_id é obrigatório']);
        }

        $stmt = $pdo->prepare("
            SELECT id, ordem, enunciado, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta
            FROM aula_avaliacao_perguntas
            WHERE aula_id = ?
            ORDER BY ordem ASC
        ");
        $stmt->execute([$aulaId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $perguntas = [];
        foreach ($rows as $r) {
            $perguntas[] = [
                'id' => (int)$r['id'],
                'ordem' => (int)$r['ordem'],
                'enunciado' => $r['enunciado'],
                'opcoes' => [
                    'A' => $r['opcao_a'],
                    'B' => $r['opcao_b'],
                    'C' => $r['opcao_c'],
                    'D' => $r['opcao_d'],
                ],
                'resposta_correta' => $r['resposta_correta'],
            ];
        }

        json_out(200, [
            'error' => false,
            'aula_id' => $aulaId,
            'perguntas' => $perguntas,
            'total' => count($perguntas),
        ]);
    }

    if ($method === 'POST') {
        $data = read_json();
        $aulaId = trim((string)($data['aula_id'] ?? ''));
        $ordem = isset($data['ordem']) ? (int)$data['ordem'] : 0;
        $enunciado = trim((string)($data['enunciado'] ?? ''));
        $opcaoA = trim((string)($data['opcao_a'] ?? ''));
        $opcaoB = trim((string)($data['opcao_b'] ?? ''));
        $opcaoC = trim((string)($data['opcao_c'] ?? ''));
        $opcaoD = trim((string)($data['opcao_d'] ?? ''));
        $respostaCorreta = strtoupper(trim((string)($data['resposta_correta'] ?? 'A')));
        if (!in_array($respostaCorreta, ['A', 'B', 'C', 'D'], true)) {
            $respostaCorreta = 'A';
        }

        if ($aulaId === '' || $enunciado === '' || $opcaoA === '' || $opcaoB === '' || $opcaoC === '' || $opcaoD === '') {
            json_out(400, ['error' => true, 'message' => 'Campos obrigatórios: aula_id, enunciado, opcao_a, opcao_b, opcao_c, opcao_d']);
        }

        $stmt = $pdo->prepare("
            INSERT INTO aula_avaliacao_perguntas (aula_id, ordem, enunciado, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$aulaId, $ordem, $enunciado, $opcaoA, $opcaoB, $opcaoC, $opcaoD, $respostaCorreta]);
        $newId = (int)$pdo->lastInsertId();

        json_out(201, ['error' => false, 'message' => 'Pergunta criada', 'id' => $newId]);
    }

    if ($method === 'PUT') {
        $data = read_json();
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id <= 0) {
            json_out(400, ['error' => true, 'message' => 'id é obrigatório']);
        }

        $updates = [];
        $params = [];
        $allowed = ['ordem' => 'int', 'enunciado' => 'string', 'opcao_a' => 'string', 'opcao_b' => 'string', 'opcao_c' => 'string', 'opcao_d' => 'string', 'resposta_correta' => 'string'];
        foreach ($allowed as $key => $type) {
            if (!array_key_exists($key, $data)) {
                continue;
            }
            if ($type === 'int') {
                $updates[] = "`$key` = ?";
                $params[] = (int)$data[$key];
            } else {
                $v = trim((string)$data[$key]);
                if ($key === 'resposta_correta') {
                    $v = strtoupper($v);
                    if (!in_array($v, ['A', 'B', 'C', 'D'], true)) {
                        $v = 'A';
                    }
                }
                $updates[] = "`$key` = ?";
                $params[] = $v;
            }
        }
        if (empty($updates)) {
            json_out(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }
        $params[] = $id;
        $sql = "UPDATE aula_avaliacao_perguntas SET " . implode(', ', $updates) . " WHERE id = ?";
        $pdo->prepare($sql)->execute($params);

        json_out(200, ['error' => false, 'message' => 'Pergunta atualizada']);
    }

    if ($method === 'DELETE') {
        $data = read_json();
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id <= 0) {
            json_out(400, ['error' => true, 'message' => 'id é obrigatório']);
        }
        $pdo->prepare("DELETE FROM aula_avaliacao_perguntas WHERE id = ?")->execute([$id]);
        json_out(200, ['error' => false, 'message' => 'Pergunta removida']);
    }

    json_out(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (PDOException $e) {
    error_log('avaliacao: ' . $e->getMessage());
    if (strpos($e->getMessage(), 'aula_avaliacao_perguntas') !== false || strpos($e->getMessage(), 'doesn\'t exist') !== false) {
        if ($method === 'GET') {
            $aulaId = isset($_GET['aula_id']) ? trim((string)$_GET['aula_id']) : '';
            json_out(200, ['error' => false, 'aula_id' => $aulaId, 'perguntas' => [], 'total' => 0]);
        }
    }
    json_out(500, ['error' => true, 'message' => 'Erro ao processar']);
}
