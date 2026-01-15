<?php
/**
 * Script para testar conexão com o banco de dados
 * Execute este arquivo no servidor para verificar se a conexão está funcionando
 */

// Configurações do banco
$host = 'localhost'; // Ajuste se necessário (pode ser IP do servidor)
$dbname = 'supernerds3';
$username = 'supernerds3';
$password = '*.BDnovaedu2026!';

echo "========================================\n";
echo "TESTE DE CONEXÃO COM BANCO DE DADOS\n";
echo "========================================\n\n";

echo "Tentando conectar...\n";
echo "Host: $host\n";
echo "Banco: $dbname\n";
echo "Usuário: $username\n\n";

try {
    // Tentar conectar
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conexão estabelecida com sucesso!\n\n";
    
    // Verificar tabelas
    echo "Verificando tabelas...\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "✅ Tabelas encontradas (" . count($tables) . "):\n";
        foreach ($tables as $table) {
            echo "   - $table\n";
        }
    } else {
        echo "⚠️  Nenhuma tabela encontrada. Execute o script database-structure.sql primeiro.\n";
    }
    
    echo "\n";
    
    // Verificar usuários
    echo "Verificando usuários...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Total de usuários: " . $result['total'] . "\n";
    
    if ($result['total'] > 0) {
        $stmt = $pdo->query("SELECT id, name, email, role FROM users LIMIT 5");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "\nUsuários encontrados:\n";
        foreach ($users as $user) {
            echo "   - {$user['name']} ({$user['email']}) - {$user['role']}\n";
        }
    }
    
    echo "\n========================================\n";
    echo "✅ Tudo funcionando corretamente!\n";
    echo "========================================\n";
    
} catch(PDOException $e) {
    echo "❌ ERRO na conexão:\n";
    echo "   Mensagem: " . $e->getMessage() . "\n";
    echo "\n";
    echo "Possíveis causas:\n";
    echo "   1. Host incorreto (tente o IP do servidor)\n";
    echo "   2. Banco de dados não existe\n";
    echo "   3. Credenciais incorretas\n";
    echo "   4. Servidor MySQL não está rodando\n";
    echo "\n";
    exit(1);
}
