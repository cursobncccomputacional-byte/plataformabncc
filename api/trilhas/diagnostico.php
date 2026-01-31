<?php
/**
 * Diagnóstico Trilhas x Atividades (WEB)
 *
 * IMPORTANTE:
 * - Endpoint APENAS para o usuário root logado (sessão).
 * - Use temporariamente e remova depois do diagnóstico.
 *
 * Exemplo:
 *   /api/trilhas/diagnostico.php?only_zero=1
 *   /api/trilhas/diagnostico.php?only_zero=1&limit=200
 *   /api/trilhas/diagnostico.php?download=1
 */
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Evitar timeout em hospedagem compartilhada (quando permitido)
@ignore_user_abort(true);
@set_time_limit(180);

// Buffer + fallback para evitar "ERR_INVALID_RESPONSE" em caso de erro fatal/timeout
ob_start();
$diag_sent = false;
register_shutdown_function(function (): void {
    global $diag_sent;
    $level = ob_get_level();
    $out = $level > 0 ? ob_get_clean() : '';
    if ($diag_sent) {
        if ($out !== false && $out !== '') echo $out;
        return;
    }
    if (!headers_sent()) {
        header('Content-Type: text/plain; charset=utf-8');
        http_response_code(500);
    }
    $err = error_get_last();
    echo "ERRO AO GERAR DIAGNÓSTICO.\n";
    if ($err) {
        echo "Tipo: " . ($err['type'] ?? '') . "\n";
        echo "Mensagem: " . ($err['message'] ?? '') . "\n";
        echo "Arquivo: " . ($err['file'] ?? '') . "\n";
        echo "Linha: " . ($err['line'] ?? '') . "\n";
    } else {
        echo "Sem detalhes (possível timeout/conexão encerrada).\n";
    }
});

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ping rápido para testar se o endpoint está acessível
if (isset($_GET['ping']) && (string)$_GET['ping'] === '1') {
    global $diag_sent;
    $diag_sent = true;
    if (ob_get_level() > 0) ob_clean();
    header('Content-Type: text/plain; charset=utf-8');
    echo "OK\n";
    exit;
}

// Segurança: apenas root
$user = getCurrentUser();
if (!$user) {
    $diag_sent = true;
    http_response_code(401);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Não autenticado.\n";
    exit;
}
if (($user['role'] ?? '') !== 'root') {
    $diag_sent = true;
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Acesso negado: apenas root.\n";
    exit;
}

header('Content-Type: text/plain; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');

if (isset($_GET['download']) && (string)$_GET['download'] === '1') {
    header('Content-Disposition: attachment; filename="diagnostico-trilhas.txt"');
}

/** @var PDO $pdo */
global $pdo;
if (!isset($pdo) || !$pdo instanceof PDO) {
    http_response_code(500);
    echo "Erro: conexão PDO não disponível.\n";
    exit;
}

$onlyZero = isset($_GET['only_zero']) ? ((string)$_GET['only_zero'] === '1') : true; // padrão: só zeradas
$limit = null;
if (isset($_GET['limit']) && is_numeric($_GET['limit'])) {
    $limit = max(1, (int)$_GET['limit']);
}
// Segurança/performance: em web, limitar por padrão
if ($limit === null) {
    $limit = 200;
}

// Modo mínimo: só totais (2 queries), para testar se o resto falha por peso/timeout
if (isset($_GET['minimal']) && (string)$_GET['minimal'] === '1') {
    $diag_sent = true;
    if (ob_get_level() > 0) ob_end_clean();
    try {
        $nAtv = (int)$pdo->query("SELECT COUNT(*) FROM atividades")->fetchColumn();
        $nTrilhas = (int)$pdo->query("SELECT COUNT(*) FROM trilhas WHERE ativo = 1")->fetchColumn();
        echo "=== MODO MINIMO ===\n";
        echo "Total atividades: $nAtv\n";
        echo "Total trilhas: $nTrilhas\n";
        echo "OK\n";
    } catch (Throwable $e) {
        echo "Erro: " . $e->getMessage() . "\n";
    }
    exit;
}

