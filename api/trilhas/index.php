<?php
/**
 * API de Trilhas Pedagógicas
 * CRUD completo para trilhas que agrupam atividades
 * 
 * GET    /api/trilhas/index.php -> lista trilhas
 * GET    /api/trilhas/index.php?id=xxx -> detalhes da trilha
 * GET    /api/trilhas/index.php?tipo=eixo_bncc -> trilhas por tipo
 * POST   /api/trilhas/index.php -> cria trilha (requer root)
 * PUT    /api/trilhas/index.php -> atualiza trilha (requer root)
 * DELETE /api/trilhas/index.php -> deleta trilha (requer root)
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

ob_start();

$trilhas_json_sent = false;

register_shutdown_function(function (): void {
    global $trilhas_json_sent;
    $level = ob_get_level();
    $out = $level > 0 ? ob_get_clean() : '';
    $trimmed = $out !== false && $out !== '' ? trim((string)$out) : '';
    $is_json = $trimmed !== '' && strpos($trimmed, '{') === 0;
    if (!$trilhas_json_sent && !$is_json) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
        }
        echo json_encode([
            'error' => true,
            'message' => 'Erro interno do servidor',
            'details' => 'A API retornou uma resposta inesperada. Verifique os logs do servidor.'
        ], JSON_UNESCAPED_UNICODE);
    } elseif ($out !== false && $out !== '' && $is_json) {
        echo $out;
    }
});

require_once __DIR__ . '/../config/cors.php';

// Responder ao preflight OPTIONS aqui (após CORS) e marcar resposta enviada
// para o shutdown não interpretar como erro e enviar 500
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    $trilhas_json_sent = true;
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response_trilha(int $status, array $payload): void {
    global $trilhas_json_sent;
    $trilhas_json_sent = true;
    if (ob_get_level() > 0) {
        ob_clean();
    }
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
        json_response_trilha(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

/**
 * Regra do perfil "teste_professor":
 * - em uma trilha, o usuário vê todas as atividades
 * - apenas 2 por etapa/ano ficam liberadas; o restante aparece como bloqueada
 * - atividades já bloqueadas no banco continuam bloqueadas e não contam no limite
 *
 * @param array<int, array<string,mixed>> $atividadesData
 * @param int $limitPerStage
 * @return array<int, array<string,mixed>>
 */
function apply_teste_professor_limit_trilha(array $atividadesData, int $limitPerStage = 2): array {
    $stageCounts = [];
    foreach ($atividadesData as &$a) {
        $isBlocked = !empty($a['bloqueada']);
        if ($isBlocked) {
            continue;
        }

        $etapa = (string)($a['etapa'] ?? '');
        $anos = $a['anos_escolares'] ?? [];
        if (!is_array($anos)) {
            $anos = [];
        }

        $preferred = ['ei','1ano','2ano','3ano','4ano','5ano','6ano','7ano','8ano','9ano','aee'];
        $stageKey = '';
        foreach ($preferred as $id) {
            if (in_array($id, $anos, true)) {
                $stageKey = $id;
                break;
            }
        }
        if ($stageKey === '') {
            $map = [
                'Educação Infantil' => 'ei',
                '1º Ano' => '1ano', '2º Ano' => '2ano', '3º Ano' => '3ano', '4º Ano' => '4ano', '5º Ano' => '5ano',
                '6º Ano' => '6ano', '7º Ano' => '7ano', '8º Ano' => '8ano', '9º Ano' => '9ano',
                'AEE' => 'aee',
            ];
            $stageKey = $map[$etapa] ?? ($etapa !== '' ? $etapa : 'geral');
        }

        if (!isset($stageCounts[$stageKey])) {
            $stageCounts[$stageKey] = 0;
        }
        if ($stageCounts[$stageKey] < $limitPerStage) {
            $stageCounts[$stageKey] += 1;
            continue;
        }
        $a['bloqueada'] = true;
    }
    unset($a);
    return $atividadesData;
}

/**
 * Whitelist fixa (fallback) do Teste Professor por NOME (compatibilidade).
 * Usada apenas quando a tabela teste_professor_atividades_liberadas ainda não existe.
 */
