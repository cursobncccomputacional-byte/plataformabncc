<?php
/**
 * API Dashboard Andamento (dados manuais de meta e pendentes por etapa/tipo)
 *
 * GET  /api/dashboard-andamento/index.php -> lista todos (apenas root)
 * POST /api/dashboard-andamento/index.php -> salva itens (body: { items: [...] }) (apenas root)
 *
 * Cada item: { etapa, tipo, meta, qte_pendente_gravacao, qte_pendente_edicao, qte_criadas, qte_gravadas, qte_editadas }
 * etapas: EF, 1º Ano, ... 9º Ano, AEE
 * tipo: plugada | desplugada
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
$role = $currentUser['role'] ?? null;
if ($role !== 'root') {
    json_out(403, ['error' => true, 'message' => 'Apenas root pode acessar o dashboard de andamento']);
}

global $pdo;
if (!isset($pdo)) {
    json_out(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$etapasValidas = ['EF', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', 'AEE'];
$tiposValidos = ['plugada', 'desplugada'];

try {
    if ($method === 'GET') {
        $tableExists = $pdo->query("SHOW TABLES LIKE 'dashboard_andamento'")->rowCount() > 0;
        if (!$tableExists) {
            json_out(200, ['error' => false, 'items' => []]);
        }

        $stmt = $pdo->query("SELECT etapa, tipo, meta, qte_pendente_gravacao, qte_pendente_edicao, qte_criadas, qte_gravadas, qte_editadas, updated_at FROM dashboard_andamento ORDER BY FIELD(etapa, 'EF', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', 'AEE'), tipo");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $items = [];
        foreach ($rows as $r) {
            $items[] = [
                'etapa' => $r['etapa'],
                'tipo' => $r['tipo'],
                'meta' => (int)$r['meta'],
                'qte_pendente_gravacao' => (int)($r['qte_pendente_gravacao'] ?? 0),
                'qte_pendente_edicao' => (int)($r['qte_pendente_edicao'] ?? 0),
                'qte_criadas' => (int)($r['qte_criadas'] ?? 0),
                'qte_gravadas' => (int)($r['qte_gravadas'] ?? 0),
                'qte_editadas' => (int)($r['qte_editadas'] ?? 0),
                'updated_at' => $r['updated_at'],
            ];
        }

        json_out(200, ['error' => false, 'items' => $items]);
    }

    if ($method === 'POST') {
        $data = read_json();
        $items = $data['items'] ?? [];
        if (!is_array($items)) {
            json_out(400, ['error' => true, 'message' => 'Envie { "items": [ ... ] }']);
        }

        $tableExists = $pdo->query("SHOW TABLES LIKE 'dashboard_andamento'")->rowCount() > 0;
        if (!$tableExists) {
            json_out(500, ['error' => true, 'message' => 'Tabela dashboard_andamento não existe. Execute o script SQL add-dashboard-andamento-table.sql']);
        }

        $stmt = $pdo->prepare("
            INSERT INTO dashboard_andamento (etapa, tipo, meta, qte_pendente_gravacao, qte_pendente_edicao, qte_criadas, qte_gravadas, qte_editadas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                meta = VALUES(meta),
                qte_pendente_gravacao = VALUES(qte_pendente_gravacao),
                qte_pendente_edicao = VALUES(qte_pendente_edicao),
                qte_criadas = VALUES(qte_criadas),
                qte_gravadas = VALUES(qte_gravadas),
                qte_editadas = VALUES(qte_editadas)
        ");

        foreach ($items as $item) {
            $etapa = trim((string)($item['etapa'] ?? ''));
            $tipo = strtolower(trim((string)($item['tipo'] ?? '')));
            if (!in_array($etapa, $etapasValidas, true) || !in_array($tipo, $tiposValidos, true)) {
                continue;
            }
            $meta = max(0, (int)($item['meta'] ?? 20));
            $pendGrav = max(0, (int)($item['qte_pendente_gravacao'] ?? 0));
            $pendEdit = max(0, (int)($item['qte_pendente_edicao'] ?? 0));
            $criadas = max(0, (int)($item['qte_criadas'] ?? 0));
            $gravadas = max(0, (int)($item['qte_gravadas'] ?? 0));
            $editadas = max(0, (int)($item['qte_editadas'] ?? 0));
            $stmt->execute([$etapa, $tipo, $meta, $pendGrav, $pendEdit, $criadas, $gravadas, $editadas]);
        }

        json_out(200, ['error' => false, 'message' => 'Dados salvos']);
    }

    json_out(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (Throwable $e) {
    error_log('dashboard-andamento: ' . $e->getMessage());
    json_out(500, ['error' => true, 'message' => 'Erro ao processar']);
}
