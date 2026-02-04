<?php
declare(strict_types=1);

/**
 * Debug simples para inspecionar as tabelas de Formação Continuada.
 * 
 * URL sugerida:
 *   https://cursos.novaedubncc.com.br/api/debug-tabelas-cursos.php
 *
 * IMPORTANTE: remover este arquivo do servidor após o uso,
 * pois ele expõe dados internos em formato JSON.
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');

// Reutiliza a mesma conexão do restante da API EAD
require_once __DIR__ . '/config/database.php';

try {
    global $pdo;
    if (!isset($pdo)) {
        http_response_code(500);
        echo json_encode([
            'error' => true,
            'message' => 'Conexão com banco não disponível',
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $tables = [
        'cursos',
        'aulas',
        'aula_videos',
        'aula_avaliacao_perguntas',
    ];

    $result = [];

    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT * FROM {$table} LIMIT 500");
            $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $result[$table] = [
                'count' => count($rows),
                'rows' => $rows,
            ];
        } catch (Throwable $e) {
            $result[$table] = [
                'error' => true,
                'message' => $e->getMessage(),
            ];
        }
    }

    echo json_encode([
        'error' => false,
        'tables' => $result,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao consultar banco',
        'details' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

