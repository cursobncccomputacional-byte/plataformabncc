<?php
/**
 * API de Atividades (Plataforma BNCC)
 * CRUD completo para vídeos de atividades educacionais
 * 
 * GET    /api/activities/index.php -> lista atividades
 * GET    /api/activities/index.php?id=xxx -> detalhes da atividade
 * POST   /api/activities/index.php -> cria atividade (requer can_manage_activities)
 * PUT    /api/activities/index.php -> atualiza atividade (requer can_manage_activities)
 * DELETE /api/activities/index.php -> deleta atividade (requer can_manage_activities)
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

// Preflight CORS (OPTIONS): responder 200 e encerrar antes de qualquer auth/validação.
// Sem isso, navegadores bloqueiam chamadas cross-origin com erro 405 no preflight.
if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response_act(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Para GET, não precisa autenticação obrigatória (atividades podem ser públicas)
// Mas tentamos obter usuário se houver sessão ou headers
$currentUser = getCurrentUser();

// Verificar permissão apenas para operações de escrita
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    if (!$currentUser) {
        // Tentar obter do header X-User-Id como fallback
        $headers = getallheaders();
        if (isset($headers['X-User-Id'])) {
            $userId = $headers['X-User-Id'];
            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ? AND ativo = 1");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $currentUser = [
                    'id' => $user['id'],
                    'can_manage_activities' => (bool)($user['can_manage_activities'] ?? 0),
                    'can_manage_courses' => (bool)($user['can_manage_courses'] ?? 0),
                    'role' => $user['nivel_acesso'],
                ];
            }
        }
        
        if (!$currentUser) {
            json_response_act(401, ['error' => true, 'message' => 'Não autenticado']);
        }
    }
    
    $userRole = strtolower($currentUser['role'] ?? '');
    $canManage = (bool)($currentUser['can_manage_activities'] ?? false);
    
    if ($userRole !== 'root' && !$canManage) {
        json_response_act(403, [
            'error' => true,
            'message' => 'Você não tem permissão para gerenciar atividades. Solicite acesso ao administrador.'
        ]);
    }
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        json_response_act(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

/**
 * Lista fixa de atividades liberadas para o perfil "teste_professor":
 * EI até 5º ano (2 por etapa/ano). Do 6º ano em diante permanecem bloqueadas.
 * Comparação por nome da atividade (trim, case-insensitive).
 *
 * EI: Compartilhando Interesses, Construindo a Casinha
 * 1º ano: Baralho de Pessoas, Colorindo por Códigos
 * 2º ano: Desenho vs Objeto real, Semáforo e o trânsito
 * 3º ano: Os Meus Preferidos, Criação de Tirinhas
 * 4º ano: Códigos Secretos, Manipulando Documentos
 * 5º ano: Batata Quente, Investigadores de Fake News
 */
function get_teste_professor_whitelist(): array {
    return [
        'Compartilhando Interesses',
        'Construindo a Casinha',
        'Baralho de Pessoas',
        'Colorindo por Códigos',
        'Desenho vs Objeto real',
        'Semáforo e o trânsito',
        'Os Meus Preferidos',
        'Criação de Tirinhas',
        'Códigos Secretos',
        'Manipulando Documentos',
        'Batata Quente',
        'Investigadores de Fake News',
    ];
}

/**
 * Lista configurável (via banco) de atividades liberadas para o perfil "teste_professor".
 * Se a tabela não existir, usamos a whitelist fixa por nome como fallback (compatibilidade).
 *
 * @return array{ids: array<int,string>, table_exists: bool}
 */
function get_teste_professor_allowed_ids(PDO $pdo): array {
    try {
        $tableExists = ($pdo->query("SHOW TABLES LIKE 'teste_professor_atividades_liberadas'")->rowCount() ?? 0) > 0;
        if (!$tableExists) {
            return ['ids' => [], 'table_exists' => false];
        }
        $stmt = $pdo->query("SELECT activity_id FROM teste_professor_atividades_liberadas");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        $ids = [];
        foreach ($rows as $r) {
            $id = trim((string)($r['activity_id'] ?? ''));
            if ($id !== '') $ids[] = $id;
        }
        // remover duplicados preservando valores
        $ids = array_values(array_keys(array_fill_keys($ids, true)));
        return ['ids' => $ids, 'table_exists' => true];
    } catch (Throwable $e) {
        return ['ids' => [], 'table_exists' => false];
    }
}

/**
 * Regra do perfil "teste_professor":
 * - vê TODAS as atividades: as liberadas (whitelist) como bloqueada=false, as demais como bloqueada=true
 * - retorna ordenado: liberadas na frente do grid, bloqueadas no final
 * - fallback (se tabela não existir): usa whitelist fixa por NOME (compatibilidade)
 *
 * @param array<int, array<string,mixed>> $activitiesData
 * @return array<int, array<string,mixed>>
 */
function apply_teste_professor_access(PDO $pdo, array $activitiesData): array {
    $cfg = get_teste_professor_allowed_ids($pdo);
    $tableExists = (bool)($cfg['table_exists'] ?? false);

    $allowedIdSet = [];
    if ($tableExists) {
        foreach ($cfg['ids'] as $id) {
            $allowedIdSet[$id] = true;
        }
    }

    $whitelistNormalized = [];
    if (!$tableExists) {
        foreach (get_teste_professor_whitelist() as $nome) {
            $whitelistNormalized[mb_strtolower(trim((string)$nome), 'UTF-8')] = true;
        }
    }

    $liberadas = [];
    $bloqueadas = [];
    foreach ($activitiesData as $a) {
        $id = trim((string)($a['id'] ?? ''));
        $nome = trim((string)($a['nome_atividade'] ?? ''));
        $allowed = false;
        if ($tableExists) {
            $allowed = $id !== '' && isset($allowedIdSet[$id]);
        } else {
            $allowed = $nome !== '' && isset($whitelistNormalized[mb_strtolower($nome, 'UTF-8')]);
        }

        if ($allowed) {
            $a['bloqueada'] = false;
            $liberadas[] = $a;
        } else {
            $a['bloqueada'] = true;
            $bloqueadas[] = $a;
        }
    }

    return array_merge($liberadas, $bloqueadas);
}

