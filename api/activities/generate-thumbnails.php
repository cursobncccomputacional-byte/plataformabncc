<?php
/**
 * Gerar thumbnails via IA e salvar no servidor
 *
 * POST /api/activities/generate-thumbnails.php
 * Body JSON:
 *  - blocked_only?: boolean (default true)
 *  - limit?: number (default 25, max 100)
 *  - overwrite?: boolean (default false) // sobrescreve thumbnail_url existente
 *  - activity_ids?: string[]            // opcional: gera só para IDs informados
 *
 * Requer: usuário root autenticado.
 * Usa OPENAI_API_KEY no ambiente do servidor.
 */
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(200);
  exit;
}

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
  if ($raw === false || trim($raw) === '') return [];
  $data = json_decode($raw, true);
  if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    json_response(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
  }
  return $data;
}

function get_base_url(): string {
  $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  return $protocol . '://' . $host;
}

function resolve_upload_dir(): array {
  // Reaproveita a lógica do /api/upload/index.php (com fallback)
  $uploadDirs = [
    __DIR__ . '/../../public/thumbnails',
    __DIR__ . '/../../../public/thumbnails',
    __DIR__ . '/../../thumbnails',
    __DIR__ . '/../../../thumbnails',
  ];

  $uploadDir = null;
  foreach ($uploadDirs as $dir) {
    if (is_dir($dir) && is_writable($dir)) {
      $uploadDir = $dir;
      break;
    }
  }

  if (!$uploadDir) {
    $baseDir = __DIR__ . '/../../public';
    if (!is_dir($baseDir)) {
      $baseDir = __DIR__ . '/../../..';
    }
    $uploadDir = $baseDir . '/thumbnails';
    if (!is_dir($uploadDir)) {
      if (!mkdir($uploadDir, 0755, true)) {
        json_response(500, ['error' => true, 'message' => 'Não foi possível criar diretório de thumbnails']);
      }
    }
  }

  // Caminho relativo para URL
  $relativePrefix = 'thumbnails/';
  if (strpos($uploadDir, '/public/') !== false) {
    $relativePrefix = 'public/thumbnails/';
  }

  return [$uploadDir, $relativePrefix];
}

function build_prompt(string $title, string $etapa, array $anosEscolares): string {
  $anoLabel = '';
  if (!empty($anosEscolares)) {
    $anoLabel = (string)($anosEscolares[0] ?? '');
  }

  $base = "Crie uma thumbnail 3D, moderna e educativa para uma atividade de pensamento computacional.\n";
  $base .= "Texto grande no topo, em português, com o título exato: \"$title\".\n";
  $base .= "Evite texto pequeno, evite marcas d'água, evite logotipos.\n";
  $base .= "Composição 16:9, cores vivas, aparência profissional.\n";

  if ($etapa === 'Educação Infantil') {
    return $base
      . "Estilo: 3D cartoon infantil, crianças pequenas (sem realismo), cenário simples (parque/rua), formas arredondadas, cores pastel vibrantes, clima amigável.\n";
  }

  if ($etapa === 'Anos Iniciais') {
    return $base
      . "Estilo: 3D cartoon escolar, sala de aula, professora e crianças pequenas, elementos lúdicos (cartões, blocos, teclado de papel), clima alegre.\n";
  }

  // Anos Finais
  $badge = $anoLabel !== '' ? "Inclua um pequeno selo no canto inferior esquerdo com \"$anoLabel\".\n" : '';
  return $base
    . "Estilo: mais tecnológico e moderno (anos finais), adolescentes, hologramas, ícones digitais, gráficos, sensação de tecnologia.\n"
    . $badge;
}

function openai_generate_image_b64(string $apiKey, string $prompt): string {
  $url = 'https://api.openai.com/v1/images/generations';
  $payload = [
    'model' => 'gpt-image-1.5',
    'prompt' => $prompt,
    'n' => 1,
    'size' => '1536x1024',   // landscape (bom para thumbnail)
    'quality' => 'medium',
    'output_format' => 'png',
    'background' => 'opaque',
  ];

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
  ]);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
  curl_setopt($ch, CURLOPT_TIMEOUT, 120);

  $resp = curl_exec($ch);
  $err = curl_error($ch);
  $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($resp === false) {
    throw new RuntimeException('Falha ao chamar OpenAI: ' . ($err ?: 'erro desconhecido'));
  }
  if ($status < 200 || $status >= 300) {
    throw new RuntimeException('OpenAI retornou HTTP ' . $status . ': ' . $resp);
  }
  $data = json_decode($resp, true);
  if (!is_array($data) || empty($data['data'][0]['b64_json'])) {
    throw new RuntimeException('Resposta inesperada da OpenAI');
  }
  return (string)$data['data'][0]['b64_json'];
}

