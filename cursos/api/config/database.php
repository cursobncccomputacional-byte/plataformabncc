<?php
/**
 * Conexão com Banco de Dados EAD
 */

declare(strict_types=1);

$config = require __DIR__ . '/../../config-database-ead.php';

try {
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['database'],
        $config['charset']
    );

    $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
} catch (PDOException $e) {
    error_log('Erro de conexão EAD: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => true, 'message' => 'Erro de conexão com banco de dados']);
    exit;
}
