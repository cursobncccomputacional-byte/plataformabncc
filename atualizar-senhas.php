<?php
/**
 * Script para atualizar as senhas dos usuários iniciais
 * Execute este arquivo no servidor após criar o banco
 */

// Configurações do banco
$host = 'localhost'; // Ajuste se necessário
$dbname = 'supernerds3';
$username = 'supernerds3';
$password = '*.BDnovaedu2026!';

try {
    // Conectar ao banco
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conexão estabelecida com sucesso!\n\n";
    
    // Gerar hashes das senhas
    $rootHash = password_hash('root123', PASSWORD_DEFAULT);
    $adminHash = password_hash('admin123', PASSWORD_DEFAULT);
    
    // Atualizar senha do root
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = 'root@plataformabncc.com'");
    $stmt->execute([$rootHash]);
    echo "✅ Senha do root atualizada!\n";
    
    // Atualizar senha do admin
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = 'admin@plataformabncc.com'");
    $stmt->execute([$adminHash]);
    echo "✅ Senha do admin atualizada!\n\n";
    
    // Verificar usuários
    $stmt = $pdo->query("SELECT id, name, email, role FROM users WHERE role IN ('root', 'admin')");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Usuários criados:\n";
    foreach ($users as $user) {
        echo "- {$user['name']} ({$user['email']}) - {$user['role']}\n";
    }
    
    echo "\n✅ Senhas atualizadas com sucesso!\n";
    
} catch(PDOException $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}