/**
 * Verifica se uma atividade específica é liberada para teste_professor.
 */
function is_teste_professor_allowed(PDO $pdo, string $activityId, string $activityName): bool {
    $cfg = get_teste_professor_allowed_ids($pdo);
    $tableExists = (bool)($cfg['table_exists'] ?? false);
    if ($tableExists) {
        return $activityId !== '' && in_array($activityId, $cfg['ids'], true);
    }
    $nameKey = mb_strtolower(trim($activityName), 'UTF-8');
    $whitelist = [];
    foreach (get_teste_professor_whitelist() as $n) {
        $whitelist[mb_strtolower(trim((string)$n), 'UTF-8')] = true;
    }
    return $nameKey !== '' && isset($whitelist[$nameKey]);
}

/**
 * Retorna eixos distintos a partir dos IDs de curriculo_habilidades (para derivar eixos_bncc da atividade).
 * @param PDO $pdo
 * @param array<int> $habilidadesIds
 * @return array<string> eixos únicos
 */
function eixos_from_habilidades_ids(PDO $pdo, array $habilidadesIds): array {
    if (empty($habilidadesIds)) {
        return [];
    }
    $placeholders = implode(',', array_fill(0, count($habilidadesIds), '?'));
    $stmt = $pdo->prepare("SELECT DISTINCT eixo FROM curriculo_habilidades WHERE id IN ($placeholders)");
    $stmt->execute(array_values($habilidadesIds));
    $eixos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (!empty($row['eixo'])) {
            $eixos[] = $row['eixo'];
        }
    }
    return $eixos;
}

/**
 * Retorna detalhes das habilidades (curriculo_habilidades) por IDs.
 * @param PDO $pdo
 * @param array<int> $habilidadesIds
 * @return array<array{id:int,codigo:string,eixo:string,descricao:string}>
 */
function habilidades_details_by_ids(PDO $pdo, array $habilidadesIds): array {
    if (empty($habilidadesIds)) {
        return [];
    }
    $placeholders = implode(',', array_fill(0, count($habilidadesIds), '?'));
    $stmt = $pdo->prepare("SELECT id, codigo, eixo, descricao FROM curriculo_habilidades WHERE id IN ($placeholders) ORDER BY id");
    $stmt->execute(array_values($habilidadesIds));
    $list = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $list[] = [
            'id' => (int) $row['id'],
            'codigo' => (string) ($row['codigo'] ?? ''),
            'eixo' => (string) ($row['eixo'] ?? ''),
            'descricao' => (string) ($row['descricao'] ?? ''),
        ];
    }
    return $list;
}

/**
 * Deriva nomes de etapas (ex: "1º Ano") a partir de habilidades do currículo.
 * @param PDO $pdo
 * @param array<int> $habilidadesIds
 * @return array<string>
 */
