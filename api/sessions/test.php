<?php
/**
 * Script de teste para verificar se as tabelas de sessões existem
 * Acesse: /api/sessions/test.php
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    global $pdo;
    
    $results = [
        'database_connected' => $pdo !== null,
        'tables' => []
    ];
    
    // Verificar se tabela sessoes existe
    $checkSessoes = $pdo->query("SHOW TABLES LIKE 'sessoes'");
    $sessoesExists = $checkSessoes->rowCount() > 0;
    $results['tables']['sessoes'] = [
        'exists' => $sessoesExists,
        'row_count' => $checkSessoes->rowCount()
    ];
    
    if ($sessoesExists) {
        // Verificar estrutura da tabela
        $stmt = $pdo->query("DESCRIBE sessoes");
        $results['tables']['sessoes']['columns'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Contar registros
        $countStmt = $pdo->query("SELECT COUNT(*) as total FROM sessoes");
        $count = $countStmt->fetch();
        $results['tables']['sessoes']['total_records'] = $count['total'] ?? 0;
    }
    
    // Verificar se tabela atividades_sessao existe
    $checkAtividades = $pdo->query("SHOW TABLES LIKE 'atividades_sessao'");
    $atividadesExists = $checkAtividades->rowCount() > 0;
    $results['tables']['atividades_sessao'] = [
        'exists' => $atividadesExists,
        'row_count' => $checkAtividades->rowCount()
    ];
    
    if ($atividadesExists) {
        // Verificar estrutura da tabela
        $stmt = $pdo->query("DESCRIBE atividades_sessao");
        $results['tables']['atividades_sessao']['columns'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Contar registros
        $countStmt = $pdo->query("SELECT COUNT(*) as total FROM atividades_sessao");
        $count = $countStmt->fetch();
        $results['tables']['atividades_sessao']['total_records'] = $count['total'] ?? 0;
    }
    
    // Verificar se campo criado_por existe na tabela usuarios
    $checkCriadoPor = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'criado_por'");
    $results['usuarios_criado_por'] = [
        'exists' => $checkCriadoPor->rowCount() > 0
    ];
    
    // Testar inserção simples (sem commit)
    if ($sessoesExists) {
        try {
            $testId = 'test_' . time();
            $testStmt = $pdo->prepare("INSERT INTO sessoes (id, usuario_id, session_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)");
            $testStmt->execute([$testId, 'test_user', 'test_session', '127.0.0.1', 'Test']);
            
            // Deletar registro de teste
            $deleteStmt = $pdo->prepare("DELETE FROM sessoes WHERE id = ?");
            $deleteStmt->execute([$testId]);
            
            $results['insert_test'] = 'success';
        } catch(PDOException $e) {
            $results['insert_test'] = [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'error_info' => $e->errorInfo
            ];
        }
    }
    
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'error_info' => $e->errorInfo ?? null
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
