<?php
/**
 * Endpoint de Logout
 * POST /api/auth/logout
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

session_start();

// Registrar logout no banco de dados antes de destruir a sessão
try {
    global $pdo;
    
    $sessaoId = $_SESSION['sessao_id'] ?? null;
    $userId = $_SESSION['user_id'] ?? null;
    $tipoLogout = $_POST['tipo_logout'] ?? ($_GET['tipo_logout'] ?? 'manual');
    
    // Verificar se a tabela sessoes existe
    $checkTable = $pdo->query("SHOW TABLES LIKE 'sessoes'");
    if ($checkTable->rowCount() > 0 && $sessaoId) {
        // Buscar data de login da sessão
        $stmt = $pdo->prepare("SELECT data_login FROM sessoes WHERE id = ?");
        $stmt->execute([$sessaoId]);
        $sessao = $stmt->fetch();
        
        if ($sessao) {
            $dataLogin = new DateTime($sessao['data_login']);
            $dataLogout = new DateTime();
            $tempoSessao = $dataLogout->getTimestamp() - $dataLogin->getTimestamp();
            
            $stmt = $pdo->prepare("
                UPDATE sessoes 
                SET data_logout = NOW(), tempo_sessao = ?, tipo_logout = ?
                WHERE id = ?
            ");
            $stmt->execute([$tempoSessao, $tipoLogout, $sessaoId]);
        }
    } elseif ($checkTable->rowCount() > 0 && $userId) {
        // Se não tiver sessao_id, buscar sessão ativa mais recente
        $stmt = $pdo->prepare("
            SELECT id, data_login FROM sessoes 
            WHERE usuario_id = ? AND data_logout IS NULL 
            ORDER BY data_login DESC LIMIT 1
        ");
        $stmt->execute([$userId]);
        $sessao = $stmt->fetch();
        
        if ($sessao) {
            $dataLogin = new DateTime($sessao['data_login']);
            $dataLogout = new DateTime();
            $tempoSessao = $dataLogout->getTimestamp() - $dataLogin->getTimestamp();
            
            $stmt = $pdo->prepare("
                UPDATE sessoes 
                SET data_logout = NOW(), tempo_sessao = ?, tipo_logout = ?
                WHERE id = ?
            ");
            $stmt->execute([$tempoSessao, $tipoLogout, $sessao['id']]);
        }
    }
} catch(PDOException $e) {
    // Ignorar erro se a tabela não existir ainda
    error_log("Erro ao registrar logout: " . $e->getMessage());
}

// Destruir sessão
session_destroy();

http_response_code(200);
echo json_encode([
    'error' => false,
    'message' => 'Logout realizado com sucesso'
]);