function anos_escolares_from_habilidades_ids(PDO $pdo, array $habilidadesIds): array {
    if (empty($habilidadesIds)) {
        return [];
    }
    $placeholders = implode(',', array_fill(0, count($habilidadesIds), '?'));
    $stmt = $pdo->prepare("
        SELECT DISTINCT e.nome as etapa_nome
        FROM curriculo_habilidades h
        INNER JOIN curriculo_etapas_ensino e ON e.id = h.etapa_id
        WHERE h.id IN ($placeholders)
        ORDER BY e.id
    ");
    $stmt->execute(array_values($habilidadesIds));
    $anos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $nome = (string)($row['etapa_nome'] ?? '');
        if ($nome !== '') {
            $anos[] = $nome;
        }
    }
    return $anos;
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response_act(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    if ($method === 'GET') {
        $activityId = $_GET['id'] ?? null;

        if ($activityId) {
            // Buscar atividade específica (com compatibilidade para campos antigos)
            $hasAeeColSingle = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'aee'")->rowCount() > 0;
            $hasEtapasColSingle = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'etapas'")->rowCount() > 0;
            $stmt = $pdo->prepare("SELECT 
                id,
                COALESCE(nome_atividade, titulo) as nome_atividade,
                descricao,
                tipo,
                etapa,
                " . ($hasEtapasColSingle ? "COALESCE(etapas, '[]') as etapas," : "") . "
                anos_escolares,
                COALESCE(eixos_bncc, JSON_ARRAY(id_eixo)) as eixos_bncc,
                COALESCE(disciplinas_transversais, '[]') as disciplinas_transversais,
                COALESCE(habilidades_ids, '[]') as habilidades_ids,
                duracao,
                " . ($hasAeeColSingle ? "COALESCE(aee, 0) as aee," : "") . "
                COALESCE(nivel_dificuldade,
                    CASE 
                        WHEN dificuldade = 'facil' THEN 'Fácil'
                        WHEN dificuldade = 'medio' THEN 'Médio'
                        WHEN dificuldade = 'dificil' THEN 'Difícil'
                        ELSE 'Médio'
                    END
                ) as nivel_dificuldade,
                COALESCE(thumbnail_url, url_miniatura) as thumbnail_url,
                COALESCE(video_url, url_video) as video_url,
                COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                material_apoio_url,
                COALESCE(criado_em, data_criacao) as criado_em,
                atualizado_em,
                criado_por,
                COALESCE(bloqueada, 0) as bloqueada
            FROM atividades WHERE id = ?");
            $stmt->execute([$activityId]);
            $activity = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$activity) {
                json_response_act(404, ['error' => true, 'message' => 'Atividade não encontrada']);
            }

            // Converter tipo para formato esperado
            $tipo = $activity['tipo'] ?? '';
            if (strtolower($tipo) === 'plugada') $tipo = 'Plugada';
            if (strtolower($tipo) === 'desplugada') $tipo = 'Desplugada';
            
            // Converter eixos_bncc
            $eixosBncc = [];
            if (isset($activity['eixos_bncc'])) {
                if (is_string($activity['eixos_bncc'])) {
                    $decoded = json_decode($activity['eixos_bncc'], true);
                    $eixosBncc = is_array($decoded) ? $decoded : [];
                } elseif (is_array($activity['eixos_bncc'])) {
                    $eixosBncc = $activity['eixos_bncc'];
                }
            }
            
            // Converter anos_escolares
            $anosEscolares = [];
            if (isset($activity['anos_escolares'])) {
                if (is_string($activity['anos_escolares'])) {
                    $decoded = json_decode($activity['anos_escolares'], true);
                    $anosEscolares = is_array($decoded) ? $decoded : [];
                } elseif (is_array($activity['anos_escolares'])) {
                    $anosEscolares = $activity['anos_escolares'];
                }
            }

            // disciplinas_transversais
            $disciplinasTransversais = [];
            if (isset($activity['disciplinas_transversais'])) {
                if (is_string($activity['disciplinas_transversais'])) {
                    $decoded = json_decode($activity['disciplinas_transversais'], true);
                    $disciplinasTransversais = is_array($decoded) ? $decoded : [];
                } elseif (is_array($activity['disciplinas_transversais'])) {
                    $disciplinasTransversais = $activity['disciplinas_transversais'];
                }
            }

            // habilidades_ids e detalhes das habilidades (curriculo_habilidades)
            $habilidadesIds = [];
            if (isset($activity['habilidades_ids'])) {
                if (is_string($activity['habilidades_ids'])) {
                    $decoded = json_decode($activity['habilidades_ids'], true);
                    $habilidadesIds = is_array($decoded) ? array_map('intval', array_filter($decoded, 'is_numeric')) : [];
                } elseif (is_array($activity['habilidades_ids'])) {
                    $habilidadesIds = array_map('intval', array_filter($activity['habilidades_ids'], 'is_numeric'));
                }
            }
            $habilidadesDetails = [];
            if (!empty($habilidadesIds)) {
                $tablesExist = $pdo->query("SHOW TABLES LIKE 'curriculo_habilidades'")->rowCount() > 0;
                if ($tablesExist) {
                    $habilidadesDetails = habilidades_details_by_ids($pdo, $habilidadesIds);
                }
            }

            $bloqueada = (int)($activity['bloqueada'] ?? 0) === 1;
            // Perfil "Teste Professor": vê a atividade; se não estiver na whitelist, vem como bloqueada
            if ($currentUser && strtolower((string)($currentUser['role'] ?? '')) === 'teste_professor') {
                $bloqueada = !is_teste_professor_allowed($pdo, (string)($activity['id'] ?? ''), (string)($activity['nome_atividade'] ?? ''));
            }
            $activityOut = [
                'id' => $activity['id'],
                'nome_atividade' => $activity['nome_atividade'] ?? '',
                'descricao' => $activity['descricao'] ?? null,
                'tipo' => $tipo,
                'etapa' => $activity['etapa'] ?? null,
                'anos_escolares' => $anosEscolares,
                'eixos_bncc' => $eixosBncc,
                'disciplinas_transversais' => $disciplinasTransversais,
                'habilidades_ids' => $habilidadesIds,
                'habilidades' => $habilidadesDetails,
                'duracao' => $activity['duracao'] ?? null,
                'thumbnail_url' => $activity['thumbnail_url'] ?? null,
                'video_url' => $activity['video_url'] ?? null,
                'pdf_estrutura_pedagogica_url' => $activity['pdf_estrutura_pedagogica_url'] ?? null,
                'material_apoio_url' => $activity['material_apoio_url'] ?? null,
                'criado_em' => $activity['criado_em'] ?? null,
                'atualizado_em' => $activity['atualizado_em'] ?? null,
                'criado_por' => $activity['criado_por'] ?? null,
                'bloqueada' => $bloqueada,
            ];
            if ($hasAeeColSingle) {
                $activityOut['aee'] = (int)($activity['aee'] ?? 0) === 1;
            }
            if ($hasEtapasColSingle && isset($activity['etapas'])) {
                $etapasRaw = $activity['etapas'];
                $etapasArray = is_string($etapasRaw) ? (json_decode($etapasRaw, true) ?: []) : (is_array($etapasRaw) ? $etapasRaw : []);
                $activityOut['etapas'] = array_values(array_filter($etapasArray, 'is_string'));
            }
            json_response_act(200, [
                'error' => false,
                'activity' => $activityOut
            ]);
        } else {
            // Listar todas as atividades (com filtros opcionais)
            $tipo = $_GET['tipo'] ?? null;
            $etapa = $_GET['etapa'] ?? null;
            $search = $_GET['search'] ?? null;

            // Selecionar campos novos e antigos para compatibilidade
            $hasAeeCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'aee'")->rowCount() > 0;
            $hasEtapasCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'etapas'")->rowCount() > 0;
            $sql = "SELECT 
                id,
                COALESCE(nome_atividade, titulo) as nome_atividade,
                descricao,
                tipo,
                etapa,
                " . ($hasEtapasCol ? "COALESCE(etapas, '[]') as etapas," : "") . "
                anos_escolares,
                COALESCE(eixos_bncc, JSON_ARRAY(id_eixo)) as eixos_bncc,
                COALESCE(disciplinas_transversais, '[]') as disciplinas_transversais,
                COALESCE(habilidades_ids, '[]') as habilidades_ids,
                duracao,
                " . ($hasAeeCol ? "COALESCE(aee, 0) as aee," : "") . "
                COALESCE(nivel_dificuldade, 
                    CASE 
                        WHEN dificuldade = 'facil' THEN 'Fácil'
                        WHEN dificuldade = 'medio' THEN 'Médio'
                        WHEN dificuldade = 'dificil' THEN 'Difícil'
                        ELSE 'Médio'
                    END
                ) as nivel_dificuldade,
                COALESCE(thumbnail_url, url_miniatura) as thumbnail_url,
                COALESCE(video_url, url_video) as video_url,
                COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                material_apoio_url,
                COALESCE(criado_em, data_criacao) as criado_em,
                atualizado_em,
                criado_por,
                titulo,
                dificuldade,
                url_miniatura,
                url_video,
                url_documento,
                data_criacao,
                id_eixo,
                COALESCE(bloqueada, 0) as bloqueada
            FROM atividades WHERE 1=1";
            $params = [];

            if ($tipo) {
                // Compatibilidade: aceitar tanto "Plugada" quanto "plugada"
                $sql .= " AND (tipo = ? OR LOWER(tipo) = LOWER(?))";
                $params[] = $tipo;
                $params[] = $tipo;
            }

            if ($etapa) {
                if (strtolower($etapa) === 'aee') {
                    if ($hasAeeCol) {
                        $sql .= " AND COALESCE(aee, 0) = 1";
                    } else {
                        $sql .= " AND 1 = 0";
                    }
                } elseif ($hasEtapasCol) {
                    $sql .= " AND (etapa = ? OR JSON_CONTAINS(COALESCE(etapas, '[]'), ?) = 1)";
                    $params[] = $etapa;
                    $params[] = json_encode($etapa, JSON_UNESCAPED_UNICODE);
                } else {
                    $sql .= " AND etapa = ?";
                    $params[] = $etapa;
                }
            }

            if ($search) {
                // Compatibilidade: buscar também em titulo (campo antigo)
                $sql .= " AND (COALESCE(nome_atividade, titulo) LIKE ? OR descricao LIKE ?)";
                $searchTerm = "%{$search}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            // Ordenar por criado_em se existir, senão por data_criacao (compatibilidade)
            // Usar COALESCE apenas se ambos os campos existirem na query
            $sql .= " ORDER BY COALESCE(criado_em, data_criacao, NOW()) DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $activitiesData = [];
            foreach ($activities as $activity) {
                // Converter tipo para formato esperado (Plugada/Desplugada)
                $tipo = $activity['tipo'] ?? '';
                if (strtolower($tipo) === 'plugada') $tipo = 'Plugada';
                if (strtolower($tipo) === 'desplugada') $tipo = 'Desplugada';
                
                // Converter eixos_bncc (pode vir como JSON string ou já processado)
                $eixosBncc = [];
                if (isset($activity['eixos_bncc'])) {
                    if (is_string($activity['eixos_bncc'])) {
                        $decoded = json_decode($activity['eixos_bncc'], true);
                        $eixosBncc = is_array($decoded) ? $decoded : [];
                    } elseif (is_array($activity['eixos_bncc'])) {
                        $eixosBncc = $activity['eixos_bncc'];
                    }
                }
                
                // Converter anos_escolares (pode ser longtext antigo ou JSON)
                $anosEscolares = [];
                if (isset($activity['anos_escolares'])) {
                    if (is_string($activity['anos_escolares'])) {
                        $decoded = json_decode($activity['anos_escolares'], true);
                        $anosEscolares = is_array($decoded) ? $decoded : [];
                    } elseif (is_array($activity['anos_escolares'])) {
                        $anosEscolares = $activity['anos_escolares'];
                    }
                }
                
                // Converter disciplinas_transversais (JSON)
                $disciplinasTransversais = [];
                if (isset($activity['disciplinas_transversais'])) {
                    if (is_string($activity['disciplinas_transversais'])) {
                        $decoded = json_decode($activity['disciplinas_transversais'], true);
                        $disciplinasTransversais = is_array($decoded) ? $decoded : [];
                    } elseif (is_array($activity['disciplinas_transversais'])) {
                        $disciplinasTransversais = $activity['disciplinas_transversais'];
                    }
                }

                // Converter habilidades_ids (JSON)
                $habilidadesIds = [];
                if (isset($activity['habilidades_ids'])) {
                    if (is_string($activity['habilidades_ids'])) {
                        $decoded = json_decode($activity['habilidades_ids'], true);
                        $habilidadesIds = is_array($decoded) ? array_map('intval', array_filter($decoded, 'is_numeric')) : [];
                    } elseif (is_array($activity['habilidades_ids'])) {
                        $habilidadesIds = array_map('intval', array_filter($activity['habilidades_ids'], 'is_numeric'));
                    }
                }
                
                $item = [
                    'id' => $activity['id'],
                    'nome_atividade' => $activity['nome_atividade'] ?? '',
                    'descricao' => $activity['descricao'] ?? null,
                    'tipo' => $tipo,
                    'etapa' => $activity['etapa'] ?? null,
                    'anos_escolares' => $anosEscolares,
                    'eixos_bncc' => $eixosBncc,
                    'disciplinas_transversais' => $disciplinasTransversais,
                    'habilidades_ids' => $habilidadesIds,
                    'duracao' => $activity['duracao'] ?? null,
                    'thumbnail_url' => $activity['thumbnail_url'] ?? null,
                    'video_url' => $activity['video_url'] ?? null,
                    'pdf_estrutura_pedagogica_url' => $activity['pdf_estrutura_pedagogica_url'] ?? null,
                    'material_apoio_url' => $activity['material_apoio_url'] ?? null,
                    'criado_em' => $activity['criado_em'] ?? null,
                    'atualizado_em' => $activity['atualizado_em'] ?? null,
                    'bloqueada' => (int)($activity['bloqueada'] ?? 0) === 1,
                ];
                if ($hasAeeCol) {
                    $item['aee'] = (int)($activity['aee'] ?? 0) === 1;
                }
                if ($hasEtapasCol && isset($activity['etapas'])) {
                    $etapasRaw = $activity['etapas'];
                    $item['etapas'] = is_string($etapasRaw) ? (json_decode($etapasRaw, true) ?: []) : (is_array($etapasRaw) ? $etapasRaw : []);
                }
                $activitiesData[] = $item;
            }

            // Perfil "Teste Professor": liberar apenas as atividades da lista fixa (EI até 5º ano); demais bloqueadas
            if ($currentUser && strtolower((string)($currentUser['role'] ?? '')) === 'teste_professor') {
                $activitiesData = apply_teste_professor_access($pdo, $activitiesData);
            }

            json_response_act(200, [
                'error' => false,
                'activities' => $activitiesData,
                'count' => count($activitiesData)
            ]);
        }
    }

    if ($method === 'POST') {
        $data = read_json_body();

        $id = trim((string)($data['id'] ?? ''));
        $nomeAtividade = trim((string)($data['nome_atividade'] ?? ''));
        $descricao = isset($data['descricao']) && trim((string)$data['descricao']) !== '' 
            ? trim((string)$data['descricao']) 
            : null;
        $tipo = (string)($data['tipo'] ?? '');
        $etapa = (string)($data['etapa'] ?? '');
        // etapas: para AEE, array de etapas (ex.: ["Educação Infantil", "Anos Iniciais", "Anos Finais"])
        $etapasArray = isset($data['etapas']) && is_array($data['etapas'])
            ? array_values(array_filter(array_map('trim', $data['etapas']), function ($v) { return $v !== ''; }))
            : [];
        $allowedEtapasList = ['Educação Infantil', 'Anos Iniciais', 'Anos Finais'];
        $etapasArray = array_values(array_intersect($etapasArray, $allowedEtapasList));
        $aee = !empty($data['aee']);
        if ($aee && !empty($etapasArray) && $etapa === '') {
            $etapa = $etapasArray[0];
        }
        if ($aee && !empty($etapasArray) && !in_array($etapa, $etapasArray, true)) {
            $etapa = $etapasArray[0];
        }
        $etapasJson = !empty($etapasArray) ? json_encode($etapasArray, JSON_UNESCAPED_UNICODE) : null;
        // Para Educação Infantil (não AEE), anos_escolares = [].
        // Para AEE ou outras etapas, usar o que o usuário enviou; se for AEE+Educação Infantil sem séries marcadas,
        // gravar explicitamente "Educação Infantil" em anos_escolares para facilitar relatórios e trilhas.
        $userAnosEscolares = isset($data['anos_escolares']) && is_array($data['anos_escolares'])
            ? array_values(array_filter($data['anos_escolares'], function ($v) { return trim((string)$v) !== ''; }))
            : [];
        if ($etapa === 'Educação Infantil' && !$aee) {
            // Educação Infantil "geral": não há sub-séries, manter array vazio
            $anosEscolares = '[]';
        } elseif (!empty($userAnosEscolares)) {
            // Respeitar séries selecionadas pelo usuário (inclui AEE)
            $anosEscolares = json_encode($userAnosEscolares, JSON_UNESCAPED_UNICODE);
        } elseif ($etapa === 'Educação Infantil' && $aee) {
            // Caso especial: AEE para Educação Infantil sem séries marcadas
            // Registrar explicitamente a etapa para futuras consultas/relatórios
            $anosEscolares = json_encode(['Educação Infantil'], JSON_UNESCAPED_UNICODE);
        } else {
            $anosEscolares = '[]';
        }
        // habilidades_ids: se enviado, derivar eixos_bncc a partir de curriculo_habilidades
        $habilidadesIds = [];
        if (isset($data['habilidades_ids']) && is_array($data['habilidades_ids'])) {
            $habilidadesIds = array_values(array_map('intval', array_filter($data['habilidades_ids'], 'is_numeric')));
        }
        $eixosBnccArray = [];
        if (!empty($habilidadesIds)) {
            $tablesExist = $pdo->query("SHOW TABLES LIKE 'curriculo_habilidades'")->rowCount() > 0;
            if ($tablesExist) {
                $eixosBnccArray = eixos_from_habilidades_ids($pdo, $habilidadesIds);
            }
        }
        // Se houver habilidades, derivar também anos_escolares para que trilhas por ano funcionem automaticamente
        if (!empty($habilidadesIds) && $etapa !== 'Educação Infantil') {
            $tablesEtapasExist = $pdo->query("SHOW TABLES LIKE 'curriculo_etapas_ensino'")->rowCount() > 0;
            if ($tablesExist && $tablesEtapasExist) {
                $anosDerivados = anos_escolares_from_habilidades_ids($pdo, $habilidadesIds);
                // remover nomes genéricos que não são anos (ex.: "Ensino Médio", "Educação Infantil")
                $anosDerivados = array_values(array_filter($anosDerivados, function ($n) {
                    return preg_match('/\\d+º\\s+Ano/u', (string)$n) === 1 || (string)$n === 'AEE';
                }));
                if (!empty($anosDerivados)) {
                    $anosEscolares = json_encode($anosDerivados, JSON_UNESCAPED_UNICODE);
                }
            }
        }
        if (empty($eixosBnccArray) && isset($data['eixos_bncc']) && is_array($data['eixos_bncc'])) {
            $eixosBnccArray = $data['eixos_bncc'];
        }
        // eixos_bncc sempre deve ser um JSON array, mesmo que vazio
        $eixosBncc = json_encode($eixosBnccArray, JSON_UNESCAPED_UNICODE);
        $habilidadesIdsJson = empty($habilidadesIds) ? null : json_encode($habilidadesIds, JSON_UNESCAPED_UNICODE);
        // disciplinas_transversais sempre deve ser um JSON array, mesmo que vazio
        $disciplinasTransversais = isset($data['disciplinas_transversais']) && is_array($data['disciplinas_transversais'])
            ? json_encode($data['disciplinas_transversais'], JSON_UNESCAPED_UNICODE) 
            : '[]'; // Array vazio ao invés de null
        $duracao = isset($data['duracao']) && trim((string)$data['duracao']) !== '' 
            ? trim((string)$data['duracao']) 
            : null;
        $thumbnailUrl = isset($data['thumbnail_url']) && trim((string)$data['thumbnail_url']) !== '' 
            ? trim((string)$data['thumbnail_url']) 
            : null;
        $videoUrl = trim((string)($data['video_url'] ?? ''));
        $pdfEstruturaUrl = isset($data['pdf_estrutura_pedagogica_url']) && trim((string)$data['pdf_estrutura_pedagogica_url']) !== '' 
            ? trim((string)$data['pdf_estrutura_pedagogica_url']) 
            : null;
        $materialApoioUrl = isset($data['material_apoio_url']) && trim((string)$data['material_apoio_url']) !== '' 
            ? trim((string)$data['material_apoio_url']) 
            : null;
        $bloqueada = !empty($data['bloqueada']);

        // Validações (video_url não obrigatório quando atividade é bloqueada)
        $missingFields = [];
        if (empty($id)) $missingFields[] = 'id';
        if (empty($nomeAtividade)) $missingFields[] = 'nome_atividade';
        if (empty($tipo)) $missingFields[] = 'tipo';
        if (empty($etapa)) $missingFields[] = 'etapa';
        if (empty($videoUrl) && !$bloqueada) $missingFields[] = 'video_url';
        
        if (!empty($missingFields)) {
            json_response_act(400, [
                'error' => true,
                'message' => 'Campos obrigatórios faltando: ' . implode(', ', $missingFields),
                'missing_fields' => $missingFields
            ]);
        }

        $allowedTipos = ['Plugada', 'Desplugada'];
        if (!in_array($tipo, $allowedTipos, true)) {
            json_response_act(400, ['error' => true, 'message' => 'Tipo inválido. Use: Plugada ou Desplugada']);
        }

        $allowedEtapas = ['Educação Infantil', 'Anos Iniciais', 'Anos Finais'];
        if (!in_array($etapa, $allowedEtapas, true)) {
            json_response_act(400, ['error' => true, 'message' => 'Etapa inválida']);
        }

        // Verificar se já existe
        $checkStmt = $pdo->prepare("SELECT id FROM atividades WHERE id = ?");
        $checkStmt->execute([$id]);
        if ($checkStmt->fetch()) {
            json_response_act(409, ['error' => true, 'message' => 'Atividade com este ID já existe']);
        }

        // Criar atividade (habilidades_ids: coluna opcional; bloqueada: coluna opcional; etapas: AEE múltiplas etapas)
        try {
            $hasBloqueadaCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'bloqueada'")->rowCount() > 0;
            $hasAeeColInsert = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'aee'")->rowCount() > 0;
            $hasEtapasColInsert = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'etapas'")->rowCount() > 0;
            $bloqueadaVal = $bloqueada ? 1 : 0;
            $aeeVal = $aee ? 1 : 0;
            $colsEtapas = $hasEtapasColInsert ? ', etapas' : '';
            $valsEtapas = $hasEtapasColInsert ? ', ?' : '';
            $hasHabilidadesCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'habilidades_ids'")->rowCount() > 0;
            if ($hasHabilidadesCol && $hasBloqueadaCol) {
                $colsAee = $hasAeeColInsert ? ', aee' : '';
                $valsAee = $hasAeeColInsert ? ', ?' : '';
                $stmt = $pdo->prepare("
                    INSERT INTO atividades (
                        id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, disciplinas_transversais, habilidades_ids,
                        duracao, nivel_dificuldade, thumbnail_url, video_url,
                        pdf_estrutura_pedagogica_url, material_apoio_url, bloqueada{$colsAee}{$colsEtapas}, criado_por
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?{$valsAee}{$valsEtapas}, ?)
                ");
                $params = [
                    $id, $nomeAtividade, $descricao, $tipo, $etapa, $anosEscolares, $eixosBncc, $disciplinasTransversais, $habilidadesIdsJson,
                    $duracao, 'Médio', $thumbnailUrl, $videoUrl ?: null,
                    $pdfEstruturaUrl, $materialApoioUrl, $bloqueadaVal
                ];
                if ($hasAeeColInsert) $params[] = $aeeVal;
                if ($hasEtapasColInsert) $params[] = $etapasJson;
                $params[] = $currentUser['id'];
            } elseif ($hasHabilidadesCol) {
                $colsAee = $hasAeeColInsert ? ', aee' : '';
                $valsAee = $hasAeeColInsert ? ', ?' : '';
                $stmt = $pdo->prepare("
                    INSERT INTO atividades (
                        id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, disciplinas_transversais, habilidades_ids,
                        duracao, nivel_dificuldade, thumbnail_url, video_url,
                        pdf_estrutura_pedagogica_url, material_apoio_url{$colsAee}{$colsEtapas}, criado_por
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?{$valsAee}{$valsEtapas}, ?)
                ");
                $params = [
                    $id, $nomeAtividade, $descricao, $tipo, $etapa, $anosEscolares, $eixosBncc, $disciplinasTransversais, $habilidadesIdsJson,
                    $duracao, 'Médio', $thumbnailUrl, $videoUrl ?: null,
                    $pdfEstruturaUrl, $materialApoioUrl
                ];
                if ($hasAeeColInsert) $params[] = $aeeVal;
                if ($hasEtapasColInsert) $params[] = $etapasJson;
                $params[] = $currentUser['id'];
            } elseif ($hasBloqueadaCol) {
                $colsAee = $hasAeeColInsert ? ', aee' : '';
                $valsAee = $hasAeeColInsert ? ', ?' : '';
                $stmt = $pdo->prepare("
                    INSERT INTO atividades (
                        id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, disciplinas_transversais,
                        duracao, nivel_dificuldade, thumbnail_url, video_url,
                        pdf_estrutura_pedagogica_url, material_apoio_url, bloqueada{$colsAee}{$colsEtapas}, criado_por
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?{$valsAee}{$valsEtapas}, ?)
                ");
                $params = [
                    $id, $nomeAtividade, $descricao, $tipo, $etapa, $anosEscolares, $eixosBncc, $disciplinasTransversais,
                    $duracao, 'Médio', $thumbnailUrl, $videoUrl ?: null,
                    $pdfEstruturaUrl, $materialApoioUrl, $bloqueadaVal
                ];
                if ($hasAeeColInsert) $params[] = $aeeVal;
                if ($hasEtapasColInsert) $params[] = $etapasJson;
                $params[] = $currentUser['id'];
            } else {
                $colsAee = $hasAeeColInsert ? ', aee' : '';
                $valsAee = $hasAeeColInsert ? ', ?' : '';
                $stmt = $pdo->prepare("
                    INSERT INTO atividades (
                        id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, disciplinas_transversais,
                        duracao, nivel_dificuldade, thumbnail_url, video_url,
                        pdf_estrutura_pedagogica_url, material_apoio_url{$colsAee}{$colsEtapas}, criado_por
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?{$valsAee}{$valsEtapas}, ?)
                ");
                $params = [
                    $id, $nomeAtividade, $descricao, $tipo, $etapa, $anosEscolares, $eixosBncc, $disciplinasTransversais,
                    $duracao, 'Médio', $thumbnailUrl, $videoUrl ?: null,
                    $pdfEstruturaUrl, $materialApoioUrl
                ];
                if ($hasAeeColInsert) $params[] = $aeeVal;
                if ($hasEtapasColInsert) $params[] = $etapasJson;
                $params[] = $currentUser['id'];
            }
            $stmt->execute($params);
        } catch (PDOException $e) {
            error_log('Erro no INSERT: ' . $e->getMessage());
            throw $e; // Re-throw para ser capturado pelo catch externo
        }

        json_response_act(201, [
            'error' => false,
            'message' => 'Atividade criada com sucesso',
            'activity' => [
                'id' => $id,
                'nome_atividade' => $nomeAtividade
            ]
        ]);
    }

    if ($method === 'PUT') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));

        if (empty($id)) {
            json_response_act(400, ['error' => true, 'message' => 'ID da atividade é obrigatório']);
        }

        // Verificar se existe
        $checkStmt = $pdo->prepare("SELECT id FROM atividades WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            json_response_act(404, ['error' => true, 'message' => 'Atividade não encontrada']);
        }

        $updates = [];
        $params = [];

        if (isset($data['nome_atividade'])) {
            $updates[] = "nome_atividade = ?";
            $params[] = trim((string)$data['nome_atividade']);
        }
        if (isset($data['descricao'])) {
            $updates[] = "descricao = ?";
            $params[] = trim((string)$data['descricao']);
        }
        if (isset($data['tipo'])) {
            $updates[] = "tipo = ?";
            $params[] = (string)$data['tipo'];
        }
        if (isset($data['etapa'])) {
            $updates[] = "etapa = ?";
            $params[] = (string)$data['etapa'];
        }
        if (array_key_exists('etapas', $data)) {
            $hasEtapasColPut = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'etapas'")->rowCount() > 0;
            if ($hasEtapasColPut) {
                $putEtapas = is_array($data['etapas']) ? array_values(array_filter(array_map('trim', $data['etapas']), function ($v) { return $v !== ''; })) : [];
                $allowedPut = ['Educação Infantil', 'Anos Iniciais', 'Anos Finais'];
                $putEtapas = array_values(array_intersect($putEtapas, $allowedPut));
                $updates[] = "etapas = ?";
                $params[] = empty($putEtapas) ? null : json_encode($putEtapas, JSON_UNESCAPED_UNICODE);
            }
        }
        if (isset($data['anos_escolares'])) {
            $anosPutArray = is_array($data['anos_escolares'])
                ? array_values(array_filter($data['anos_escolares'], function ($v) { return trim((string)$v) !== ''; }))
                : [];
            $etapaPut = isset($data['etapa']) ? (string)$data['etapa'] : '';
            $isAeePut = !empty($data['aee']);
            // Caso especial: AEE + Educação Infantil sem séries marcadas → gravar "Educação Infantil"
            if ($etapaPut === 'Educação Infantil' && $isAeePut && empty($anosPutArray)) {
                $anosPutArray = ['Educação Infantil'];
            }
            $updates[] = "anos_escolares = ?";
            $params[] = !empty($anosPutArray)
                ? json_encode($anosPutArray, JSON_UNESCAPED_UNICODE)
                : '[]';
        }
        if (isset($data['eixos_bncc'])) {
            $updates[] = "eixos_bncc = ?";
            $params[] = is_array($data['eixos_bncc']) 
                ? json_encode($data['eixos_bncc'], JSON_UNESCAPED_UNICODE) 
                : '[]';
        }
        if (isset($data['disciplinas_transversais'])) {
            $updates[] = "disciplinas_transversais = ?";
            $params[] = is_array($data['disciplinas_transversais']) 
                ? json_encode($data['disciplinas_transversais'], JSON_UNESCAPED_UNICODE) 
                : '[]';
        }
        // habilidades_ids: ao enviar, derivar eixos_bncc a partir de curriculo_habilidades
        if (array_key_exists('habilidades_ids', $data)) {
            $putHabilidadesIds = is_array($data['habilidades_ids']) 
                ? array_values(array_map('intval', array_filter($data['habilidades_ids'], 'is_numeric'))) 
                : [];
            $putEixosBncc = [];
            if (!empty($putHabilidadesIds)) {
                $tablesExist = $pdo->query("SHOW TABLES LIKE 'curriculo_habilidades'")->rowCount() > 0;
                if ($tablesExist) {
                    $putEixosBncc = eixos_from_habilidades_ids($pdo, $putHabilidadesIds);
                }
            }
            $updates[] = "eixos_bncc = ?";
            $params[] = json_encode($putEixosBncc, JSON_UNESCAPED_UNICODE);
            $hasHabilidadesCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'habilidades_ids'")->rowCount() > 0;
            if ($hasHabilidadesCol) {
                $updates[] = "habilidades_ids = ?";
                $params[] = empty($putHabilidadesIds) ? null : json_encode($putHabilidadesIds, JSON_UNESCAPED_UNICODE);
            }
            // Também derivar anos_escolares quando habilidades forem informadas (para trilhas por ano)
            $hasAnosEscolaresCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'anos_escolares'")->rowCount() > 0;
            $tablesEtapasExist = $pdo->query("SHOW TABLES LIKE 'curriculo_etapas_ensino'")->rowCount() > 0;
            if ($hasAnosEscolaresCol && !empty($putHabilidadesIds) && $tablesExist && $tablesEtapasExist) {
                $anosDerivados = anos_escolares_from_habilidades_ids($pdo, $putHabilidadesIds);
                $anosDerivados = array_values(array_filter($anosDerivados, function ($n) {
                    return preg_match('/\\d+º\\s+Ano/u', (string)$n) === 1 || (string)$n === 'AEE';
                }));
                if (!empty($anosDerivados)) {
                    $updates[] = "anos_escolares = ?";
                    $params[] = json_encode($anosDerivados, JSON_UNESCAPED_UNICODE);
                }
            }
        }
        if (isset($data['duracao'])) {
            $updates[] = "duracao = ?";
            $params[] = trim((string)$data['duracao']) ?: null;
        }
        if (isset($data['thumbnail_url'])) {
            $updates[] = "thumbnail_url = ?";
            $params[] = trim((string)$data['thumbnail_url']) ?: null;
        }
        if (isset($data['video_url'])) {
            $updates[] = "video_url = ?";
            $params[] = trim((string)$data['video_url']);
        }
        if (isset($data['pdf_estrutura_pedagogica_url'])) {
            $updates[] = "pdf_estrutura_pedagogica_url = ?";
            $params[] = trim((string)$data['pdf_estrutura_pedagogica_url']) ?: null;
        }
        if (isset($data['material_apoio_url'])) {
            $updates[] = "material_apoio_url = ?";
            $params[] = trim((string)$data['material_apoio_url']) ?: null;
        }
        if (array_key_exists('bloqueada', $data)) {
            $hasBloqueadaCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'bloqueada'")->rowCount() > 0;
            if ($hasBloqueadaCol) {
                $updates[] = "bloqueada = ?";
                $params[] = !empty($data['bloqueada']) ? 1 : 0;
            }
        }
        if (array_key_exists('aee', $data)) {
            $hasAeeColPut = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'aee'")->rowCount() > 0;
            if ($hasAeeColPut) {
                $updates[] = "aee = ?";
                $params[] = !empty($data['aee']) ? 1 : 0;
            }
        }

        if (empty($updates)) {
            json_response_act(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }

        $params[] = $id;
        $sql = "UPDATE atividades SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        json_response_act(200, [
            'error' => false,
            'message' => 'Atividade atualizada com sucesso'
        ]);
    }

    if ($method === 'DELETE') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));

        if (empty($id)) {
            json_response_act(400, ['error' => true, 'message' => 'ID da atividade é obrigatório']);
        }

        $stmt = $pdo->prepare("DELETE FROM atividades WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            json_response_act(200, [
                'error' => false,
                'message' => 'Atividade deletada com sucesso'
            ]);
        } else {
            json_response_act(404, ['error' => true, 'message' => 'Atividade não encontrada']);
        }
    }

    json_response_act(405, ['error' => true, 'message' => 'Método não permitido']);

} catch (PDOException $e) {
    $errorMsg = $e->getMessage();
    $errorCode = $e->getCode();
    error_log('Erro ao gerenciar atividades: ' . $errorMsg);
    error_log('Código do erro: ' . $errorCode);
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    // Verificar se é erro de coluna não encontrada
    if (strpos($errorMsg, "Unknown column") !== false) {
        json_response_act(500, [
            'error' => true,
            'message' => 'Estrutura da tabela incompatível. Execute o script SQL: migrate-atividades-old-to-new.sql',
            'details' => $errorMsg
        ]);
    } 
    // Verificar se é erro de SQL syntax
    elseif (strpos($errorMsg, "SQLSTATE") !== false || strpos($errorMsg, "SQL syntax") !== false) {
        json_response_act(500, [
            'error' => true,
            'message' => 'Erro de SQL: ' . $errorMsg,
            'details' => 'Verifique a estrutura da tabela atividades no banco de dados'
        ]);
    } 
    // Outros erros de banco
    else {
        json_response_act(500, [
            'error' => true,
            'message' => 'Erro ao gerenciar atividades no banco de dados',
            'details' => $errorMsg,
            'code' => $errorCode
        ]);
    }
} catch (Exception $e) {
    $errorMsg = $e->getMessage();
    error_log('Erro geral: ' . $errorMsg);
    error_log('Stack trace: ' . $e->getTraceAsString());
    json_response_act(500, [
        'error' => true,
        'message' => 'Erro inesperado: ' . $errorMsg
    ]);
}
