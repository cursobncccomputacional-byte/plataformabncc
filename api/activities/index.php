<?php
/**
 * Endpoint de atividades (JSON)
 *
 * GET    /api/activities/index.php  -> lista todas as atividades do banco
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// CORS + preflight
require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

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

// Atividades são públicas (não requer autenticação obrigatória)
// Mas tentamos obter usuário atual se houver sessão para logs futuros
$currentUser = getCurrentUser();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method !== 'GET') {
    json_response(405, ['error' => true, 'message' => 'Método não permitido']);
}

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response(500, ['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    }

    // Verificar se a tabela existe (pode ser 'activities' ou 'atividades')
    $stmt = $pdo->query("
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN ('activities', 'atividades')
        LIMIT 1
    ");
    $table = $stmt->fetch();
    
    if (!$table) {
        json_response(200, [
            'error' => false,
            'activities' => [],
            'message' => 'Tabela de atividades não encontrada no banco'
        ]);
    }

    $tableName = $table['TABLE_NAME'];

    // Buscar todas as atividades
    $stmt = $pdo->query("
        SELECT 
            id,
            title,
            description,
            type,
            school_years,
            axis_id,
            axis_ids,
            knowledge_object_id,
            skill_ids,
            duration,
            difficulty,
            materials,
            objectives,
            thumbnail_url,
            video_url,
            document_url,
            pedagogical_pdf_url,
            material_pdf_url,
            created_at
        FROM {$tableName}
        ORDER BY created_at DESC
    ");

    $activities = [];
    while ($row = $stmt->fetch()) {
        // Converter JSON strings para arrays
        $schoolYears = json_decode($row['school_years'] ?? '[]', true) ?: [];
        $axisIds = json_decode($row['axis_ids'] ?? '[]', true) ?: [];
        $skillIds = json_decode($row['skill_ids'] ?? '[]', true) ?: [];
        $materials = json_decode($row['materials'] ?? '[]', true) ?: [];
        $objectives = json_decode($row['objectives'] ?? '[]', true) ?: [];

        $activities[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'description' => $row['description'] ?: 'Sem descrição',
            'type' => $row['type'],
            'schoolYears' => $schoolYears,
            'axisId' => $row['axis_id'] ?: '',
            'axisIds' => $axisIds,
            'knowledgeObjectId' => $row['knowledge_object_id'] ?: '',
            'skillIds' => $skillIds,
            'duration' => $row['duration'] ? (int)$row['duration'] : 0,
            'difficulty' => $row['difficulty'] ?: 'medio',
            'materials' => $materials,
            'objectives' => $objectives,
            'thumbnail_url' => $row['thumbnail_url'] ?: '',
            'video_url' => $row['video_url'] ?: null,
            'document_url' => $row['document_url'] ?: null,
            'pedagogical_pdf_url' => $row['pedagogical_pdf_url'] ?: null,
            'material_pdf_url' => $row['material_pdf_url'] ?: null,
            'created_at' => $row['created_at'],
        ];
    }

    json_response(200, [
        'error' => false,
        'activities' => $activities,
        'count' => count($activities)
    ]);

} catch (PDOException $e) {
    error_log('Erro ao buscar atividades: ' . $e->getMessage());
    json_response(500, [
        'error' => true,
        'message' => 'Erro ao buscar atividades do banco de dados'
    ]);
} catch (Exception $e) {
    error_log('Erro geral: ' . $e->getMessage());
    json_response(500, [
        'error' => true,
        'message' => 'Erro inesperado: ' . $e->getMessage()
    ]);
}
