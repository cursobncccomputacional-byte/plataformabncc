<?php
/**
 * API Currículo BNCC Computacional (tabelas curriculo_*)
 * GET    /api/curriculo-bncc/index.php -> lista habilidades + etapas (todos autenticados)
 * GET    /api/curriculo-bncc/index.php?id=xxx -> detalhe com exemplos e materiais
 * GET    /api/curriculo-bncc/index.php?etapa_id=1&eixo=...&search=... -> filtros
 * POST   /api/curriculo-bncc/index.php -> cria (apenas root)
 * PUT    /api/curriculo-bncc/index.php -> atualiza (apenas root)
 * DELETE /api/curriculo-bncc/index.php?id=xxx -> deleta (apenas root)
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
        json_response(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$currentUser = getCurrentUser();

if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    if (!$currentUser) {
        json_response(401, ['error' => true, 'message' => 'Não autenticado']);
    }
    if (($currentUser['role'] ?? '') !== 'root') {
        json_response(403, ['error' => true, 'message' => 'Apenas root pode cadastrar/editar Currículo BNCC']);
    }
}

if ($method === 'GET' && !$currentUser) {
    json_response(401, ['error' => true, 'message' => 'Não autenticado']);
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
    }

    $tablesExist = $pdo->query("SHOW TABLES LIKE 'curriculo_habilidades'")->rowCount() > 0;
    if (!$tablesExist) {
        json_response(503, [
            'error' => true,
            'message' => 'Tabelas curriculo_* não existem. Execute .sql/curriculo-computacao-educacao-infantil.sql'
        ]);
    }

    if ($method === 'GET') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        $etapaId = isset($_GET['etapa_id']) ? (int)$_GET['etapa_id'] : null;
        $eixo = isset($_GET['eixo']) ? trim((string)$_GET['eixo']) : null;
        $search = isset($_GET['search']) ? trim((string)$_GET['search']) : null;

        if ($id) {
            $stmt = $pdo->prepare("
                SELECT h.*, e.nome AS etapa_nome
                FROM curriculo_habilidades h
                LEFT JOIN curriculo_etapas_ensino e ON e.id = h.etapa_id
                WHERE h.id = ?
            ");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                json_response(404, ['error' => true, 'message' => 'Registro não encontrado']);
            }
            $exemplos = $pdo->prepare("SELECT id, tipo, conteudo FROM curriculo_exemplos_praticos WHERE habilidade_id = ? ORDER BY id");
            $exemplos->execute([$id]);
            $row['exemplos'] = $exemplos->fetchAll(PDO::FETCH_ASSOC);
            $materiais = $pdo->prepare("SELECT id, descricao, link FROM curriculo_materiais_complementares WHERE habilidade_id = ? ORDER BY id");
            $materiais->execute([$id]);
            $row['materiais'] = $materiais->fetchAll(PDO::FETCH_ASSOC);
            json_response(200, ['error' => false, 'habilidade' => $row]);
        }

        $where = ['1=1'];
        $params = [];
        if ($etapaId) {
            $where[] = 'h.etapa_id = ?';
            $params[] = $etapaId;
        }
        if ($eixo !== null && $eixo !== '') {
            $where[] = 'h.eixo = ?';
            $params[] = $eixo;
        }
        if ($search !== null && $search !== '') {
            $where[] = '(h.codigo LIKE ? OR h.descricao LIKE ? OR h.explicacao LIKE ? OR h.eixo LIKE ?)';
            $term = '%' . $search . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }
        $whereClause = implode(' AND ', $where);
        $stmt = $pdo->prepare("
            SELECT h.id, h.etapa_id, h.codigo, h.eixo, h.descricao, h.explicacao, e.nome AS etapa_nome
            FROM curriculo_habilidades h
            LEFT JOIN curriculo_etapas_ensino e ON e.id = h.etapa_id
            WHERE $whereClause
            ORDER BY h.id ASC
        ");
        $stmt->execute($params);
        $habilidades = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $etapasStmt = $pdo->query("SELECT id, nome FROM curriculo_etapas_ensino ORDER BY id");
        $etapas = $etapasStmt ? $etapasStmt->fetchAll(PDO::FETCH_ASSOC) : [];

        json_response(200, [
            'error' => false,
            'habilidades' => $habilidades,
            'etapas' => $etapas,
            'total' => count($habilidades)
        ]);
    }

    if ($method === 'POST') {
        $data = read_json_body();
        $etapaId = (int)($data['etapa_id'] ?? 0);
        $codigo = trim((string)($data['codigo'] ?? ''));
        $eixo = trim((string)($data['eixo'] ?? ''));
        $descricao = trim((string)($data['descricao'] ?? ''));
        $explicacao = isset($data['explicacao']) ? trim((string)$data['explicacao']) : null;
        $exemplos = is_array($data['exemplos'] ?? null) ? $data['exemplos'] : [];
        $materiais = is_array($data['materiais'] ?? null) ? $data['materiais'] : [];

        if ($etapaId <= 0 || $codigo === '' || $eixo === '' || $descricao === '') {
            json_response(400, ['error' => true, 'message' => 'etapa_id, codigo, eixo e descricao são obrigatórios']);
        }

        $nextId = (int)$pdo->query("SELECT COALESCE(MAX(id), 0) + 1 FROM curriculo_habilidades")->fetchColumn();
        $pdo->prepare("INSERT INTO curriculo_habilidades (id, etapa_id, codigo, eixo, descricao, explicacao) VALUES (?, ?, ?, ?, ?, ?)")
            ->execute([$nextId, $etapaId, $codigo, $eixo, $descricao, $explicacao ?: null]);

        foreach ($exemplos as $ex) {
            $tipo = trim((string)($ex['tipo'] ?? ''));
            $conteudo = trim((string)($ex['conteudo'] ?? ''));
            if ($tipo !== '' && $conteudo !== '') {
                $pdo->prepare("INSERT INTO curriculo_exemplos_praticos (habilidade_id, tipo, conteudo) VALUES (?, ?, ?)")
                    ->execute([$nextId, $tipo, $conteudo]);
            }
        }
        foreach ($materiais as $mat) {
            $desc = trim((string)($mat['descricao'] ?? ''));
            $link = trim((string)($mat['link'] ?? ''));
            if ($desc !== '' || $link !== '') {
                $pdo->prepare("INSERT INTO curriculo_materiais_complementares (habilidade_id, descricao, link) VALUES (?, ?, ?)")
                    ->execute([$nextId, $desc ?: null, $link ?: null]);
            }
        }
        json_response(201, ['error' => false, 'message' => 'Cadastrado com sucesso', 'id' => $nextId]);
    }

    if ($method === 'PUT') {
        $data = read_json_body();
        $id = (int)($data['id'] ?? 0);
        if ($id <= 0) {
            json_response(400, ['error' => true, 'message' => 'id é obrigatório']);
        }
        $check = $pdo->prepare("SELECT id FROM curriculo_habilidades WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            json_response(404, ['error' => true, 'message' => 'Registro não encontrado']);
        }

        $etapaId = (int)($data['etapa_id'] ?? 0);
        $codigo = trim((string)($data['codigo'] ?? ''));
        $eixo = trim((string)($data['eixo'] ?? ''));
        $descricao = trim((string)($data['descricao'] ?? ''));
        $explicacao = isset($data['explicacao']) ? trim((string)$data['explicacao']) : null;
        $exemplos = is_array($data['exemplos'] ?? null) ? $data['exemplos'] : [];
        $materiais = is_array($data['materiais'] ?? null) ? $data['materiais'] : [];

        if ($etapaId <= 0 || $codigo === '' || $eixo === '' || $descricao === '') {
            json_response(400, ['error' => true, 'message' => 'etapa_id, codigo, eixo e descricao são obrigatórios']);
        }

        $pdo->prepare("UPDATE curriculo_habilidades SET etapa_id = ?, codigo = ?, eixo = ?, descricao = ?, explicacao = ? WHERE id = ?")
            ->execute([$etapaId, $codigo, $eixo, $descricao, $explicacao ?: null, $id]);

        $pdo->prepare("DELETE FROM curriculo_exemplos_praticos WHERE habilidade_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM curriculo_materiais_complementares WHERE habilidade_id = ?")->execute([$id]);

        foreach ($exemplos as $ex) {
            $tipo = trim((string)($ex['tipo'] ?? ''));
            $conteudo = trim((string)($ex['conteudo'] ?? ''));
            if ($tipo !== '' && $conteudo !== '') {
                $pdo->prepare("INSERT INTO curriculo_exemplos_praticos (habilidade_id, tipo, conteudo) VALUES (?, ?, ?)")
                    ->execute([$id, $tipo, $conteudo]);
            }
        }
        foreach ($materiais as $mat) {
            $desc = trim((string)($mat['descricao'] ?? ''));
            $link = trim((string)($mat['link'] ?? ''));
            if ($desc !== '' || $link !== '') {
                $pdo->prepare("INSERT INTO curriculo_materiais_complementares (habilidade_id, descricao, link) VALUES (?, ?, ?)")
                    ->execute([$id, $desc ?: null, $link ?: null]);
            }
        }
        json_response(200, ['error' => false, 'message' => 'Atualizado com sucesso']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)(read_json_body()['id'] ?? 0);
        if ($id <= 0) {
            json_response(400, ['error' => true, 'message' => 'id é obrigatório']);
        }
        $stmt = $pdo->prepare("DELETE FROM curriculo_habilidades WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            json_response(404, ['error' => true, 'message' => 'Registro não encontrado']);
        }
        json_response(200, ['error' => false, 'message' => 'Removido com sucesso']);
    }

    json_response(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (PDOException $e) {
    error_log('Curriculo BNCC API PDO: ' . $e->getMessage());
    json_response(500, ['error' => true, 'message' => 'Erro no servidor']);
} catch (Throwable $e) {
    error_log('Curriculo BNCC API: ' . $e->getMessage());
    json_response(500, ['error' => true, 'message' => 'Erro no servidor']);
}
