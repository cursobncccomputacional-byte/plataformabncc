<?php
/**
 * API de Vídeos por Aula (partes)
 *
 * GET    /api/aula-videos/index.php?aula_id=xxx -> lista vídeos de uma aula
 * GET    /api/aula-videos/index.php?id=xxx -> detalhes do vídeo
 * POST   /api/aula-videos/index.php -> cria vídeo (requer can_manage_courses)
 * PUT    /api/aula-videos/index.php -> atualiza vídeo (requer can_manage_courses)
 * DELETE /api/aula-videos/index.php -> deleta vídeo (requer can_manage_courses)
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

function json_response_av(int $status, array $payload): void {
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
        json_response_av(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$currentUser = getCurrentUser();
if (!$currentUser) {
    json_response_av(401, ['error' => true, 'message' => 'Não autenticado']);
}

// Permissão para escrita
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    $userRole = strtolower($currentUser['role'] ?? '');
    $canManage = (bool)($currentUser['can_manage_courses'] ?? false);
    if ($userRole !== 'root' && !$canManage) {
        json_response_av(403, ['error' => true, 'message' => 'Permissão insuficiente para gerenciar vídeos.']);
    }
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response_av(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        $aulaId = $_GET['aula_id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM aula_videos WHERE id = ?");
            $stmt->execute([$id]);
            $video = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$video) {
                json_response_av(404, ['error' => true, 'message' => 'Vídeo não encontrado']);
            }
            json_response_av(200, ['error' => false, 'video' => $video]);
        }

        if (!$aulaId) {
            json_response_av(400, ['error' => true, 'message' => 'Informe id ou aula_id']);
        }

        $stmt = $pdo->prepare("
            SELECT *
            FROM aula_videos
            WHERE aula_id = ? AND ativo = 1
            ORDER BY ordem ASC, criado_em ASC
        ");
        $stmt->execute([$aulaId]);
        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        json_response_av(200, ['error' => false, 'videos' => $videos, 'count' => count($videos)]);
    }

    if ($method === 'POST') {
        $data = read_json_body();

        $id = trim((string)($data['id'] ?? ''));
        $aulaId = trim((string)($data['aula_id'] ?? ''));
        $titulo = trim((string)($data['titulo'] ?? ''));
        $descricao = isset($data['descricao']) ? trim((string)$data['descricao']) : null;
        $videoUrl = trim((string)($data['video_url'] ?? ''));
        $duracao = isset($data['duracao_video']) ? (int)$data['duracao_video'] : 0;
        $thumb = isset($data['thumbnail_url']) ? trim((string)$data['thumbnail_url']) : null;
        $ordem = isset($data['ordem']) ? (int)$data['ordem'] : 0;
        $linksUteis = isset($data['links_uteis']) && is_array($data['links_uteis']) ? json_encode($data['links_uteis']) : null;
        $pdfsDownload = isset($data['pdfs_download']) && is_array($data['pdfs_download']) ? json_encode($data['pdfs_download']) : null;

        if ($aulaId === '' || $titulo === '' || $videoUrl === '') {
            json_response_av(400, ['error' => true, 'message' => 'Campos obrigatórios: aula_id, titulo, video_url']);
        }

        // Aula existe?
        $checkAula = $pdo->prepare("SELECT id FROM aulas WHERE id = ?");
        $checkAula->execute([$aulaId]);
        if (!$checkAula->fetch()) {
            json_response_av(404, ['error' => true, 'message' => 'Aula não encontrada']);
        }

        // Se id não foi enviado ou está vazio, gerar um único (evita 409 por ID duplicado)
        if ($id === '') {
            $id = $aulaId . '-parte-' . bin2hex(random_bytes(8));
        }

        // ID único?
        $check = $pdo->prepare("SELECT id FROM aula_videos WHERE id = ?");
        $check->execute([$id]);
        if ($check->fetch()) {
            // Colisão improvável: gerar novo id e tentar novamente
            $id = $aulaId . '-parte-' . bin2hex(random_bytes(8));
            $check->execute([$id]);
            if ($check->fetch()) {
                json_response_av(409, ['error' => true, 'message' => 'Vídeo com este ID já existe. Tente novamente.']);
            }
        }

        $stmt = $pdo->prepare("
            INSERT INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo, links_uteis, pdfs_download)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ");
        $stmt->execute([$id, $aulaId, $titulo, $descricao, $videoUrl, $duracao, $thumb, $ordem, $linksUteis, $pdfsDownload]);

        json_response_av(201, ['error' => false, 'message' => 'Vídeo criado com sucesso', 'id' => $id]);
    }

    if ($method === 'PUT') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));
        if ($id === '') {
            json_response_av(400, ['error' => true, 'message' => 'ID do vídeo é obrigatório']);
        }

        $check = $pdo->prepare("SELECT id FROM aula_videos WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            json_response_av(404, ['error' => true, 'message' => 'Vídeo não encontrado']);
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
        if (isset($data['video_url'])) {
            $updates[] = "video_url = ?";
            $params[] = trim((string)$data['video_url']);
        }
        if (isset($data['duracao_video'])) {
            $updates[] = "duracao_video = ?";
            $params[] = (int)$data['duracao_video'];
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
        if (array_key_exists('links_uteis', $data)) {
            $updates[] = "links_uteis = ?";
            $params[] = is_array($data['links_uteis']) ? json_encode($data['links_uteis']) : ($data['links_uteis'] ?? null);
        }
        if (array_key_exists('pdfs_download', $data)) {
            $updates[] = "pdfs_download = ?";
            $params[] = is_array($data['pdfs_download']) ? json_encode($data['pdfs_download']) : ($data['pdfs_download'] ?? null);
        }

        if (!$updates) {
            json_response_av(400, ['error' => true, 'message' => 'Nenhum campo para atualizar']);
        }

        $params[] = $id;
        $sql = "UPDATE aula_videos SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        json_response_av(200, ['error' => false, 'message' => 'Vídeo atualizado com sucesso']);
    }

    if ($method === 'DELETE') {
        $data = read_json_body();
        $id = trim((string)($data['id'] ?? ''));
        if ($id === '') {
            json_response_av(400, ['error' => true, 'message' => 'ID do vídeo é obrigatório']);
        }

        $check = $pdo->prepare("SELECT id FROM aula_videos WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            json_response_av(404, ['error' => true, 'message' => 'Vídeo não encontrado']);
        }

        // Soft delete
        $stmt = $pdo->prepare("UPDATE aula_videos SET ativo = 0 WHERE id = ?");
        $stmt->execute([$id]);

        json_response_av(200, ['error' => false, 'message' => 'Vídeo removido com sucesso']);
    }

    json_response_av(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (PDOException $e) {
    error_log('Erro PDO (aula-videos): ' . $e->getMessage());
    json_response_av(500, ['error' => true, 'message' => 'Erro no banco de dados', 'details' => $e->getMessage()]);
} catch (Exception $e) {
    error_log('Erro geral (aula-videos): ' . $e->getMessage());
    json_response_av(500, ['error' => true, 'message' => 'Erro interno do servidor', 'details' => $e->getMessage()]);
}