// -----------------------------
// Helpers
// -----------------------------
function q1(PDO $pdo, string $sql, array $params = []): int {
    $st = $pdo->prepare($sql);
    $st->execute($params);
    $v = $st->fetchColumn();
    return (int)($v ?? 0);
}

function qAll(PDO $pdo, string $sql, array $params = []): array {
    $st = $pdo->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
    return is_array($rows) ? $rows : [];
}

function hasColumn(PDO $pdo, string $table, string $column): bool {
    // MariaDB/MySQL não aceita ? em SHOW COLUMNS; escapar com quote
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $like = $pdo->quote($column);
    return $pdo->query("SHOW COLUMNS FROM `$table` LIKE $like")->rowCount() > 0;
}

function banner(string $title): void {
    echo "\n==============================\n";
    echo $title . "\n";
    echo "==============================\n";
}

function yearVariants(string $label): array {
    $v = [];
    $v[] = $label;
    $v[] = str_replace('º', '°', $label);
    $v[] = preg_replace('/\s*[º°]\s*/u', ' ', $label) ?? $label; // "1 Ano"
    if (preg_match('/^(\d+)\s*[º°]?\s*Ano$/u', $label, $m)) {
        $v[] = ((int)$m[1]) . 'ano';
    }
    $out = [];
    foreach ($v as $x) {
        $x = trim((string)$x);
        if ($x !== '' && !in_array($x, $out, true)) $out[] = $x;
    }
    return $out;
}

function makeContainsOrLike(string $col, string $value): array {
    $json = json_encode($value, JSON_UNESCAPED_UNICODE);
    $like = '%' . $value . '%';
    return [
        "(IF(JSON_VALID($col), JSON_CONTAINS($col, ?), 0) = 1 OR COALESCE($col,'') LIKE ?)",
        [$json, $like]
    ];
}

function normalizeCriteriosFromTrilha(array $trilha): array {
    $criterios = [];
    if (array_key_exists('criterios_agrupamento', $trilha)) {
        $cr = $trilha['criterios_agrupamento'];
        if (is_string($cr)) {
            $decoded = json_decode($cr, true);
            if (is_array($decoded)) $criterios = $decoded;
        } elseif (is_array($cr)) {
            $criterios = $cr;
        }
    }
    $criterios = array_values(array_filter($criterios, function ($c) {
        return is_array($c) && !empty($c['tipo']) && isset($c['valor']) && trim((string)$c['valor']) !== '';
    }));
    if (!empty($criterios)) return $criterios;

    $tipo = (string)($trilha['tipo'] ?? '');
    $valor = (string)($trilha['valor'] ?? '');
    if ($tipo !== '' && trim($valor) !== '') {
        $criterios[] = ['tipo' => $tipo, 'valor' => $valor];
    }
    return $criterios;
}