function get_teste_professor_whitelist_names_trilha(): array {
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
 * Lista configurável (via banco) de atividades liberadas para "teste_professor".
 * @return array{ids: array<int,string>, table_exists: bool}
 */
function get_teste_professor_allowed_ids_trilha(PDO $pdo): array {
    try {
        $tableExists = ($pdo->query("SHOW TABLES LIKE 'teste_professor_atividades_liberadas'")->rowCount() ?? 0) > 0;
        if (!$tableExists) return ['ids' => [], 'table_exists' => false];
        $stmt = $pdo->query("SELECT activity_id FROM teste_professor_atividades_liberadas");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        $ids = [];
        foreach ($rows as $r) {
            $id = trim((string)($r['activity_id'] ?? ''));
            if ($id !== '') $ids[] = $id;
        }
        $ids = array_values(array_keys(array_fill_keys($ids, true)));
        return ['ids' => $ids, 'table_exists' => true];
    } catch (Throwable $e) {
        return ['ids' => [], 'table_exists' => false];
    }
}

/**
 * Regra do perfil "teste_professor" dentro de trilhas:
 * - vê TODAS as atividades: liberadas como bloqueada=false, demais como bloqueada=true
 * - ordenação: liberadas na frente do grid, bloqueadas no final
 */
function apply_teste_professor_access_trilha(PDO $pdo, array $atividadesData): array {
    $cfg = get_teste_professor_allowed_ids_trilha($pdo);
    $tableExists = (bool)($cfg['table_exists'] ?? false);

    $allowedIdSet = [];
    if ($tableExists) {
        foreach (($cfg['ids'] ?? []) as $id) {
            $allowedIdSet[$id] = true;
        }
    }

    $whitelistNormalized = [];
    if (!$tableExists) {
        foreach (get_teste_professor_whitelist_names_trilha() as $nome) {
            $whitelistNormalized[mb_strtolower(trim((string)$nome), 'UTF-8')] = true;
        }
    }

    $out = [];
    foreach ($atividadesData as $a) {
        $id = trim((string)($a['id'] ?? ''));
        $nome = trim((string)($a['nome_atividade'] ?? ''));

        $allowed = false;
        if ($tableExists) {
            $allowed = $id !== '' && isset($allowedIdSet[$id]);
        } else {
            $allowed = $nome !== '' && isset($whitelistNormalized[mb_strtolower($nome, 'UTF-8')]);
        }
        $a['bloqueada'] = !$allowed;
        $out[] = $a;
    }

    // Ordenar: liberadas na frente, bloqueadas no final
    usort($out, function ($x, $y) {
        $blockX = !empty($x['bloqueada']);
        $blockY = !empty($y['bloqueada']);
        if ($blockX === $blockY) return 0;
        return $blockX ? 1 : -1;
    });
    return $out;
}

/**
 * Retorna atividades que atendem a TODOS os critérios de agrupamento (AND).
 * @param PDO $pdo
 * @param array<array{tipo:string,valor:string}> $criterios
 * @return array
 */
function atividades_por_criterios(PDO $pdo, array $criterios): array {
    if (empty($criterios)) {
        return [];
    }
    $hasEtapasCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'etapas'")->rowCount() > 0;
    $conditions = [];
    $params = [];
    $eixoNameToId = [
        'Pensamento Computacional' => 'pensamento-computacional',
        'Mundo Digital' => 'mundo-digital',
        'Cultura Digital' => 'cultura-digital',
    ];
    $anoEscolarMap = [
        'Educação Infantil' => 'ei',
        '1º Ano' => '1ano', '2º Ano' => '2ano', '3º Ano' => '3ano', '4º Ano' => '4ano', '5º Ano' => '5ano',
        '6º Ano' => '6ano', '7º Ano' => '7ano', '8º Ano' => '8ano', '9º Ano' => '9ano',
        'AEE' => 'aee',
    ];
    foreach ($criterios as $c) {
        $tipo = $c['tipo'] ?? '';
        $valor = trim((string)($c['valor'] ?? ''));
        if ($valor === '') {
            continue;
        }
        if ($tipo === 'eixo_bncc') {
            $eixoId = $eixoNameToId[$valor] ?? null;
            $valorJson = json_encode($valor);
            if ($eixoId) {
                $eixoIdJson = json_encode($eixoId);
                $conditions[] = "(JSON_CONTAINS(COALESCE(eixos_bncc, '[]'), ?) OR JSON_CONTAINS(COALESCE(eixos_bncc, '[]'), ?))";
                $params[] = $valorJson;
                $params[] = $eixoIdJson;
            } else {
                $conditions[] = "JSON_CONTAINS(COALESCE(eixos_bncc, '[]'), ?)";
                $params[] = $valorJson;
            }
        } elseif ($tipo === 'etapa') {
            if (in_array($valor, ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', 'AEE'], true)) {
                $anoId = $anoEscolarMap[$valor] ?? $valor;
                $variants = [json_encode($anoId), json_encode($valor), json_encode(str_replace('º', '°', $valor)), json_encode(preg_replace('/\s*[º°]\s*/u', ' ', $valor))];
                $orConds = [];
                foreach ($variants as $v) {
                    $orConds[] = "(IF(JSON_VALID(anos_escolares), JSON_CONTAINS(anos_escolares, ?), 0) = 1 OR COALESCE(anos_escolares, '') LIKE ?)";
                    $params[] = $v;
                    $decoded = json_decode($v, true);
                    $params[] = '%' . (is_string($decoded) ? $decoded : '') . '%';
                }
                $conditions[] = '(' . implode(' OR ', $orConds) . ')';
            } elseif ($valor === 'Anos Iniciais') {
                $conds = ["etapa = ?"];
                $params[] = $valor;
                if ($hasEtapasCol) {
                    $conds[] = "JSON_CONTAINS(COALESCE(etapas, '[]'), ?) = 1";
                    $params[] = json_encode($valor, JSON_UNESCAPED_UNICODE);
                }
                $anosIniciaisId = ['1ano', '2ano', '3ano', '4ano', '5ano'];
                $anosIniciaisNome = ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];
                $anosIniciaisNomeAlt = ['1° Ano', '2° Ano', '3° Ano', '4° Ano', '5° Ano'];
                $anosIniciaisNomeSem = ['1 Ano', '2 Ano', '3 Ano', '4 Ano', '5 Ano'];
                foreach (array_merge($anosIniciaisId, $anosIniciaisNome, $anosIniciaisNomeAlt, $anosIniciaisNomeSem) as $a) {
                    $conds[] = "(IF(JSON_VALID(anos_escolares), JSON_CONTAINS(anos_escolares, ?), 0) = 1 OR COALESCE(anos_escolares, '') LIKE ?)";
                    $params[] = json_encode($a);
                    $params[] = '%' . $a . '%';
                }
                $conditions[] = '(' . implode(' OR ', $conds) . ')';
            } elseif ($valor === 'Anos Finais') {
                $conds = ["etapa = ?"];
                $params[] = $valor;
                $anosFinaisId = ['6ano', '7ano', '8ano', '9ano'];
                $anosFinaisNome = ['6º Ano', '7º Ano', '8º Ano', '9º Ano'];
                $anosFinaisNomeAlt = ['6° Ano', '7° Ano', '8° Ano', '9° Ano'];
                $anosFinaisNomeSem = ['6 Ano', '7 Ano', '8 Ano', '9 Ano'];
                foreach (array_merge($anosFinaisId, $anosFinaisNome, $anosFinaisNomeAlt, $anosFinaisNomeSem) as $a) {
                    $conds[] = "(IF(JSON_VALID(anos_escolares), JSON_CONTAINS(anos_escolares, ?), 0) = 1 OR COALESCE(anos_escolares, '') LIKE ?)";
                    $params[] = json_encode($a);
                    $params[] = '%' . $a . '%';
                }
                $conditions[] = '(' . implode(' OR ', $conds) . ')';
            } else {
                if ($hasEtapasCol && in_array($valor, ['Educação Infantil', 'Anos Iniciais', 'Anos Finais'], true)) {
                    $conditions[] = "(etapa = ? OR JSON_CONTAINS(COALESCE(etapas, '[]'), ?) = 1)";
                    $params[] = $valor;
                    $params[] = json_encode($valor, JSON_UNESCAPED_UNICODE);
                } else {
                    $conditions[] = "etapa = ?";
                    $params[] = $valor;
                }
            }
        } elseif ($tipo === 'ano_escolar') {
            $anoId = $anoEscolarMap[$valor] ?? $valor;
            $variants = [json_encode($anoId), json_encode($valor), json_encode(str_replace('º', '°', $valor)), json_encode(preg_replace('/\s*[º°]\s*/u', ' ', $valor))];
            $orConds = [];
            foreach ($variants as $v) {
                $orConds[] = "(IF(JSON_VALID(anos_escolares), JSON_CONTAINS(anos_escolares, ?), 0) = 1 OR COALESCE(anos_escolares, '') LIKE ?)";
                $params[] = $v;
                $decoded = json_decode($v, true);
                $params[] = '%' . (is_string($decoded) ? $decoded : '') . '%';
            }
            $conditions[] = '(' . implode(' OR ', $orConds) . ')';
        } elseif ($tipo === 'disciplina_transversal') {
            $disciplinaJson = json_encode($valor, JSON_UNESCAPED_UNICODE);
            $conditions[] = "(IF(JSON_VALID(disciplinas_transversais), JSON_CONTAINS(disciplinas_transversais, ?), 0) = 1 OR COALESCE(disciplinas_transversais, '') LIKE ?)";
            $params[] = $disciplinaJson;
            $params[] = '%' . $valor . '%';
        } elseif ($tipo === 'aee') {
            // AEE: priorizar coluna booleana aee=1, mas também
            // incluir atividades cujo anos_escolares contenham "AEE"/"aee"
            // para compatibilidade com dados antigos/importados.
            $hasAeeCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'aee'")->rowCount() > 0;
            if ($hasAeeCol) {
                $conditions[] = "(COALESCE(aee, 0) = 1 OR COALESCE(anos_escolares, '') LIKE '%AEE%' OR COALESCE(anos_escolares, '') LIKE '%\"aee\"%')";
            } else {
                $conditions[] = "(COALESCE(anos_escolares, '') LIKE '%AEE%' OR COALESCE(anos_escolares, '') LIKE '%\"aee\"%')";
            }
        }
    }
    if (empty($conditions)) {
        return [];
    }
    $where = implode(' AND ', $conditions);
    $sql = "SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
        COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
        material_apoio_url,
        COALESCE(bloqueada, 0) as bloqueada,
        COALESCE(aee, 0) as aee
        FROM atividades WHERE $where ORDER BY COALESCE(criado_em, data_criacao) DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$currentUser = null;
try {
    $currentUser = getCurrentUser();
} catch (Throwable $e) {
    error_log('trilhas getCurrentUser: ' . $e->getMessage());
}

// Verificar permissão apenas para operações de escrita
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    if (!$currentUser) {
        json_response_trilha(401, ['error' => true, 'message' => 'Não autenticado']);
    }
    
    // Apenas root pode gerenciar trilhas
    if (($currentUser['role'] ?? '') !== 'root') {
        json_response_trilha(403, ['error' => true, 'message' => 'Acesso negado. Apenas root pode gerenciar trilhas']);
    }
}

try {
    global $pdo;

    if ($method === 'GET' && isset($_GET['ping']) && $_GET['ping'] === '1') {
        json_response_trilha(200, ['error' => false, 'message' => 'API Trilhas OK', 'ping' => true]);
    }

    if (!isset($pdo)) {
        json_response_trilha(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
    }

    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        $tipo = $_GET['tipo'] ?? null;
        
        if ($id) {
            // Buscar trilha específica (criterios_agrupamento opcional; use SELECT * para compatibilidade)
            $stmt = $pdo->prepare("SELECT * FROM trilhas WHERE id = ?");
            $stmt->execute([$id]);
            $trilha = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$trilha) {
                json_response_trilha(404, ['error' => true, 'message' => 'Trilha não encontrada']);
            }
            
            $criteriosRaw = array_key_exists('criterios_agrupamento', $trilha) ? ($trilha['criterios_agrupamento'] ?? '[]') : '[]';
            $criterios = is_string($criteriosRaw) ? json_decode($criteriosRaw, true) : $criteriosRaw;
            if (!is_array($criterios)) {
                $criterios = [];
            }
            $criterios = array_filter($criterios, function ($c) {
                return !empty($c['tipo']) && isset($c['valor']) && trim((string)$c['valor']) !== '';
            });

            // Trilha especial AEE: forçar uso do critério "aee" independente do que estiver salvo
            $isTrilhaAee =
                isset($trilha['id'], $trilha['valor']) &&
                mb_strtolower((string)$trilha['id'], 'UTF-8') === 'trilha-aee' &&
                mb_strtoupper((string)$trilha['valor'], 'UTF-8') === 'AEE';
            if ($isTrilhaAee) {
                $criterios = [[
                    'tipo' => 'aee',
                    'valor' => 'AEE',
                ]];
            }
            
            // Buscar atividades: por critérios de agrupamento (AND) ou por tipo+valor (retrocompatível)
            $atividades = [];
            if (!empty($criterios)) {
                $atividades = atividades_por_criterios($pdo, $criterios);
            } elseif ($trilha['tipo'] === 'ano_escolar') {
                // Compatibilidade: trilhas antigas onde tipo=ano_escolar e valor (ex.: "1º Ano", "AEE")
                // mas criterios_agrupamento ainda não foram preenchidos.
                $valorTrilha = (string)($trilha['valor'] ?? '');
                if (mb_strtoupper($valorTrilha, 'UTF-8') === 'AEE') {
                    // Trilha especial AEE: usar coluna booleana aee (todas as atividades marcadas como AEE)
                    $syntheticCriteria = [[
                        'tipo' => 'aee',
                        'valor' => 'AEE',
                    ]];
                } else {
                    // Demais trilhas por série (1º ao 9º ano): buscar por ano_escolar
                    $syntheticCriteria = [[
                        'tipo' => 'ano_escolar',
                        'valor' => $valorTrilha,
                    ]];
                }
                $atividades = atividades_por_criterios($pdo, $syntheticCriteria);
            } elseif ($trilha['tipo'] === 'eixo_bncc') {
                // Buscar atividades que têm este eixo BNCC no array JSON
                // Mapear nome do eixo para ID (caso as atividades tenham IDs)
                $eixoNameToId = [
                    'Pensamento Computacional' => 'pensamento-computacional',
                    'Mundo Digital' => 'mundo-digital',
                    'Cultura Digital' => 'cultura-digital',
                ];
                
                $valorTrilha = $trilha['valor'];
                $eixoId = $eixoNameToId[$valorTrilha] ?? null;
                
                // Buscar por nome OU por ID
                if ($eixoId) {
                    $stmtAtiv = $pdo->prepare("
                        SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                        COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                        material_apoio_url, COALESCE(bloqueada, 0) as bloqueada
                        FROM atividades 
                        WHERE (
                            JSON_CONTAINS(COALESCE(eixos_bncc, '[]'), ?) 
                            OR JSON_CONTAINS(COALESCE(eixos_bncc, '[]'), ?)
                        )
                        ORDER BY COALESCE(criado_em, data_criacao) DESC
                    ");
                    $eixoNomeJson = json_encode($valorTrilha);
                    $eixoIdJson = json_encode($eixoId);
                    $stmtAtiv->execute([$eixoNomeJson, $eixoIdJson]);
                } else {
                    // Se não tiver mapeamento, buscar apenas por nome
                    $stmtAtiv = $pdo->prepare("
                        SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                        COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                        material_apoio_url, COALESCE(bloqueada, 0) as bloqueada
                        FROM atividades 
                        WHERE JSON_CONTAINS(COALESCE(eixos_bncc, '[]'), ?)
                        ORDER BY COALESCE(criado_em, data_criacao) DESC
                    ");
                    $eixoJson = json_encode($valorTrilha);
                    $stmtAtiv->execute([$eixoJson]);
                }
                $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
            } elseif ($trilha['tipo'] === 'etapa') {
                // Buscar atividades que têm esta etapa
                // Pode ser por campo etapa OU por anos_escolares (JSON array)
                $valorTrilha = $trilha['valor'];
                
                // Mapear nomes de etapas para IDs de anos escolares
                $anoEscolarMap = [
                    'Educação Infantil' => 'ei',
                    '1º Ano' => '1ano',
                    '2º Ano' => '2ano',
                    '3º Ano' => '3ano',
                    '4º Ano' => '4ano',
                    '5º Ano' => '5ano',
                    '6º Ano' => '6ano',
                    '7º Ano' => '7ano',
                    '8º Ano' => '8ano',
                    '9º Ano' => '9ano',
                    'AEE' => 'aee',
                ];
                
                $anoEscolarId = $anoEscolarMap[$valorTrilha] ?? null;
                
                if ($anoEscolarId) {
                    // Para anos específicos (1º Ano, 2º Ano, etc.), buscar por anos_escolares
                    // Para "Educação Infantil", também buscar por etapa = 'Educação Infantil' (atividades de EI costumam ter só etapa, sem anos_escolares)
                    $anoEscolarJson = json_encode($anoEscolarId); // Ex: "1ano" ou "ei"
                    $anoEscolarNomeJson = json_encode($valorTrilha); // Ex: "1º Ano" ou "Educação Infantil"
                    $anoEscolarNomeAltJson = json_encode(str_replace('º', '°', $valorTrilha)); // Ex: "1° Ano"
                    $anoEscolarNomeSemJson = json_encode(preg_replace('/\s*[º°]\s*/u', ' ', $valorTrilha)); // Ex: "1 Ano" ou "Educação Infantil" (sem alteração)
                    
                    $conds = [];
                    $params = [];
                    if ($valorTrilha === 'Educação Infantil') {
                        $conds[] = "etapa = ?";
                        $params[] = $valorTrilha;
                        if ($hasEtapasColTrilha) {
                            $conds[] = "JSON_CONTAINS(COALESCE(etapas, '[]'), ?) = 1";
                            $params[] = json_encode($valorTrilha, JSON_UNESCAPED_UNICODE);
                        }
                    }
                    foreach ([$anoEscolarJson, $anoEscolarNomeJson, $anoEscolarNomeAltJson, $anoEscolarNomeSemJson] as $j) {
                        $conds[] = "(IF(JSON_VALID(anos_escolares), JSON_CONTAINS(anos_escolares, ?), 0) = 1 OR COALESCE(anos_escolares, '') LIKE ?)";
                        $params[] = $j;
                        $decoded = json_decode($j, true);
                        $params[] = '%' . (is_string($decoded) ? $decoded : '') . '%';
                    }
                    $stmtAtiv = $pdo->prepare("
                        SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                        COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                        material_apoio_url, COALESCE(bloqueada, 0) as bloqueada
                        FROM atividades 
                        WHERE (" . implode(' OR ', $conds) . ")
                        ORDER BY COALESCE(criado_em, data_criacao) DESC
                    ");
                    $stmtAtiv->execute($params);
                    
                    // Log resultado (após fetchAll será feito mais abaixo)
                    if (isset($_GET['debug'])) {
                        error_log("Query executada. Buscando por: " . $anoEscolarJson . " / " . $anoEscolarNomeJson . " / " . $anoEscolarNomeAltJson . " / " . $anoEscolarNomeSemJson);
                    }
                } else {
                    // Buscar apenas por etapa (para etapas como "Anos Iniciais", "Anos Finais")
                    // Para etapas genéricas, também buscar por anos_escolares que correspondam
                    if ($valorTrilha === 'Anos Iniciais') {
                        // Buscar atividades de Anos Iniciais (1º ao 5º ano) - aceitar múltiplos formatos
                        $anosIniciais = [
                            '1ano', '2ano', '3ano', '4ano', '5ano',
                            '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano',
                            '1° Ano', '2° Ano', '3° Ano', '4° Ano', '5° Ano',
                            '1 Ano', '2 Ano', '3 Ano', '4 Ano', '5 Ano',
                        ];
                        $conditions = [];
                        $params = [$valorTrilha];
                        foreach ($anosIniciais as $ano) {
                            $conditions[] = "(IF(JSON_VALID(anos_escolares), JSON_CONTAINS(anos_escolares, ?), 0) = 1 OR COALESCE(anos_escolares, '') LIKE ?)";
                            $params[] = json_encode($ano);
                            $params[] = '%' . $ano . '%';
                        }
                        $stmtAtiv = $pdo->prepare("
                            SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                            COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                            material_apoio_url, COALESCE(bloqueada, 0) as bloqueada
                            FROM atividades 
                            WHERE (
                                etapa = ?
                                OR " . implode(' OR ', $conditions) . "
                            )
                            ORDER BY COALESCE(criado_em, data_criacao) DESC
                        ");
                        $stmtAtiv->execute($params);
                    } elseif ($valorTrilha === 'Anos Finais') {
                        // Buscar atividades de Anos Finais (6º ao 9º ano) - aceitar múltiplos formatos
                        $anosFinais = [
                            '6ano', '7ano', '8ano', '9ano',
                            '6º Ano', '7º Ano', '8º Ano', '9º Ano',
                            '6° Ano', '7° Ano', '8° Ano', '9° Ano',
                            '6 Ano', '7 Ano', '8 Ano', '9 Ano',
                        ];
                        $conditions = [];
                        $params = [$valorTrilha];
                        foreach ($anosFinais as $ano) {
                            $conditions[] = "(IF(JSON_VALID(anos_escolares), JSON_CONTAINS(anos_escolares, ?), 0) = 1 OR COALESCE(anos_escolares, '') LIKE ?)";
                            $params[] = json_encode($ano);
                            $params[] = '%' . $ano . '%';
                        }
                        $etapasCond2 = $hasEtapasColTrilha ? " OR JSON_CONTAINS(COALESCE(etapas, '[]'), ?) = 1" : "";
                        $stmtAtiv = $pdo->prepare("
                            SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                            COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                            material_apoio_url, COALESCE(bloqueada, 0) as bloqueada
                            FROM atividades 
                            WHERE (
                                etapa = ?
                                OR " . implode(' OR ', $conditions) . $etapasCond2 . "
                            )
                            ORDER BY COALESCE(criado_em, data_criacao) DESC
                        ");
                        if ($hasEtapasColTrilha) $params[] = json_encode($valorTrilha, JSON_UNESCAPED_UNICODE);
                        $stmtAtiv->execute($params);
                    } else {
                        // Buscar apenas por etapa (inclui AEE com múltiplas etapas)
                        if ($hasEtapasColTrilha) {
                            $stmtAtiv = $pdo->prepare("
                                SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                                COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                                material_apoio_url, COALESCE(bloqueada, 0) as bloqueada
                                FROM atividades 
                                WHERE etapa = ? OR JSON_CONTAINS(COALESCE(etapas, '[]'), ?) = 1
                                ORDER BY COALESCE(criado_em, data_criacao) DESC
                            ");
                            $stmtAtiv->execute([$valorTrilha, json_encode($valorTrilha, JSON_UNESCAPED_UNICODE)]);
                        } else {
                            $stmtAtiv = $pdo->prepare("
                                SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                                COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                                material_apoio_url, COALESCE(bloqueada, 0) as bloqueada
                                FROM atividades 
                                WHERE etapa = ?
                                ORDER BY COALESCE(criado_em, data_criacao) DESC
                            ");
                            $stmtAtiv->execute([$valorTrilha]);
                        }
                    }
                }
                $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
            } elseif ($trilha['tipo'] === 'disciplina_transversal') {
                // Buscar atividades que têm esta disciplina transversal (JSON ou texto legado)
                $valorDisc = $trilha['valor'];
                $disciplinaJson = json_encode($valorDisc, JSON_UNESCAPED_UNICODE);
                $likeDisc = '%' . $valorDisc . '%';
                $stmtAtiv = $pdo->prepare("
                    SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                    COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                    material_apoio_url, COALESCE(bloqueada, 0) as bloqueada
                    FROM atividades 
                    WHERE (
                        (IF(JSON_VALID(disciplinas_transversais), JSON_CONTAINS(disciplinas_transversais, ?), 0) = 1)
                        OR (COALESCE(disciplinas_transversais, '') LIKE ?)
                    )
                    ORDER BY COALESCE(criado_em, data_criacao) DESC
                ");
                $stmtAtiv->execute([$disciplinaJson, $likeDisc]);
                $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
            } elseif ($trilha['tipo'] === 'aee') {
                // Trilha AEE: listar atividades marcadas como AEE (coluna aee = 1)
                $hasAeeCol = $pdo->query("SHOW COLUMNS FROM atividades LIKE 'aee'")->rowCount() > 0;
                if ($hasAeeCol) {
                    $stmtAtiv = $pdo->prepare("
                        SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao,
                        COALESCE(pdf_estrutura_pedagogica_url, url_documento) as pdf_estrutura_pedagogica_url,
                        material_apoio_url, COALESCE(bloqueada, 0) as bloqueada, COALESCE(aee, 0) as aee
                        FROM atividades
                        WHERE COALESCE(aee, 0) = 1
                        ORDER BY COALESCE(criado_em, data_criacao) DESC
                    ");
                    $stmtAtiv->execute([]);
                    $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $atividades = [];
                }
            }
            
            // Processar atividades
            $atividadesData = [];
            foreach ($atividades as $atividade) {
                // Converter eixos_bncc
                $eixosBncc = [];
                if (isset($atividade['eixos_bncc'])) {
                    if (is_string($atividade['eixos_bncc'])) {
                        $decoded = json_decode($atividade['eixos_bncc'], true);
                        $eixosBncc = is_array($decoded) ? $decoded : [];
                    } elseif (is_array($atividade['eixos_bncc'])) {
                        $eixosBncc = $atividade['eixos_bncc'];
                    }
                }
                
                // Converter anos_escolares para debug
                $anosEscolares = [];
                if (isset($atividade['anos_escolares'])) {
                    if (is_string($atividade['anos_escolares'])) {
                        $decoded = json_decode($atividade['anos_escolares'], true);
                        $anosEscolares = is_array($decoded) ? $decoded : [];
                    } elseif (is_array($atividade['anos_escolares'])) {
                        $anosEscolares = $atividade['anos_escolares'];
                    }
                }
                
                // Normalizar tipo para Plugada/Desplugada (evitar exibir tudo como Plugada quando valor vazio ou inconsistente)
                $tipoRaw = $atividade['tipo'] ?? '';
                $tipoLower = strtolower(trim((string)$tipoRaw));
                // Atenção: "desplugada" contém "plugada". Precisamos checar "desplugada" primeiro.
                $tipoNormalized = (strpos($tipoLower, 'desplugada') !== false)
                    ? 'Desplugada'
                    : ((strpos($tipoLower, 'plugada') !== false) ? 'Plugada' : 'Desplugada');
                $atividadesData[] = [
                    'id' => $atividade['id'],
                    'nome_atividade' => $atividade['nome_atividade'] ?? '',
                    'descricao' => $atividade['descricao'] ?? null,
                    'tipo' => $tipoNormalized,
                    'etapa' => $atividade['etapa'] ?? null,
                    'eixos_bncc' => $eixosBncc,
                    'anos_escolares' => $anosEscolares,
                    'thumbnail_url' => $atividade['thumbnail_url'] ?? null,
                    'video_url' => $atividade['video_url'] ?? null,
                    'duracao' => $atividade['duracao'] ?? null,
                    'material_pdf_url' => $atividade['material_apoio_url'] ?? null,
                    'pedagogical_pdf_url' => $atividade['pdf_estrutura_pedagogica_url'] ?? null,
                    'document_url' => $atividade['pdf_estrutura_pedagogica_url'] ?? null,
                    'bloqueada' => (int)($atividade['bloqueada'] ?? 0) === 1,
                    'aee' => (int)($atividade['aee'] ?? 0) === 1,
                ];
            }
            
            // Log para debug (apenas em desenvolvimento)
            if (isset($_GET['debug'])) {
                error_log("=== DEBUG TRILHA ===");
                error_log("Trilha: " . $trilha['id'] . " - Tipo: " . $trilha['tipo'] . " - Valor: " . $trilha['valor']);
                if ($trilha['tipo'] === 'etapa') {
                    $anoEscolarMap = [
                        'Educação Infantil' => 'ei',
                        '1º Ano' => '1ano',
                        '2º Ano' => '2ano',
                        '3º Ano' => '3ano',
                        '4º Ano' => '4ano',
                        '5º Ano' => '5ano',
                        '6º Ano' => '6ano',
                        '7º Ano' => '7ano',
                        '8º Ano' => '8ano',
                        '9º Ano' => '9ano',
                        'AEE' => 'aee',
                    ];
                    $anoEscolarId = $anoEscolarMap[$trilha['valor']] ?? null;
                    error_log("Ano Escolar ID mapeado: " . ($anoEscolarId ?? 'null'));
                    error_log("Buscando por ID JSON: " . json_encode($anoEscolarId));
                    error_log("Buscando por Nome JSON: " . json_encode($trilha['valor']));
                }
                error_log("Total de atividades encontradas (raw): " . count($atividades));
                if (count($atividades) > 0) {
                    foreach ($atividades as $idx => $atividade) {
                        $anosRaw = $atividade['anos_escolares'] ?? null;
                        $anosDecoded = null;
                        if ($anosRaw) {
                            if (is_string($anosRaw)) {
                                $anosDecoded = json_decode($anosRaw, true);
                            } else {
                                $anosDecoded = $anosRaw;
                            }
                        }
                        error_log("Atividade #" . ($idx + 1) . ": " . ($atividade['nome_atividade'] ?? 'sem nome'));
                        error_log("  - ID: " . ($atividade['id'] ?? 'null'));
                        error_log("  - Etapa: " . ($atividade['etapa'] ?? 'null'));
                        error_log("  - Anos Escolares (raw): " . ($anosRaw ?? 'null'));
                        error_log("  - Anos Escolares (decoded): " . json_encode($anosDecoded));
                    }
                } else {
                    error_log("NENHUMA atividade encontrada!");
                }
                error_log("=== FIM DEBUG ===");
            }
            
            $trilhaResponse = $trilha;
            $trilhaResponse['criterios_agrupamento'] = $criterios;

            // Perfil "Teste Professor": só mostra as atividades liberadas (configurável)
            if ($currentUser && strtolower((string)($currentUser['role'] ?? '')) === 'teste_professor') {
                $atividadesData = apply_teste_professor_access_trilha($pdo, $atividadesData);
            }

            // Ordenar: atividades desbloqueadas primeiro, bloqueadas por último
            usort($atividadesData, function ($a, $b) {
                $blockA = !empty($a['bloqueada']);
                $blockB = !empty($b['bloqueada']);
                if ($blockA === $blockB) return 0;
                return $blockA ? 1 : -1;
            });

            json_response_trilha(200, [
                'error' => false,
                'trilha' => $trilhaResponse,
                'atividades' => $atividadesData,
                'total_atividades' => count($atividadesData),
                'debug' => isset($_GET['debug']) ? [
                    'trilha_tipo' => $trilha['tipo'],
                    'trilha_valor' => $trilha['valor'],
                    'criterios_agrupamento' => $criterios,
                    'atividades_raw_count' => count($atividades),
                ] : null
            ]);
        } else {
            // Listar todas as trilhas (com filtro opcional por tipo; SELECT * para compatibilidade com/sem criterios_agrupamento)
            try {
                $sql = "SELECT * FROM trilhas WHERE ativo = 1";
                $params = [];
                
                if ($tipo) {
                    // tipo=etapa → apenas Educação Infantil, Anos Iniciais, Anos Finais
                    // tipo=ano_escolar → apenas 1º ao 9º Ano e AEE (seção "Por Séries")
                    $sql .= " AND tipo = ?";
                    $params[] = $tipo;
                }
                
                $sql .= " ORDER BY ordem ASC, titulo ASC";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $trilhas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($trilhas as &$t) {
                    $cr = array_key_exists('criterios_agrupamento', $t) ? ($t['criterios_agrupamento'] ?? '[]') : '[]';
                    $t['criterios_agrupamento'] = is_string($cr) ? json_decode($cr, true) : $cr;
                    if (!is_array($t['criterios_agrupamento'])) {
                        $t['criterios_agrupamento'] = [];
                    }
                }
                unset($t);
                json_response_trilha(200, [
                    'error' => false,
                    'trilhas' => $trilhas,
                    'total' => count($trilhas)
                ]);
            } catch (Throwable $e) {
                error_log('trilhas list: ' . $e->getMessage() . ' em ' . $e->getFile() . ':' . $e->getLine());
                json_response_trilha(500, [
                    'error' => true,
                    'message' => 'Erro ao listar trilhas',
                    'details' => $e->getMessage()
                ]);
            }
        }
    }

    if ($method === 'POST') {
        $data = read_json_body();
        
        $id = trim((string)($data['id'] ?? ''));
        $titulo = trim((string)($data['titulo'] ?? ''));
        $descricao = isset($data['descricao']) && trim((string)$data['descricao']) !== '' 
            ? trim((string)$data['descricao']) 
            : null;
        $criterios = isset($data['criterios_agrupamento']) && is_array($data['criterios_agrupamento']) 
            ? array_values(array_filter($data['criterios_agrupamento'], function ($c) {
                return !empty($c['tipo']) && isset($c['valor']) && trim((string)$c['valor']) !== '';
            }))
            : [];
        $tipo = (string)($data['tipo'] ?? '');
        $valor = trim((string)($data['valor'] ?? ''));
        if (!empty($criterios)) {
            $tipoPrimeiro = (string)($criterios[0]['tipo'] ?? '');
            $valorPrimeiro = trim((string)($criterios[0]['valor'] ?? ''));
            // Compatibilidade: trilhas por "ano_escolar" devem continuar aparecendo como "etapa" para o professor
            // (mantemos o tipo real dentro de criterios_agrupamento)
            $tipo = $tipoPrimeiro === 'ano_escolar' ? 'etapa' : $tipoPrimeiro;
            $valor = $valorPrimeiro;
        }
        $thumbnailUrl = isset($data['thumbnail_url']) && trim((string)$data['thumbnail_url']) !== '' 
            ? trim((string)$data['thumbnail_url']) 
            : null;
        $ordem = isset($data['ordem']) ? (int)$data['ordem'] : 0;
        
        // Validações: id e titulo obrigatórios; tipo+valor OU criterios_agrupamento
        if (empty($id)) {
            json_response_trilha(400, ['error' => true, 'message' => 'ID da trilha é obrigatório']);
        }
        if (empty($titulo)) {
            json_response_trilha(400, ['error' => true, 'message' => 'Título é obrigatório']);
        }
        if (empty($criterios) && (empty($tipo) || empty($valor))) {
            json_response_trilha(400, ['error' => true, 'message' => 'Informe ao menos um critério de agrupamento (tipo+valor ou criterios_agrupamento)']);
        }
        if (empty($criterios)) {
            $allowedTipos = ['eixo_bncc', 'etapa', 'disciplina_transversal', 'ano_escolar', 'aee'];
            if (!in_array($tipo, $allowedTipos, true)) {
                json_response_trilha(400, ['error' => true, 'message' => 'Tipo inválido. Use: eixo_bncc, etapa, ano_escolar, disciplina_transversal ou aee']);
            }
        } else {
            $allowedTipos = ['eixo_bncc', 'etapa', 'disciplina_transversal', 'ano_escolar', 'aee'];
            foreach ($criterios as $c) {
                if (!in_array($c['tipo'] ?? '', $allowedTipos, true)) {
                    json_response_trilha(400, ['error' => true, 'message' => 'Critério com tipo inválido. Use: eixo_bncc, etapa, ano_escolar, disciplina_transversal ou aee']);
                }
            }
        }
        
        // Verificar se já existe
        $checkStmt = $pdo->prepare("SELECT id FROM trilhas WHERE id = ?");
        $checkStmt->execute([$id]);
        if ($checkStmt->fetch()) {
            json_response_trilha(409, ['error' => true, 'message' => 'Trilha com este ID já existe']);
        }
        
        $criteriosJson = empty($criterios) ? null : json_encode($criterios, JSON_UNESCAPED_UNICODE);
        $hasCriteriosCol = $pdo->query("SHOW COLUMNS FROM trilhas LIKE 'criterios_agrupamento'")->rowCount() > 0;
        
        try {
            if ($hasCriteriosCol) {
                $stmt = $pdo->prepare("
                    INSERT INTO trilhas (id, titulo, descricao, tipo, valor, criterios_agrupamento, thumbnail_url, ordem, ativo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
                ");
                $stmt->execute([$id, $titulo, $descricao, $tipo, $valor, $criteriosJson, $thumbnailUrl, $ordem]);
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO trilhas (id, titulo, descricao, tipo, valor, thumbnail_url, ordem, ativo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                ");
                $stmt->execute([$id, $titulo, $descricao, $tipo, $valor, $thumbnailUrl, $ordem]);
            }
        } catch (PDOException $e) {
            error_log('Erro no INSERT: ' . $e->getMessage());
            json_response_trilha(500, ['error' => true, 'message' => 'Erro ao criar trilha: ' . $e->getMessage()]);
        }
        
        json_response_trilha(201, [
            'error' => false,
            'message' => 'Trilha criada com sucesso',
            'trilha' => [
                'id' => $id,
                'titulo' => $titulo
            ]
        ]);
    }

    if ($method === 'PUT') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));
        
        if (empty($id)) {
            json_response_trilha(400, ['error' => true, 'message' => 'ID da trilha é obrigatório']);
        }
        
        // Verificar se existe
        $checkStmt = $pdo->prepare("SELECT id FROM trilhas WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            json_response_trilha(404, ['error' => true, 'message' => 'Trilha não encontrada']);
        }
        
        $updates = [];
        $params = [];
        
        if (isset($data['titulo'])) {
            $updates[] = "titulo = ?";
            $params[] = trim((string)$data['titulo']);
        }
        if (isset($data['descricao'])) {
            $updates[] = "descricao = ?";
            $params[] = trim((string)$data['descricao']) ?: null;
        }
        if (isset($data['tipo'])) {
            $updates[] = "tipo = ?";
            $params[] = (string)$data['tipo'];
        }
        if (isset($data['valor'])) {
            $updates[] = "valor = ?";
            $params[] = trim((string)$data['valor']);
        }
        if (isset($data['thumbnail_url'])) {
            $updates[] = "thumbnail_url = ?";
            $params[] = trim((string)$data['thumbnail_url']) ?: null;
        }
        if (isset($data['ordem'])) {
            $updates[] = "ordem = ?";
            $params[] = (int)$data['ordem'];
        }
        if (isset($data['ativo'])) {
            $updates[] = "ativo = ?";
            $params[] = (int)$data['ativo'];
        }
        if (array_key_exists('criterios_agrupamento', $data)) {
            $putCriterios = is_array($data['criterios_agrupamento'])
                ? array_values(array_filter($data['criterios_agrupamento'], function ($c) {
                    return !empty($c['tipo']) && isset($c['valor']) && trim((string)$c['valor']) !== '';
                }))
                : [];
            $criteriosJson = empty($putCriterios) ? null : json_encode($putCriterios, JSON_UNESCAPED_UNICODE);
            $hasCriteriosCol = $pdo->query("SHOW COLUMNS FROM trilhas LIKE 'criterios_agrupamento'")->rowCount() > 0;
            if ($hasCriteriosCol) {
                $updates[] = "criterios_agrupamento = ?";
                $params[] = $criteriosJson;
            }
            if (!empty($putCriterios)) {
                $tipoPrimeiro = (string)($putCriterios[0]['tipo'] ?? '');
                $valorPrimeiro = trim((string)($putCriterios[0]['valor'] ?? ''));
                $updates[] = "tipo = ?";
                $params[] = $tipoPrimeiro === 'ano_escolar' ? 'etapa' : $tipoPrimeiro;
                $updates[] = "valor = ?";
                $params[] = $valorPrimeiro;
            }
        }
        
        if (empty($updates)) {
            json_response_trilha(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }
        
        $params[] = $id;
        $sql = "UPDATE trilhas SET " . implode(', ', $updates) . " WHERE id = ?";
        
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } catch (PDOException $e) {
            error_log('Erro no UPDATE: ' . $e->getMessage());
            json_response_trilha(500, ['error' => true, 'message' => 'Erro ao atualizar trilha: ' . $e->getMessage()]);
        }
        
        json_response_trilha(200, [
            'error' => false,
            'message' => 'Trilha atualizada com sucesso'
        ]);
    }

    if ($method === 'DELETE') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));
        
        if (empty($id)) {
            json_response_trilha(400, ['error' => true, 'message' => 'ID da trilha é obrigatório']);
        }
        
        // Verificar se existe
        $checkStmt = $pdo->prepare("SELECT id FROM trilhas WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            json_response_trilha(404, ['error' => true, 'message' => 'Trilha não encontrada']);
        }
        
        // Soft delete (marcar como inativo ao invés de deletar)
        try {
            $stmt = $pdo->prepare("UPDATE trilhas SET ativo = 0 WHERE id = ?");
            $stmt->execute([$id]);
        } catch (PDOException $e) {
            error_log('Erro no DELETE: ' . $e->getMessage());
            json_response_trilha(500, ['error' => true, 'message' => 'Erro ao deletar trilha: ' . $e->getMessage()]);
        }
        
        json_response_trilha(200, [
            'error' => false,
            'message' => 'Trilha deletada com sucesso'
        ]);
    }

} catch (PDOException $e) {
    error_log('Erro PDO: ' . $e->getMessage());
    json_response_trilha(500, [
        'error' => true,
        'message' => 'Erro no banco de dados',
        'details' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response_trilha(500, [
        'error' => true,
        'message' => 'Erro interno do servidor',
        'details' => $e->getMessage()
    ]);
} catch (Throwable $e) {
    error_log('Erro trilhas: ' . $e->getMessage() . ' em ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
    }
    echo json_encode([
        'error' => true,
        'message' => 'Erro interno do servidor',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