// ----------------------------
// Auth
// ----------------------------
$user = getCurrentUser();
if (!$user) {
  json_response(401, ['error' => true, 'message' => 'Não autenticado']);
}
if (($user['role'] ?? '') !== 'root') {
  json_response(403, ['error' => true, 'message' => 'Acesso negado: apenas root']);
}

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  json_response(405, ['error' => true, 'message' => 'Método não permitido']);
}

/** @var PDO $pdo */
global $pdo;
if (!isset($pdo) || !$pdo instanceof PDO) {
  json_response(500, ['error' => true, 'message' => 'Conexão com banco indisponível']);
}

$apiKey = getenv('OPENAI_API_KEY') ?: '';
if (strlen($apiKey) < 10) {
  json_response(500, ['error' => true, 'message' => 'OPENAI_API_KEY não configurada no servidor']);
}

$body = read_json_body();
$blockedOnly = array_key_exists('blocked_only', $body) ? (bool)$body['blocked_only'] : true;
$overwrite = array_key_exists('overwrite', $body) ? (bool)$body['overwrite'] : false;
$limit = isset($body['limit']) && is_numeric($body['limit']) ? (int)$body['limit'] : 25;
$limit = max(1, min(100, $limit));
$activityIds = [];
if (isset($body['activity_ids']) && is_array($body['activity_ids'])) {
  $activityIds = array_values(array_filter($body['activity_ids'], fn($x) => is_string($x) && trim($x) !== ''));
}

[$uploadDir, $relativePrefix] = resolve_upload_dir();
$baseUrl = get_base_url();

try {
  $where = [];
  $params = [];

  if ($blockedOnly) {
    $where[] = "COALESCE(bloqueada, 0) = 1";
  }
  if (!$overwrite) {
    $where[] = "(thumbnail_url IS NULL OR TRIM(thumbnail_url) = '')";
  }
  if (!empty($activityIds)) {
    $placeholders = implode(',', array_fill(0, count($activityIds), '?'));
    $where[] = "id IN ($placeholders)";
    array_push($params, ...$activityIds);
  }

  $sql = "SELECT id, COALESCE(nome_atividade, titulo) as nome_atividade, etapa, anos_escolares FROM atividades";
  if (!empty($where)) {
    $sql .= " WHERE " . implode(' AND ', $where);
  }
  $sql .= " ORDER BY criado_em DESC";
  $sql .= " LIMIT " . (int)$limit;

  $st = $pdo->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $results = [];
  foreach ($rows as $r) {
    $id = (string)($r['id'] ?? '');
    $title = trim((string)($r['nome_atividade'] ?? ''));
    $etapa = (string)($r['etapa'] ?? '');

    $anosEscolares = [];
    $anosRaw = $r['anos_escolares'] ?? null;
    if (is_string($anosRaw) && trim($anosRaw) !== '') {
      $decoded = json_decode($anosRaw, true);
      if (is_array($decoded)) $anosEscolares = $decoded;
    } elseif (is_array($anosRaw)) {
      $anosEscolares = $anosRaw;
    }

    if ($id === '' || $title === '') {
      $results[] = ['id' => $id, 'ok' => false, 'message' => 'Registro inválido (id/título vazio)'];
      continue;
    }

    $prompt = build_prompt($title, $etapa, $anosEscolares);
    try {
      $b64 = openai_generate_image_b64($apiKey, $prompt);
      $bytes = base64_decode($b64, true);
      if ($bytes === false || strlen($bytes) < 1000) {
        throw new RuntimeException('Falha ao decodificar imagem (base64 inválido)');
      }

      $fileName = uniqid('thumb_', true) . '.png';
      $filePath = rtrim($uploadDir, '/\\') . DIRECTORY_SEPARATOR . $fileName;
      if (file_put_contents($filePath, $bytes) === false) {
        throw new RuntimeException('Falha ao salvar arquivo de thumbnail');
      }

      $fileUrl = $baseUrl . '/' . $relativePrefix . $fileName;

      $up = $pdo->prepare("UPDATE atividades SET thumbnail_url = ? WHERE id = ?");
      $up->execute([$fileUrl, $id]);

      $results[] = ['id' => $id, 'ok' => true, 'thumbnail_url' => $fileUrl];
    } catch (Throwable $e) {
      $results[] = ['id' => $id, 'ok' => false, 'message' => $e->getMessage()];
    }
  }

  json_response(200, [
    'error' => false,
    'message' => 'Processo concluído',
    'count' => count($results),
    'results' => $results,
  ]);
} catch (Throwable $e) {
  json_response(500, ['error' => true, 'message' => $e->getMessage()]);
}