function buildWhereFromCriterios(PDO $pdo, array $criterios): array {
    $conditions = [];
    $params = [];
    $eixoNameToId = [
        'Pensamento Computacional' => 'pensamento-computacional',
        'Mundo Digital' => 'mundo-digital',
        'Cultura Digital' => 'cultura-digital',
    ];

    foreach ($criterios as $c) {
        $tipo = (string)($c['tipo'] ?? '');
        $valor = trim((string)($c['valor'] ?? ''));
        if ($tipo === '' || $valor === '') continue;

        if ($tipo === 'eixo_bncc') {
            $eixoId = $eixoNameToId[$valor] ?? null;
            $jNome = json_encode($valor, JSON_UNESCAPED_UNICODE);
            if ($eixoId) {
                $jId = json_encode($eixoId, JSON_UNESCAPED_UNICODE);
                $conditions[] = "(JSON_CONTAINS(COALESCE(eixos_bncc, JSON_ARRAY(id_eixo), '[]'), ?) OR JSON_CONTAINS(COALESCE(eixos_bncc, JSON_ARRAY(id_eixo), '[]'), ?))";
                $params[] = $jNome;
                $params[] = $jId;
            } else {
                $conditions[] = "JSON_CONTAINS(COALESCE(eixos_bncc, JSON_ARRAY(id_eixo), '[]'), ?)";
                $params[] = $jNome;
            }
            continue;
        }

        if ($tipo === 'disciplina_transversal') {
            [$frag, $p] = makeContainsOrLike("disciplinas_transversais", $valor);
            $conditions[] = $frag;
            array_push($params, ...$p);
            continue;
        }

        if ($tipo === 'ano_escolar') {
            $variants = yearVariants($valor);
            $or = [];
            $p = [];
            foreach ($variants as $vv) {
                [$frag, $pp] = makeContainsOrLike("anos_escolares", $vv);
                $or[] = $frag;
                array_push($p, ...$pp);
            }
            $conditions[] = '(' . implode(' OR ', $or) . ')';
            array_push($params, ...$p);
            continue;
        }

        if ($tipo === 'etapa') {
            if ($valor === 'Anos Iniciais') {
                $or = ["etapa = ?"];
                $p = [$valor];
                foreach (['1º Ano','2º Ano','3º Ano','4º Ano','5º Ano'] as $y) {
                    foreach (yearVariants($y) as $vv) {
                        [$frag, $pp] = makeContainsOrLike("anos_escolares", $vv);
                        $or[] = $frag;
                        array_push($p, ...$pp);
                    }
                }
                $conditions[] = '(' . implode(' OR ', $or) . ')';
                array_push($params, ...$p);
                continue;
            }
            if ($valor === 'Anos Finais') {
                $or = ["etapa = ?"];
                $p = [$valor];
                foreach (['6º Ano','7º Ano','8º Ano','9º Ano'] as $y) {
                    foreach (yearVariants($y) as $vv) {
                        [$frag, $pp] = makeContainsOrLike("anos_escolares", $vv);
                        $or[] = $frag;
                        array_push($p, ...$pp);
                    }
                }
                $conditions[] = '(' . implode(' OR ', $or) . ')';
                array_push($params, ...$p);
                continue;
            }
            if (preg_match('/^\d+\s*[º°]?\s*Ano$/u', $valor) || $valor === 'AEE') {
                $variants = yearVariants($valor);
                $or = [];
                $p = [];
                foreach ($variants as $vv) {
                    [$frag, $pp] = makeContainsOrLike("anos_escolares", $vv);
                    $or[] = $frag;
                    array_push($p, ...$pp);
                }
                $conditions[] = '(' . implode(' OR ', $or) . ')';
                array_push($params, ...$p);
                continue;
            }
            $conditions[] = "etapa = ?";
            $params[] = $valor;
            continue;
        }
    }

    return [$conditions, $params];
}

// -----------------------------
// Relatório
// -----------------------------
$diag_sent = true; // sucesso ao chegar aqui

