<?php
/**
 * Script para verificar estrutura da tabela atividades
 * Acesse: https://novaedubncc.com.br/api/activities/check-table.php
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Verificar Estrutura da Tabela 'atividades'</h1>";

try {
    require_once __DIR__ . '/../config/database.php';
    global $pdo;
    
    if (!isset($pdo)) {
        echo "❌ Erro: Não foi possível conectar ao banco de dados<br>";
        exit;
    }
    
    echo "✅ Conexão com banco estabelecida<br><br>";
    
    // Verificar estrutura atual
    $stmt = $pdo->query("DESCRIBE atividades");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>Estrutura Atual da Tabela 'atividades':</h2>";
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    $existingColumns = [];
    foreach ($columns as $col) {
        $existingColumns[] = $col['Field'];
        echo "<tr>";
        echo "<td><strong>{$col['Field']}</strong></td>";
        echo "<td>{$col['Type']}</td>";
        echo "<td>{$col['Null']}</td>";
        echo "<td>{$col['Key']}</td>";
        echo "<td>{$col['Default']}</td>";
        echo "<td>{$col['Extra']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Campos esperados pela nova API
    $expectedColumns = [
        'id' => 'VARCHAR(255) PRIMARY KEY',
        'nome_atividade' => 'VARCHAR(255) NOT NULL',
        'descricao' => 'TEXT',
        'tipo' => "ENUM('Plugada', 'Desplugada') NOT NULL",
        'etapa' => "ENUM('Educação Infantil', 'Anos Iniciais', 'Anos Finais') NOT NULL",
        'anos_escolares' => 'JSON',
        'eixos_bncc' => 'JSON',
        'duracao' => 'VARCHAR(50)',
        'nivel_dificuldade' => "ENUM('Fácil', 'Médio', 'Difícil') NOT NULL",
        'thumbnail_url' => 'VARCHAR(500)',
        'video_url' => 'VARCHAR(500) NOT NULL',
        'pdf_estrutura_pedagogica_url' => 'VARCHAR(500)',
        'material_apoio_url' => 'VARCHAR(500)',
        'link_video' => 'VARCHAR(500)',
        'criado_em' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        'atualizado_em' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        'criado_por' => 'VARCHAR(255)',
    ];
    
    echo "<h2>Análise:</h2>";
    $missingColumns = [];
    $differentColumns = [];
    
    foreach ($expectedColumns as $colName => $colType) {
        if (!in_array($colName, $existingColumns)) {
            $missingColumns[] = $colName;
            echo "❌ Campo <strong>{$colName}</strong> está faltando<br>";
        } else {
            echo "✅ Campo <strong>{$colName}</strong> existe<br>";
        }
    }
    
    if (empty($missingColumns)) {
        echo "<br><strong style='color: green;'>✅ Todos os campos necessários existem!</strong><br>";
        echo "A tabela está compatível com a nova API.<br>";
    } else {
        echo "<br><strong style='color: red;'>❌ Faltam campos na tabela!</strong><br>";
        echo "<h3>Campos faltando:</h3><ul>";
        foreach ($missingColumns as $col) {
            echo "<li>{$col}</li>";
        }
        echo "</ul>";
        echo "<p><strong>Próximo passo:</strong> Execute o script SQL para adicionar os campos faltantes.</p>";
    }
    
    // Verificar se há campos extras na tabela antiga
    $extraColumns = array_diff($existingColumns, array_keys($expectedColumns));
    if (!empty($extraColumns)) {
        echo "<h3>Campos extras na tabela (podem ser ignorados):</h3><ul>";
        foreach ($extraColumns as $col) {
            echo "<li>{$col}</li>";
        }
        echo "</ul>";
    }
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "<br>";
}
