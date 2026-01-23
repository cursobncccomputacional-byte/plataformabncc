<?php
/**
 * Script de debug para API de Atividades
 * Acesse: https://novaedubncc.com.br/api/activities/debug.php
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Debug - API de Atividades</h1>";

// Teste 1: Verificar se os arquivos de config existem
echo "<h2>Teste 1: Verificar arquivos de configuração</h2>";
$configFiles = [
    __DIR__ . '/../config/cors.php',
    __DIR__ . '/../config/database.php',
    __DIR__ . '/../config/auth.php',
];

foreach ($configFiles as $file) {
    if (file_exists($file)) {
        echo "✅ " . basename($file) . " existe<br>";
    } else {
        echo "❌ " . basename($file) . " NÃO existe em: " . $file . "<br>";
    }
}

// Teste 2: Tentar carregar database
echo "<h2>Teste 2: Conexão com banco de dados</h2>";
try {
    require_once __DIR__ . '/../config/database.php';
    global $pdo;
    if (isset($pdo)) {
        echo "✅ Conexão com banco criada<br>";
    } else {
        echo "❌ Variável \$pdo não foi criada<br>";
    }
} catch (Exception $e) {
    echo "❌ Erro ao carregar database.php: " . $e->getMessage() . "<br>";
}

// Teste 3: Verificar se a tabela atividades existe
echo "<h2>Teste 3: Verificar tabela 'atividades'</h2>";
try {
    if (isset($pdo)) {
        $stmt = $pdo->query("SHOW TABLES LIKE 'atividades'");
        $table = $stmt->fetch();
        if ($table) {
            echo "✅ Tabela 'atividades' existe<br>";
            
            // Verificar estrutura
            $stmt = $pdo->query("DESCRIBE atividades");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "<h3>Colunas da tabela:</h3>";
            echo "<ul>";
            foreach ($columns as $col) {
                echo "<li><strong>{$col['Field']}</strong> - {$col['Type']}</li>";
            }
            echo "</ul>";
            
            // Contar registros
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM atividades");
            $count = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "<p>Total de atividades: <strong>{$count['total']}</strong></p>";
        } else {
            echo "❌ Tabela 'atividades' NÃO existe no banco de dados<br>";
            echo "<p><strong>Ação necessária:</strong> Execute o script SQL <code>cursos/.sql/migrations-cms-rbac.sql</code> no banco de dados.</p>";
        }
    } else {
        echo "❌ Não foi possível verificar - conexão com banco não disponível<br>";
    }
} catch (PDOException $e) {
    echo "❌ Erro ao verificar tabela: " . $e->getMessage() . "<br>";
}

// Teste 4: Verificar função getCurrentUser
echo "<h2>Teste 4: Função getCurrentUser</h2>";
try {
    require_once __DIR__ . '/../config/auth.php';
    if (function_exists('getCurrentUser')) {
        echo "✅ Função getCurrentUser existe<br>";
        $user = getCurrentUser();
        if ($user) {
            echo "✅ Usuário atual encontrado: " . ($user['name'] ?? $user['id']) . "<br>";
            echo "<pre>" . print_r($user, true) . "</pre>";
        } else {
            echo "⚠️ Nenhum usuário autenticado (normal se acessar diretamente)<br>";
        }
    } else {
        echo "❌ Função getCurrentUser não existe<br>";
    }
} catch (Exception $e) {
    echo "❌ Erro ao carregar auth.php: " . $e->getMessage() . "<br>";
}

// Teste 5: Testar query SELECT simples
echo "<h2>Teste 5: Testar query SELECT</h2>";
try {
    if (isset($pdo)) {
        $stmt = $pdo->query("SELECT 1 as test");
        $result = $stmt->fetch();
        if ($result) {
            echo "✅ Query SELECT funciona<br>";
        }
    }
} catch (PDOException $e) {
    echo "❌ Erro na query: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<p><strong>Próximos passos:</strong></p>";
echo "<ol>";
echo "<li>Se a tabela 'atividades' não existe, execute o script SQL: <code>cursos/.sql/migrations-cms-rbac.sql</code></li>";
echo "<li>Verifique os logs de erro do PHP no servidor</li>";
echo "<li>Teste a API diretamente: <code>/api/activities/index.php</code></li>";
echo "</ol>";