try {
    banner("DIAGNÓSTICO GLOBAL (atividades)");

    $totalAtv = q1($pdo, "SELECT COUNT(*) FROM atividades");
    echo "Total de atividades: $totalAtv\n";

    $hasAnos = hasColumn($pdo, 'atividades', 'anos_escolares');
    $hasEixos = hasColumn($pdo, 'atividades', 'eixos_bncc');
    $hasDisc = hasColumn($pdo, 'atividades', 'disciplinas_transversais');
    $hasIdEixo = hasColumn($pdo, 'atividades', 'id_eixo');

    echo "Colunas: anos_escolares=" . ($hasAnos ? 'SIM' : 'NÃO')
        . " | eixos_bncc=" . ($hasEixos ? 'SIM' : 'NÃO')
        . " | disciplinas_transversais=" . ($hasDisc ? 'SIM' : 'NÃO')
        . " | id_eixo(legado)=" . ($hasIdEixo ? 'SIM' : 'NÃO')
        . "\n";

    if (ob_get_level() > 0) {
        ob_flush();
        flush();
    }

    if ($hasAnos) {
        $jsonValid = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE anos_escolares IS NOT NULL AND TRIM(anos_escolares) != '' AND JSON_VALID(anos_escolares) = 1");
        $jsonInvalid = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE anos_escolares IS NOT NULL AND TRIM(anos_escolares) != '' AND JSON_VALID(anos_escolares) = 0");
        $empty = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE anos_escolares IS NULL OR TRIM(anos_escolares) = '' OR anos_escolares = '[]'");
        echo "anos_escolares: JSON válido=$jsonValid | JSON inválido=$jsonInvalid | vazio/nulo=$empty\n";

        $samples = qAll($pdo, "SELECT anos_escolares, COUNT(*) as c FROM atividades WHERE anos_escolares IS NOT NULL AND TRIM(anos_escolares) != '' GROUP BY anos_escolares ORDER BY c DESC LIMIT 10");
        echo "Top 10 valores de anos_escolares:\n";
        foreach ($samples as $s) {
            $val = (string)($s['anos_escolares'] ?? '');
            $c = (int)($s['c'] ?? 0);
            echo "  - ($c) $val\n";
        }
    }

    if ($hasEixos) {
        $jsonValid = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE eixos_bncc IS NOT NULL AND TRIM(eixos_bncc) != '' AND JSON_VALID(eixos_bncc) = 1");
        $jsonInvalid = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE eixos_bncc IS NOT NULL AND TRIM(eixos_bncc) != '' AND JSON_VALID(eixos_bncc) = 0");
        $empty = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE eixos_bncc IS NULL OR TRIM(eixos_bncc) = '' OR eixos_bncc = '[]'");
        echo "eixos_bncc: JSON válido=$jsonValid | JSON inválido=$jsonInvalid | vazio/nulo=$empty\n";
    }

    if (ob_get_level() > 0) {
        ob_flush();
        flush();
    }

    banner("DIAGNÓSTICO POR TRILHA");

    $sqlTrilhas = "SELECT * FROM trilhas WHERE ativo = 1 ORDER BY ordem ASC, titulo ASC";
    $sqlTrilhas .= " LIMIT " . (int)$limit;
    $trilhas = qAll($pdo, $sqlTrilhas);
    echo "Trilhas analisadas: " . count($trilhas) . " (limit=$limit)\n";
    echo "Modo: " . ($onlyZero ? "APENAS trilhas com 0 atividades" : "todas") . "\n\n";

    $zeros = 0;
    $ok = 0;

    foreach ($trilhas as $t) {
        $id = (string)($t['id'] ?? '');
        $titulo = (string)($t['titulo'] ?? '');
        $tipo = (string)($t['tipo'] ?? '');
        $valor = (string)($t['valor'] ?? '');

        $criterios = normalizeCriteriosFromTrilha($t);
        [$conds, $params] = buildWhereFromCriterios($pdo, $criterios);
        $count = 0;
        if (!empty($conds)) {
            $where = implode(' AND ', $conds);
            $count = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE $where", $params);
        }

        if ($count === 0) $zeros++; else $ok++;
        if ($onlyZero && $count !== 0) continue;

        echo "[$id] $titulo | tipo=$tipo | valor=$valor | criterios=" . count($criterios) . " | atividades=$count\n";

        if ($count === 0 && !empty($criterios)) {
            echo "  Diagnóstico por critério (contagem individual):\n";
            foreach ($criterios as $c) {
                $c1 = [$c];
                [$cConds, $cParams] = buildWhereFromCriterios($pdo, $c1);
                $cCount = 0;
                if (!empty($cConds)) {
                    $cWhere = implode(' AND ', $cConds);
                    $cCount = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE $cWhere", $cParams);
                }
                $ct = (string)($c['tipo'] ?? '');
                $cv = (string)($c['valor'] ?? '');
                echo "   - {$ct}={$cv} => $cCount\n";
            }
            if ($tipo === 'etapa' && trim($valor) !== '') {
                $cEtapa = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE etapa = ?", [$valor]);
                echo "  Extra: atividades com etapa='{$valor}' => $cEtapa\n";
            }
        }
    }

    banner("RESUMO");
    echo "Trilhas com atividades: $ok\n";
    echo "Trilhas zeradas: $zeros\n";
    echo "\nDica: use ?only_zero=1 para focar nas trilhas problemáticas.\n";

} catch (Throwable $e) {
    echo "\nERRO: " . $e->getMessage() . "\n";
    echo "Arquivo: " . $e->getFile() . " Linha: " . $e->getLine() . "\n";
}

