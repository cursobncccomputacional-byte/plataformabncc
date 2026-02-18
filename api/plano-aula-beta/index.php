<?php
/**
 * API de Planos de Aula Beta
 *
 * GET    /api/plano-aula-beta/index.php                  -> lista planos (opcional: atividade_id)
 * GET    /api/plano-aula-beta/index.php?id=123           -> obtém plano específico
 * POST   /api/plano-aula-beta/index.php                  -> cria plano (apenas root)
 * PATCH  /api/plano-aula-beta/index.php                  -> atualiza plano (apenas root)
 * DELETE /api/plano-aula-beta/index.php                  -> remove plano (apenas root)
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

function plano_beta_json_out(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function plano_beta_read_json(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        plano_beta_json_out(400, ['error' => true, 'message' => 'JSON inválido']);
    }
    return $data;
}

// Autenticação obrigatória para todos os métodos
$currentUser = requireAuth();
$currentRole = $currentUser['role'] ?? null;

global $pdo;
if (!isset($pdo)) {
    plano_beta_json_out(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

try {
    if ($method === 'GET') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $atividadeId = isset($_GET['atividade_id']) ? trim((string)$_GET['atividade_id']) : '';

        if ($id > 0) {
            $stmt = $pdo->prepare("SELECT * FROM planos_aula_beta WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                plano_beta_json_out(404, ['error' => true, 'message' => 'Plano de aula beta não encontrado']);
            }

            $item = [
                'id' => (int)$row['id'],
                'atividade_id' => $row['atividade_id'],
                'carga_horaria_min' => (int)$row['carga_horaria_min'],
                'tipo_atividade' => $row['tipo_atividade'],
                'componente_curricular_principal' => $row['componente_curricular_principal'],
                'disciplinas_integradas' => $row['disciplinas_integradas'] ? json_decode($row['disciplinas_integradas'], true) ?: [] : [],
                'eixos_tematicos' => $row['eixos_tematicos'] ? json_decode($row['eixos_tematicos'], true) ?: [] : [],
                'habilidades_computacao_ids' => $row['habilidades_computacao_ids'] ? json_decode($row['habilidades_computacao_ids'], true) ?: [] : [],
                'habilidades_disciplinas_integradas' => $row['habilidades_disciplinas_integradas'] ? json_decode($row['habilidades_disciplinas_integradas'], true) ?: [] : [],
                'objetivo_geral' => $row['objetivo_geral'],
                'objetivos_especificos' => $row['objetivos_especificos'] ? json_decode($row['objetivos_especificos'], true) ?: [] : [],
                'introducao_tempo_min' => (int)$row['introducao_tempo_min'],
                'introducao_descricao' => $row['introducao_descricao'],
                'desenvolvimento_tempo_min' => (int)$row['desenvolvimento_tempo_min'],
                'desenvolvimento_sequencia_coletiva' => $row['desenvolvimento_sequencia_coletiva'],
                'desenvolvimento_mao_na_massa' => $row['desenvolvimento_mao_na_massa'],
                'desenvolvimento_desafio_extra' => $row['desenvolvimento_desafio_extra'],
                'fechamento_tempo_min' => (int)$row['fechamento_tempo_min'],
                'recursos_didaticos' => $row['recursos_didaticos'],
                'avaliacao_criterios' => $row['avaliacao_criterios'],
                'avaliacao_instrumento' => $row['avaliacao_instrumento'],
                'adaptacoes_inclusao' => $row['adaptacoes_inclusao'],
                'created_by' => $row['created_by'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
            ];

            plano_beta_json_out(200, ['error' => false, 'plano' => $item]);
        }

        $sql = "SELECT * FROM planos_aula_beta WHERE 1=1";
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
                'carga_horaria_min' => (int)$r['carga_horaria_min'],
                'tipo_atividade' => $r['tipo_atividade'],
                'componente_curricular_principal' => $r['componente_curricular_principal'],
                'disciplinas_integradas' => $r['disciplinas_integradas'] ? json_decode($r['disciplinas_integradas'], true) ?: [] : [],
                'eixos_tematicos' => $r['eixos_tematicos'] ? json_decode($r['eixos_tematicos'], true) ?: [] : [],
                'habilidades_computacao_ids' => $r['habilidades_computacao_ids'] ? json_decode($r['habilidades_computacao_ids'], true) ?: [] : [],
                'habilidades_disciplinas_integradas' => $r['habilidades_disciplinas_integradas'] ? json_decode($r['habilidades_disciplinas_integradas'], true) ?: [] : [],
                'objetivo_geral' => $r['objetivo_geral'],
                'objetivos_especificos' => $r['objetivos_especificos'] ? json_decode($r['objetivos_especificos'], true) ?: [] : [],
                'introducao_tempo_min' => (int)$r['introducao_tempo_min'],
                'introducao_descricao' => $r['introducao_descricao'],
                'desenvolvimento_tempo_min' => (int)$r['desenvolvimento_tempo_min'],
                'desenvolvimento_sequencia_coletiva' => $r['desenvolvimento_sequencia_coletiva'],
                'desenvolvimento_mao_na_massa' => $r['desenvolvimento_mao_na_massa'],
                'desenvolvimento_desafio_extra' => $r['desenvolvimento_desafio_extra'],
                'fechamento_tempo_min' => (int)$r['fechamento_tempo_min'],
                'recursos_didaticos' => $r['recursos_didaticos'],
                'avaliacao_criterios' => $r['avaliacao_criterios'],
                'avaliacao_instrumento' => $r['avaliacao_instrumento'],
                'adaptacoes_inclusao' => $r['adaptacoes_inclusao'],
                'created_by' => $r['created_by'],
                'created_at' => $r['created_at'],
                'updated_at' => $r['updated_at'],
            ];
        }

        plano_beta_json_out(200, ['error' => false, 'planos' => $list, 'count' => count($list)]);
    }

    // Escrita apenas para root
    if (in_array($method, ['POST', 'PATCH', 'DELETE'], true)) {
        if ($currentRole !== 'root') {
            plano_beta_json_out(403, ['error' => true, 'message' => 'Acesso negado. Apenas root pode gerenciar planos de aula beta.']);
        }
    }

    if ($method === 'POST') {
        $data = plano_beta_read_json();

        $atividadeId = trim((string)($data['atividade_id'] ?? ''));
        if ($atividadeId === '') {
            plano_beta_json_out(400, ['error' => true, 'message' => 'atividade_id é obrigatório']);
        }

        $cargaHoraria = isset($data['carga_horaria_min']) ? (int)$data['carga_horaria_min'] : 0;
        $tipoAtividade = trim((string)($data['tipo_atividade'] ?? 'Plugada'));
        $componentePrincipal = isset($data['componente_curricular_principal']) ? trim((string)$data['componente_curricular_principal']) : null;

        $disciplinasIntegradas = isset($data['disciplinas_integradas']) && is_array($data['disciplinas_integradas'])
            ? json_encode(array_values($data['disciplinas_integradas']), JSON_UNESCAPED_UNICODE)
            : null;

        $eixosTematicos = isset($data['eixos_tematicos']) && is_array($data['eixos_tematicos'])
            ? json_encode(array_values($data['eixos_tematicos']), JSON_UNESCAPED_UNICODE)
            : null;

        $habilidadesComputacaoIds = isset($data['habilidades_computacao_ids']) && is_array($data['habilidades_computacao_ids'])
            ? json_encode(array_values($data['habilidades_computacao_ids']), JSON_UNESCAPED_UNICODE)
            : null;

        $habilidadesDisciplinasIntegradas = isset($data['habilidades_disciplinas_integradas']) && is_array($data['habilidades_disciplinas_integradas'])
            ? json_encode(array_values($data['habilidades_disciplinas_integradas']), JSON_UNESCAPED_UNICODE)
            : null;

        $objetivoGeral = isset($data['objetivo_geral']) ? trim((string)$data['objetivo_geral']) : null;
        $objetivosEspecificos = isset($data['objetivos_especificos']) && is_array($data['objetivos_especificos'])
            ? json_encode(array_values($data['objetivos_especificos']), JSON_UNESCAPED_UNICODE)
            : null;

        $introducaoTempo = isset($data['introducao_tempo_min']) ? (int)$data['introducao_tempo_min'] : 0;
        $introducaoDescricao = isset($data['introducao_descricao']) ? (string)$data['introducao_descricao'] : null;

        $desenvolvimentoTempo = isset($data['desenvolvimento_tempo_min']) ? (int)$data['desenvolvimento_tempo_min'] : 0;
        $desenvolvimentoSequencia = isset($data['desenvolvimento_sequencia_coletiva']) ? (string)$data['desenvolvimento_sequencia_coletiva'] : null;
        $desenvolvimentoMaoNaMassa = isset($data['desenvolvimento_mao_na_massa']) ? (string)$data['desenvolvimento_mao_na_massa'] : null;
        $desenvolvimentoDesafioExtra = isset($data['desenvolvimento_desafio_extra']) ? (string)$data['desenvolvimento_desafio_extra'] : null;

        $fechamentoTempo = isset($data['fechamento_tempo_min']) ? (int)$data['fechamento_tempo_min'] : 0;

        $recursosDidaticos = isset($data['recursos_didaticos']) ? (string)$data['recursos_didaticos'] : null;

        $avaliacaoCriterios = isset($data['avaliacao_criterios']) ? (string)$data['avaliacao_criterios'] : null;
        $avaliacaoInstrumento = isset($data['avaliacao_instrumento']) ? (string)$data['avaliacao_instrumento'] : null;

        $adaptacoesInclusao = isset($data['adaptacoes_inclusao']) ? (string)$data['adaptacoes_inclusao'] : null;

        // Verificar se atividade existe
        $checkAtv = $pdo->prepare("SELECT id FROM atividades WHERE id = ?");
        $checkAtv->execute([$atividadeId]);
        if ($checkAtv->fetch() === false) {
            plano_beta_json_out(400, ['error' => true, 'message' => 'Atividade vinculada não encontrada']);
        }

        $stmt = $pdo->prepare("
            INSERT INTO planos_aula_beta (
              atividade_id,
              carga_horaria_min,
              tipo_atividade,
              componente_curricular_principal,
              disciplinas_integradas,
              eixos_tematicos,
              habilidades_computacao_ids,
              habilidades_disciplinas_integradas,
              objetivo_geral,
              objetivos_especificos,
              introducao_tempo_min,
              introducao_descricao,
              desenvolvimento_tempo_min,
              desenvolvimento_sequencia_coletiva,
              desenvolvimento_mao_na_massa,
              desenvolvimento_desafio_extra,
              fechamento_tempo_min,
              recursos_didaticos,
              avaliacao_criterios,
              avaliacao_instrumento,
              adaptacoes_inclusao,
              created_by
            ) VALUES (
              :atividade_id,
              :carga_horaria_min,
              :tipo_atividade,
              :componente_curricular_principal,
              :disciplinas_integradas,
              :eixos_tematicos,
              :habilidades_computacao_ids,
              :habilidades_disciplinas_integradas,
              :objetivo_geral,
              :objetivos_especificos,
              :introducao_tempo_min,
              :introducao_descricao,
              :desenvolvimento_tempo_min,
              :desenvolvimento_sequencia_coletiva,
              :desenvolvimento_mao_na_massa,
              :desenvolvimento_desafio_extra,
              :fechamento_tempo_min,
              :recursos_didaticos,
              :avaliacao_criterios,
              :avaliacao_instrumento,
              :adaptacoes_inclusao,
              :created_by
            )
        ");

        $stmt->execute([
            ':atividade_id' => $atividadeId,
            ':carga_horaria_min' => $cargaHoraria,
            ':tipo_atividade' => $tipoAtividade,
            ':componente_curricular_principal' => $componentePrincipal ?: null,
            ':disciplinas_integradas' => $disciplinasIntegradas,
            ':eixos_tematicos' => $eixosTematicos,
            ':habilidades_computacao_ids' => $habilidadesComputacaoIds,
            ':habilidades_disciplinas_integradas' => $habilidadesDisciplinasIntegradas,
            ':objetivo_geral' => $objetivoGeral,
            ':objetivos_especificos' => $objetivosEspecificos,
            ':introducao_tempo_min' => $introducaoTempo,
            ':introducao_descricao' => $introducaoDescricao,
            ':desenvolvimento_tempo_min' => $desenvolvimentoTempo,
            ':desenvolvimento_sequencia_coletiva' => $desenvolvimentoSequencia,
            ':desenvolvimento_mao_na_massa' => $desenvolvimentoMaoNaMassa,
            ':desenvolvimento_desafio_extra' => $desenvolvimentoDesafioExtra,
            ':fechamento_tempo_min' => $fechamentoTempo,
            ':recursos_didaticos' => $recursosDidaticos,
            ':avaliacao_criterios' => $avaliacaoCriterios,
            ':avaliacao_instrumento' => $avaliacaoInstrumento,
            ':adaptacoes_inclusao' => $adaptacoesInclusao,
            ':created_by' => $currentUser['id'] ?? null,
        ]);

        $newId = (int)$pdo->lastInsertId();

        $sel = $pdo->prepare("SELECT * FROM planos_aula_beta WHERE id = ?");
        $sel->execute([$newId]);
        $row = $sel->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            plano_beta_json_out(500, ['error' => true, 'message' => 'Erro ao carregar plano recém-criado']);
        }

        $item = [
            'id' => (int)$row['id'],
            'atividade_id' => $row['atividade_id'],
            'carga_horaria_min' => (int)$row['carga_horaria_min'],
            'tipo_atividade' => $row['tipo_atividade'],
            'componente_curricular_principal' => $row['componente_curricular_principal'],
            'disciplinas_integradas' => $row['disciplinas_integradas'] ? json_decode($row['disciplinas_integradas'], true) ?: [] : [],
            'eixos_tematicos' => $row['eixos_tematicos'] ? json_decode($row['eixos_tematicos'], true) ?: [] : [],
            'habilidades_computacao_ids' => $row['habilidades_computacao_ids'] ? json_decode($row['habilidades_computacao_ids'], true) ?: [] : [],
            'habilidades_disciplinas_integradas' => $row['habilidades_disciplinas_integradas'] ? json_decode($row['habilidades_disciplinas_integradas'], true) ?: [] : [],
            'objetivo_geral' => $row['objetivo_geral'],
            'objetivos_especificos' => $row['objetivos_especificos'] ? json_decode($row['objetivos_especificos'], true) ?: [] : [],
            'introducao_tempo_min' => (int)$row['introducao_tempo_min'],
            'introducao_descricao' => $row['introducao_descricao'],
            'desenvolvimento_tempo_min' => (int)$row['desenvolvimento_tempo_min'],
            'desenvolvimento_sequencia_coletiva' => $row['desenvolvimento_sequencia_coletiva'],
            'desenvolvimento_mao_na_massa' => $row['desenvolvimento_mao_na_massa'],
            'desenvolvimento_desafio_extra' => $row['desenvolvimento_desafio_extra'],
            'fechamento_tempo_min' => (int)$row['fechamento_tempo_min'],
            'recursos_didaticos' => $row['recursos_didaticos'],
            'avaliacao_criterios' => $row['avaliacao_criterios'],
            'avaliacao_instrumento' => $row['avaliacao_instrumento'],
            'adaptacoes_inclusao' => $row['adaptacoes_inclusao'],
            'created_by' => $row['created_by'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];

        plano_beta_json_out(201, ['error' => false, 'plano' => $item]);
    }

    if ($method === 'PATCH') {
        $data = plano_beta_read_json();
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id <= 0) {
            plano_beta_json_out(400, ['error' => true, 'message' => 'ID inválido']);
        }

        $fields = [];
        $params = [];

        if (array_key_exists('atividade_id', $data)) {
            $atividadeId = trim((string)$data['atividade_id']);
            if ($atividadeId === '') {
                plano_beta_json_out(400, ['error' => true, 'message' => 'atividade_id não pode ser vazio']);
            }
            $checkAtv = $pdo->prepare("SELECT id FROM atividades WHERE id = ?");
            $checkAtv->execute([$atividadeId]);
            if ($checkAtv->fetch() === false) {
                plano_beta_json_out(400, ['error' => true, 'message' => 'Atividade vinculada não encontrada']);
            }
            $fields[] = 'atividade_id = :atividade_id';
            $params[':atividade_id'] = $atividadeId;
        }

        foreach ([
            'carga_horaria_min' => 'INT',
            'tipo_atividade' => 'STR',
            'componente_curricular_principal' => 'STR',
        ] as $key => $type) {
            if (array_key_exists($key, $data)) {
                $val = $data[$key];
                if ($type === 'INT') {
                  $val = (int)$val;
                } else {
                  $val = trim((string)$val);
                }
                $fields[] = $key . ' = :' . $key;
                $params[':' . $key] = $val;
            }
        }

        foreach ([
            'disciplinas_integradas',
            'eixos_tematicos',
            'habilidades_computacao_ids',
            'habilidades_disciplinas_integradas',
            'objetivos_especificos',
        ] as $jsonKey) {
            if (array_key_exists($jsonKey, $data)) {
                $val = is_array($data[$jsonKey]) ? json_encode(array_values($data[$jsonKey]), JSON_UNESCAPED_UNICODE) : null;
                $fields[] = $jsonKey . ' = :' . $jsonKey;
                $params[':' . $jsonKey] = $val;
            }
        }

        foreach ([
            'objetivo_geral',
            'introducao_descricao',
            'desenvolvimento_sequencia_coletiva',
            'desenvolvimento_mao_na_massa',
            'desenvolvimento_desafio_extra',
            'recursos_didaticos',
            'avaliacao_criterios',
            'avaliacao_instrumento',
            'adaptacoes_inclusao',
        ] as $textKey) {
            if (array_key_exists($textKey, $data)) {
                $val = (string)$data[$textKey];
                $fields[] = $textKey . ' = :' . $textKey;
                $params[':' . $textKey] = $val;
            }
        }

        foreach ([
            'introducao_tempo_min',
            'desenvolvimento_tempo_min',
            'fechamento_tempo_min',
        ] as $intKey) {
            if (array_key_exists($intKey, $data)) {
                $val = (int)$data[$intKey];
                $fields[] = $intKey . ' = :' . $intKey;
                $params[':' . $intKey] = $val;
            }
        }

        if (empty($fields)) {
            plano_beta_json_out(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }

        $fields[] = 'updated_at = NOW()';

        $sql = "UPDATE planos_aula_beta SET " . implode(', ', $fields) . " WHERE id = :id";
        $params[':id'] = $id;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Mesmo que nada tenha sido alterado, retornamos o registro atualizado
        $sel = $pdo->prepare("SELECT * FROM planos_aula_beta WHERE id = ?");
        $sel->execute([$id]);
        $row = $sel->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            plano_beta_json_out(404, ['error' => true, 'message' => 'Plano de aula beta não encontrado']);
        }

        $item = [
            'id' => (int)$row['id'],
            'atividade_id' => $row['atividade_id'],
            'carga_horaria_min' => (int)$row['carga_horaria_min'],
            'tipo_atividade' => $row['tipo_atividade'],
            'componente_curricular_principal' => $row['componente_curricular_principal'],
            'disciplinas_integradas' => $row['disciplinas_integradas'] ? json_decode($row['disciplinas_integradas'], true) ?: [] : [],
            'eixos_tematicos' => $row['eixos_tematicos'] ? json_decode($row['eixos_tematicos'], true) ?: [] : [],
            'habilidades_computacao_ids' => $row['habilidades_computacao_ids'] ? json_decode($row['habilidades_computacao_ids'], true) ?: [] : [],
            'habilidades_disciplinas_integradas' => $row['habilidades_disciplinas_integradas'] ? json_decode($row['habilidades_disciplinas_integradas'], true) ?: [] : [],
            'objetivo_geral' => $row['objetivo_geral'],
            'objetivos_especificos' => $row['objetivos_especificos'] ? json_decode($row['objetivos_especificos'], true) ?: [] : [],
            'introducao_tempo_min' => (int)$row['introducao_tempo_min'],
            'introducao_descricao' => $row['introducao_descricao'],
            'desenvolvimento_tempo_min' => (int)$row['desenvolvimento_tempo_min'],
            'desenvolvimento_sequencia_coletiva' => $row['desenvolvimento_sequencia_coletiva'],
            'desenvolvimento_mao_na_massa' => $row['desenvolvimento_mao_na_massa'],
            'desenvolvimento_desafio_extra' => $row['desenvolvimento_desafio_extra'],
            'fechamento_tempo_min' => (int)$row['fechamento_tempo_min'],
            'recursos_didaticos' => $row['recursos_didaticos'],
            'avaliacao_criterios' => $row['avaliacao_criterios'],
            'avaliacao_instrumento' => $row['avaliacao_instrumento'],
            'adaptacoes_inclusao' => $row['adaptacoes_inclusao'],
            'created_by' => $row['created_by'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];

        plano_beta_json_out(200, ['error' => false, 'plano' => $item]);
    }

    if ($method === 'DELETE') {
        $data = plano_beta_read_json();
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id <= 0) {
            plano_beta_json_out(400, ['error' => true, 'message' => 'ID inválido']);
        }

        $stmt = $pdo->prepare("DELETE FROM planos_aula_beta WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            plano_beta_json_out(404, ['error' => true, 'message' => 'Plano de aula beta não encontrado']);
        }

        plano_beta_json_out(200, ['error' => false, 'message' => 'Plano de aula beta removido com sucesso']);
    }

    plano_beta_json_out(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (Throwable $e) {
    error_log('Erro em plano-aula-beta: ' . $e->getMessage());
    plano_beta_json_out(500, ['error' => true, 'message' => 'Erro ao processar planos de aula beta']);
}

