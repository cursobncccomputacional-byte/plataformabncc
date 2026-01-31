<?php
/**
 * Diagnóstico de Trilhas x Atividades
 *
 * Uso (Windows / PowerShell) na raiz do projeto:
 *   php .\scripts\diagnostico-trilhas.php
 *
 * Opcional:
 *   php .\scripts\diagnostico-trilhas.php --only-zero   (mostra só trilhas com 0 atividades)
 *   php .\scripts\diagnostico-trilhas.php --limit=200   (limita quantidade de trilhas analisadas)
 *
 * Saída: relatório em texto (stdout).
 */
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '1');

// Se rodar via web por engano, força texto puro
if (PHP_SAPI !== 'cli') {
  header('Content-Type: text/plain; charset=utf-8');
}

require_once __DIR__ . '/../api/config/database.php';

if (!isset($pdo) || !$pdo instanceof PDO) {
  fwrite(STDERR, "Erro: conexão PDO não disponível.\n");
  exit(1);
}

// -----------------------------
// Args
// -----------------------------
$onlyZero = in_array('--only-zero', $argv ?? [], true);
$limit = null;
foreach (($argv ?? []) as $a) {
  if (preg_match('/^--limit=(\d+)$/', (string)$a, $m)) {
    $limit = max(1, (int)$m[1]);
  }
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
  $st = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
  $st->execute([$column]);
  return $st->rowCount() > 0;
}

function banner(string $title): void {
  echo "\n==============================\n";
  echo $title . "\n";
  echo "==============================\n";
}

function yearVariants(string $label): array {
  // Ex: "1º Ano" -> ["1º Ano","1° Ano","1 Ano","1ano"]
  $v = [];
  $v[] = $label;
  $v[] = str_replace('º', '°', $label);
  $v[] = preg_replace('/\s*[º°]\s*/u', ' ', $label) ?? $label;
  $v[] = preg_replace('/\s+/u', '', $v[2] ?? $label); // "1Ano" (quase nunca)
  // Também adiciona formato id (1ano, 2ano...) quando aplicável
  if (preg_match('/^(\d+)\s*[º°]?\s*Ano$/u', $label, $m)) {
    $v[] = ((int)$m[1]) . 'ano';
  }
  // Normaliza
  $out = [];
  foreach ($v as $x) {
    $x = trim((string)$x);
    if ($x !== '' && !in_array($x, $out, true)) $out[] = $x;
  }
  return $out;
}

function makeContainsOrLike(string $col, string $value): array {
  // Retorna [sqlFragment, params]
  // Usa JSON_VALID para não quebrar quando col for texto legado
  $json = json_encode($value, JSON_UNESCAPED_UNICODE);
  $like = '%' . $value . '%';
  return [
    "(IF(JSON_VALID($col), JSON_CONTAINS($col, ?), 0) = 1 OR COALESCE($col,'') LIKE ?)",
    [$json, $like]
  ];
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
        // COALESCE(eixos_bncc, JSON_ARRAY(id_eixo)) para cobrir legado
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
      // Etapas genéricas
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

      // Ano específico dentro de "etapa" (legado)
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

      // Educação Infantil / outros
      $conditions[] = "etapa = ?";
      $params[] = $valor;
      continue;
    }
  }

  return [$conditions, $params];
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

  // fallback tipo/valor
  $tipo = (string)($trilha['tipo'] ?? '');
  $valor = (string)($trilha['valor'] ?? '');
  if ($tipo !== '' && trim($valor) !== '') {
    $criterios[] = ['tipo' => $tipo, 'valor' => $valor];
  }
  return $criterios;
}

// -----------------------------
// Pré-diagnóstico global
// -----------------------------
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

if ($hasAnos) {
  $jsonValid = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE anos_escolares IS NOT NULL AND TRIM(anos_escolares) != '' AND JSON_VALID(anos_escolares) = 1");
  $jsonInvalid = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE anos_escolares IS NOT NULL AND TRIM(anos_escolares) != '' AND JSON_VALID(anos_escolares) = 0");
  $empty = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE anos_escolares IS NULL OR TRIM(anos_escolares) = '' OR anos_escolares = '[]'");
  echo "anos_escolares: JSON válido=$jsonValid | JSON inválido=$jsonInvalid | vazio/nulo=$empty\n";

  $samples = qAll($pdo, "SELECT anos_escolares, COUNT(*) as c FROM atividades WHERE anos_escolares IS NOT NULL AND TRIM(anos_escolares) != '' GROUP BY anos_escolares ORDER BY c DESC LIMIT 10");
  echo "Top 10 valores de anos_escolares (para ver formato):\n";
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

// -----------------------------
// Trilhas
// -----------------------------
banner("DIAGNÓSTICO POR TRILHA");

$sqlTrilhas = "SELECT * FROM trilhas WHERE ativo = 1 ORDER BY ordem ASC, titulo ASC";
if ($limit !== null) {
  $sqlTrilhas .= " LIMIT " . (int)$limit;
}

$trilhas = qAll($pdo, $sqlTrilhas);
echo "Trilhas analisadas: " . count($trilhas) . ($limit ? " (limit=$limit)" : "") . "\n";
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
      echo "   - {$c['tipo']}={$c['valor']} => $cCount\n";
    }

    // Amostra rápida de atividade com etapa igual (se aplicável)
    if ($tipo === 'etapa' && trim($valor) !== '') {
      $cEtapa = q1($pdo, "SELECT COUNT(*) FROM atividades WHERE etapa = ?", [$valor]);
      echo "  Extra: atividades com etapa='{$valor}' => $cEtapa\n";
    }
  }
}

banner("RESUMO");
echo "Trilhas com atividades: $ok\n";
echo "Trilhas zeradas: $zeros\n";
echo "\nDica: rode com --only-zero para focar nas trilhas problemáticas.\n";

