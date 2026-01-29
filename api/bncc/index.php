<?php
/**
 * API BNCC Computacional Digital
 * GET    /api/bncc/index.php -> lista (todos autenticados: professor, admin, root)
 * GET    /api/bncc/index.php?id=xxx -> detalhe
 * GET    /api/bncc/index.php?tipo_nivel=educacao_infantil&ano_etapa=1º Ano -> filtros
 * POST   /api/bncc/index.php -> cria (apenas root)
 * PUT    /api/bncc/index.php -> atualiza (apenas root)
 * DELETE /api/bncc/index.php -> deleta (apenas root)
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

function json_response_bncc(int $status, array $payload): void {
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
        json_response_bncc(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$currentUser = getCurrentUser();

// Escrita: apenas root
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    if (!$currentUser) {
        json_response_bncc(401, ['error' => true, 'message' => 'Não autenticado']);
    }
    if (($currentUser['role'] ?? '') !== 'root') {
        json_response_bncc(403, ['error' => true, 'message' => 'Apenas root pode cadastrar/editar BNCC Computacional']);
    }
}

// Leitura: qualquer usuário autenticado (professor, admin, root)
if ($method === 'GET' && !$currentUser) {
    json_response_bncc(401, ['error' => true, 'message' => 'Não autenticado']);
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response_bncc(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
    }

    // Verificar se tabela existe
    $checkTable = $pdo->query("SHOW TABLES LIKE 'bncc_computacional'");
    if ($checkTable->rowCount() === 0) {
        json_response_bncc(503, [
            'error' => true,
            'message' => 'Tabela bncc_computacional não existe. Execute o script .sql/create-bncc-computacional.sql'
        ]);
    }

    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        $tipoNivel = $_GET['tipo_nivel'] ?? null;
        $anoEtapa = $_GET['ano_etapa'] ?? null;
        $eixo = $_GET['eixo'] ?? null;
        $search = isset($_GET['search']) ? trim((string)$_GET['search']) : null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM bncc_computacional WHERE id = ? AND ativo = 1");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                json_response_bncc(404, ['error' => true, 'message' => 'Registro não encontrado']);
            }
            json_response_bncc(200, ['error' => false, 'habilidade' => $row]);
        }

        $where = ["ativo = 1"];
        $params = [];
        if ($tipoNivel) {
            $where[] = "tipo_nivel = ?";
            $params[] = $tipoNivel;
        }
        if ($anoEtapa) {
            $where[] = "ano_etapa = ?";
            $params[] = $anoEtapa;
        }
        if ($eixo) {
            $where[] = "eixo = ?";
            $params[] = $eixo;
        }
        if ($search !== null && $search !== '') {
            $where[] = "(codigo_habilidade LIKE ? OR habilidade LIKE ? OR eixo LIKE ? OR objetivo_aprendizagem LIKE ? OR objeto_conhecimento LIKE ? OR explicacao_habilidade LIKE ? OR exemplos LIKE ? OR materiais_complementares LIKE ?)";
            $term = '%' . $search . '%';
            for ($i = 0; $i < 8; $i++) {
                $params[] = $term;
            }
        }
        $whereClause = implode(' AND ', $where);
        $stmt = $pdo->prepare("SELECT * FROM bncc_computacional WHERE $whereClause ORDER BY ordem ASC, ano_etapa ASC, id ASC");
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        json_response_bncc(200, ['error' => false, 'habilidades' => $rows, 'total' => count($rows)]);
    }

    if ($method === 'POST') {
        $data = read_json_body();
        $tipoNivel = (string)($data['tipo_nivel'] ?? '');
        $anoEtapa = trim((string)($data['ano_etapa'] ?? ''));
        $codigoHabilidade = isset($data['codigo_habilidade']) ? trim((string)$data['codigo_habilidade']) : null;
        $habilidade = trim((string)($data['habilidade'] ?? ''));
        $eixo = trim((string)($data['eixo'] ?? ''));
        $objetivoAprendizagem = isset($data['objetivo_aprendizagem']) ? trim((string)$data['objetivo_aprendizagem']) : null;
        $objetoConhecimento = isset($data['objeto_conhecimento']) ? trim((string)$data['objeto_conhecimento']) : null;
        $explicacaoHabilidade = isset($data['explicacao_habilidade']) ? trim((string)$data['explicacao_habilidade']) : null;
        $exemplos = isset($data['exemplos']) ? trim((string)$data['exemplos']) : null;
        $materiaisComplementares = isset($data['materiais_complementares']) ? trim((string)$data['materiais_complementares']) : null;
        $ordem = (int)($data['ordem'] ?? 0);

        $allowedTipos = ['educacao_infantil', 'fundamental'];
        if (!in_array($tipoNivel, $allowedTipos, true)) {
            json_response_bncc(400, ['error' => true, 'message' => 'tipo_nivel deve ser educacao_infantil ou fundamental']);
        }
        if ($anoEtapa === '' || $habilidade === '' || $eixo === '') {
            json_response_bncc(400, ['error' => true, 'message' => 'ano_etapa, habilidade e eixo são obrigatórios']);
        }

        $id = $data['id'] ?? bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("
            INSERT INTO bncc_computacional (id, tipo_nivel, ano_etapa, codigo_habilidade, habilidade, eixo, objetivo_aprendizagem, objeto_conhecimento, explicacao_habilidade, exemplos, materiais_complementares, ordem)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id, $tipoNivel, $anoEtapa, $codigoHabilidade ?: null, $habilidade, $eixo,
            $objetivoAprendizagem ?: null, $objetoConhecimento ?: null, $explicacaoHabilidade ?: null, $exemplos ?: null, $materiaisComplementares ?: null, $ordem
        ]);
        json_response_bncc(201, ['error' => false, 'message' => 'Cadastrado com sucesso', 'id' => $id]);
    }

    if ($method === 'PUT') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));
        if ($id === '') {
            json_response_bncc(400, ['error' => true, 'message' => 'id é obrigatório']);
        }
        $check = $pdo->prepare("SELECT id FROM bncc_computacional WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            json_response_bncc(404, ['error' => true, 'message' => 'Registro não encontrado']);
        }

        $tipoNivel = (string)($data['tipo_nivel'] ?? '');
        $anoEtapa = trim((string)($data['ano_etapa'] ?? ''));
        $codigoHabilidade = isset($data['codigo_habilidade']) ? trim((string)$data['codigo_habilidade']) : null;
        $habilidade = trim((string)($data['habilidade'] ?? ''));
        $eixo = trim((string)($data['eixo'] ?? ''));
        $objetivoAprendizagem = isset($data['objetivo_aprendizagem']) ? trim((string)$data['objetivo_aprendizagem']) : null;
        $objetoConhecimento = isset($data['objeto_conhecimento']) ? trim((string)$data['objeto_conhecimento']) : null;
        $explicacaoHabilidade = isset($data['explicacao_habilidade']) ? trim((string)$data['explicacao_habilidade']) : null;
        $exemplos = isset($data['exemplos']) ? trim((string)$data['exemplos']) : null;
        $materiaisComplementares = isset($data['materiais_complementares']) ? trim((string)$data['materiais_complementares']) : null;
        $ordem = (int)($data['ordem'] ?? 0);

        $allowedTipos = ['educacao_infantil', 'fundamental'];
        if (!in_array($tipoNivel, $allowedTipos, true)) {
            json_response_bncc(400, ['error' => true, 'message' => 'tipo_nivel deve ser educacao_infantil ou fundamental']);
        }
        if ($anoEtapa === '' || $habilidade === '' || $eixo === '') {
            json_response_bncc(400, ['error' => true, 'message' => 'ano_etapa, habilidade e eixo são obrigatórios']);
        }

        $stmt = $pdo->prepare("
            UPDATE bncc_computacional SET
                tipo_nivel = ?, ano_etapa = ?, codigo_habilidade = ?, habilidade = ?, eixo = ?,
                objetivo_aprendizagem = ?, objeto_conhecimento = ?, explicacao_habilidade = ?, exemplos = ?, materiais_complementares = ?, ordem = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $tipoNivel, $anoEtapa, $codigoHabilidade ?: null, $habilidade, $eixo,
            $objetivoAprendizagem ?: null, $objetoConhecimento ?: null, $explicacaoHabilidade ?: null, $exemplos ?: null, $materiaisComplementares ?: null, $ordem, $id
        ]);
        json_response_bncc(200, ['error' => false, 'message' => 'Atualizado com sucesso']);
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? (read_json_body()['id'] ?? null);
        $id = is_string($id) ? trim($id) : null;
        if (!$id) {
            json_response_bncc(400, ['error' => true, 'message' => 'id é obrigatório']);
        }
        $stmt = $pdo->prepare("DELETE FROM bncc_computacional WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            json_response_bncc(404, ['error' => true, 'message' => 'Registro não encontrado']);
        }
        json_response_bncc(200, ['error' => false, 'message' => 'Removido com sucesso']);
    }

    json_response_bncc(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (PDOException $e) {
    error_log('BNCC API PDO: ' . $e->getMessage());
    json_response_bncc(500, ['error' => true, 'message' => 'Erro no servidor']);
} catch (Throwable $e) {
    error_log('BNCC API: ' . $e->getMessage());
    json_response_bncc(500, ['error' => true, 'message' => 'Erro no servidor']);
}
