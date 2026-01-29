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
 * Retorna atividades que atendem a TODOS os critérios de agrupamento (AND).
 * @param PDO $pdo
 * @param array<array{tipo:string,valor:string}> $criterios
 * @return array
 */
function atividades_por_criterios(PDO $pdo, array $criterios): array {
    if (empty($criterios)) {
        return [];
    }
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
                $conditions[] = "(JSON_CONTAINS(COALESCE(anos_escolares, '[]'), ?) OR JSON_CONTAINS(COALESCE(anos_escolares, '[]'), ?))";
                $params[] = json_encode($anoId);
                $params[] = json_encode($valor);
            } elseif ($valor === 'Anos Iniciais') {
                $conds = ["etapa = ?"];
                $params[] = $valor;
                foreach (['1ano', '2ano', '3ano', '4ano', '5ano'] as $a) {
                    $conds[] = "JSON_CONTAINS(COALESCE(anos_escolares, '[]'), ?)";
                    $params[] = json_encode($a);
                }
                $conditions[] = '(' . implode(' OR ', $conds) . ')';
            } elseif ($valor === 'Anos Finais') {
                $conds = ["etapa = ?"];
                $params[] = $valor;
                foreach (['6ano', '7ano', '8ano', '9ano'] as $a) {
                    $conds[] = "JSON_CONTAINS(COALESCE(anos_escolares, '[]'), ?)";
                    $params[] = json_encode($a);
                }
                $conditions[] = '(' . implode(' OR ', $conds) . ')';
            } else {
                $conditions[] = "etapa = ?";
                $params[] = $valor;
            }
        } elseif ($tipo === 'ano_escolar') {
            $anoId = $anoEscolarMap[$valor] ?? $valor;
            $conditions[] = "(JSON_CONTAINS(COALESCE(anos_escolares, '[]'), ?) OR JSON_CONTAINS(COALESCE(anos_escolares, '[]'), ?))";
            $params[] = json_encode($anoId);
            $params[] = json_encode($valor);
        } elseif ($tipo === 'disciplina_transversal') {
            $conditions[] = "JSON_CONTAINS(COALESCE(disciplinas_transversais, '[]'), ?)";
            $params[] = json_encode($valor);
        }
    }
    if (empty($conditions)) {
        return [];
    }
    $where = implode(' AND ', $conditions);
    $sql = "SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
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
            
            // Buscar atividades: por critérios de agrupamento (AND) ou por tipo+valor (retrocompatível)
            $atividades = [];
            if (!empty($criterios)) {
                $atividades = atividades_por_criterios($pdo, $criterios);
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
                        SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
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
                        SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
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
                    // Para anos específicos (1º Ano, 2º Ano, etc.), buscar APENAS por anos_escolares
                    // porque o campo etapa geralmente contém valores genéricos como "Anos Iniciais" ou "Anos Finais"
                    // Buscar tanto pelo ID (ex: "1ano") quanto pelo nome (ex: "1º Ano") caso esteja salvo de forma diferente
                    // Também buscar variações possíveis
                    $anoEscolarJson = json_encode($anoEscolarId); // Ex: "1ano"
                    $anoEscolarNomeJson = json_encode($valorTrilha); // Ex: "1º Ano"
                    
                    // Log para debug
                    if (isset($_GET['debug'])) {
                        error_log("Buscando trilha de etapa: " . $valorTrilha);
                        error_log("Ano ID mapeado: " . $anoEscolarId);
                        error_log("Buscando por JSON: " . $anoEscolarJson . " ou " . $anoEscolarNomeJson);
                    }
                    
                    // Buscar atividades que tenham o ano escolar no array anos_escolares
                    // Tentar tanto pelo ID quanto pelo nome completo
                    $stmtAtiv = $pdo->prepare("
                        SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
                        FROM atividades 
                        WHERE (
                            (anos_escolares IS NOT NULL AND anos_escolares != '' AND anos_escolares != '[]')
                            AND (
                                JSON_CONTAINS(anos_escolares, ?)
                                OR JSON_CONTAINS(anos_escolares, ?)
                            )
                        )
                        ORDER BY COALESCE(criado_em, data_criacao) DESC
                    ");
                    $stmtAtiv->execute([$anoEscolarJson, $anoEscolarNomeJson]);
                    
                    // Log resultado (após fetchAll será feito mais abaixo)
                    if (isset($_GET['debug'])) {
                        error_log("Query executada. Buscando por: " . $anoEscolarJson . " ou " . $anoEscolarNomeJson);
                    }
                } else {
                    // Buscar apenas por etapa (para etapas como "Anos Iniciais", "Anos Finais")
                    // Para etapas genéricas, também buscar por anos_escolares que correspondam
                    if ($valorTrilha === 'Anos Iniciais') {
                        // Buscar atividades de Anos Iniciais (1º ao 5º ano)
                        $anosIniciais = ['1ano', '2ano', '3ano', '4ano', '5ano'];
                        $conditions = [];
                        $params = [$valorTrilha];
                        
                        // Adicionar condições para cada ano
                        foreach ($anosIniciais as $ano) {
                            $conditions[] = "JSON_CONTAINS(COALESCE(anos_escolares, '[]'), ?)";
                            $params[] = json_encode($ano);
                        }
                        
                        $stmtAtiv = $pdo->prepare("
                            SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
                            FROM atividades 
                            WHERE (
                                etapa = ?
                                OR " . implode(' OR ', $conditions) . "
                            )
                            ORDER BY COALESCE(criado_em, data_criacao) DESC
                        ");
                        $stmtAtiv->execute($params);
                    } elseif ($valorTrilha === 'Anos Finais') {
                        // Buscar atividades de Anos Finais (6º ao 9º ano)
                        $anosFinais = ['6ano', '7ano', '8ano', '9ano'];
                        $conditions = [];
                        $params = [$valorTrilha];
                        
                        // Adicionar condições para cada ano
                        foreach ($anosFinais as $ano) {
                            $conditions[] = "JSON_CONTAINS(COALESCE(anos_escolares, '[]'), ?)";
                            $params[] = json_encode($ano);
                        }
                        
                        $stmtAtiv = $pdo->prepare("
                            SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
                            FROM atividades 
                            WHERE (
                                etapa = ?
                                OR " . implode(' OR ', $conditions) . "
                            )
                            ORDER BY COALESCE(criado_em, data_criacao) DESC
                        ");
                        $stmtAtiv->execute($params);
                    } else {
                        // Buscar apenas por etapa
                        $stmtAtiv = $pdo->prepare("
                            SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
                            FROM atividades 
                            WHERE etapa = ?
                            ORDER BY COALESCE(criado_em, data_criacao) DESC
                        ");
                        $stmtAtiv->execute([$valorTrilha]);
                    }
                }
                $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
            } elseif ($trilha['tipo'] === 'disciplina_transversal') {
                // Buscar atividades que têm esta disciplina transversal no array JSON
                $stmtAtiv = $pdo->prepare("
                    SELECT id, nome_atividade, descricao, tipo, etapa, anos_escolares, eixos_bncc, thumbnail_url, video_url, duracao, nivel_dificuldade
                    FROM atividades 
                    WHERE JSON_CONTAINS(COALESCE(disciplinas_transversais, '[]'), ?)
                    ORDER BY COALESCE(criado_em, data_criacao) DESC
                ");
                $disciplinaJson = json_encode($trilha['valor']);
                $stmtAtiv->execute([$disciplinaJson]);
                $atividades = $stmtAtiv->fetchAll(PDO::FETCH_ASSOC);
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
                
                $atividadesData[] = [
                    'id' => $atividade['id'],
                    'nome_atividade' => $atividade['nome_atividade'] ?? '',
                    'descricao' => $atividade['descricao'] ?? null,
                    'tipo' => $atividade['tipo'] ?? null,
                    'etapa' => $atividade['etapa'] ?? null,
                    'eixos_bncc' => $eixosBncc,
                    'anos_escolares' => $anosEscolares, // Adicionar para debug
                    'thumbnail_url' => $atividade['thumbnail_url'] ?? null,
                    'video_url' => $atividade['video_url'] ?? null,
                    'duracao' => $atividade['duracao'] ?? null,
                    'nivel_dificuldade' => $atividade['nivel_dificuldade'] ?? null,
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
                    // Compatibilidade: trilhas de "ano_escolar" devem aparecer junto com "etapa" para o perfil do professor
                    if ($tipo === 'etapa') {
                        $sql .= " AND (tipo = ? OR tipo = 'ano_escolar')";
                        $params[] = $tipo;
                    } else {
                        $sql .= " AND tipo = ?";
                        $params[] = $tipo;
                    }
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
            $allowedTipos = ['eixo_bncc', 'etapa', 'disciplina_transversal', 'ano_escolar'];
            if (!in_array($tipo, $allowedTipos, true)) {
                json_response_trilha(400, ['error' => true, 'message' => 'Tipo inválido. Use: eixo_bncc, etapa, ano_escolar ou disciplina_transversal']);
            }
        } else {
            $allowedTipos = ['eixo_bncc', 'etapa', 'disciplina_transversal', 'ano_escolar'];
            foreach ($criterios as $c) {
                if (!in_array($c['tipo'] ?? '', $allowedTipos, true)) {
                    json_response_trilha(400, ['error' => true, 'message' => 'Critério com tipo inválido. Use: eixo_bncc, etapa, ano_escolar ou disciplina_transversal']);
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
