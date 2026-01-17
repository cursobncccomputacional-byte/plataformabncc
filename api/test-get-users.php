<?php
/**
 * Script de teste para verificar se o GET /users está funcionando
 * 
 * Acesse: https://novaedubncc.com.br/api/test-get-users.php
 */

// Definir headers para retornar texto simples
header('Content-Type: text/plain; charset=utf-8');

echo "═══════════════════════════════════════════════════════════\n";
echo "  TESTE DE GET /users\n";
echo "═══════════════════════════════════════════════════════════\n\n";

try {
    // Incluir configurações
    require_once __DIR__ . '/config/database.php';
    require_once __DIR__ . '/config/auth.php';
    
    echo "✅ Arquivos de configuração carregados\n\n";
    
    // Verificar conexão
    global $pdo;
    if (!isset($pdo)) {
        echo "❌ ERRO: Variável \$pdo não está definida!\n";
        exit(1);
    }
    
    echo "✅ Conexão com banco disponível\n\n";
    
    // Verificar sessão
    session_start();
    echo "📋 INFORMAÇÕES DA SESSÃO:\n";
    echo "   Session ID: " . session_id() . "\n";
    echo "   user_id: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'NÃO DEFINIDO') . "\n";
    echo "   user_role: " . (isset($_SESSION['user_role']) ? $_SESSION['user_role'] : 'NÃO DEFINIDO') . "\n\n";
    
    // Tentar autenticar
    echo "🔍 Tentando autenticar...\n";
    try {
        $currentUser = requireAuth();
        echo "✅ Usuário autenticado: {$currentUser['name']} ({$currentUser['role']})\n\n";
    } catch (Exception $e) {
        echo "❌ ERRO na autenticação: " . $e->getMessage() . "\n";
        echo "   Isso pode ser normal se você não estiver logado.\n";
        echo "   Continuando com teste de query...\n\n";
    }
    
    // Testar query
    echo "🔍 Testando query SELECT...\n";
    try {
        $stmt = $pdo->query("SELECT * FROM usuarios ORDER BY data_criacao DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "✅ Query executada com sucesso!\n";
        echo "📊 Total de usuários encontrados: " . count($users) . "\n\n";
        
        if (count($users) > 0) {
            echo "📋 PRIMEIROS 3 USUÁRIOS:\n";
            foreach (array_slice($users, 0, 3) as $user) {
                echo "   - {$user['nome']} ({$user['usuario']}) - {$user['nivel_acesso']}\n";
            }
        } else {
            echo "⚠️  Nenhum usuário encontrado no banco\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ ERRO na query: " . $e->getMessage() . "\n";
        echo "   Código: " . $e->getCode() . "\n";
        exit(1);
    }
    
    echo "\n";
    echo "═══════════════════════════════════════════════════════════\n";
    echo "  ✅ TESTE CONCLUÍDO COM SUCESSO!\n";
    echo "═══════════════════════════════════════════════════════════\n";
    
} catch (Exception $e) {
    echo "❌ ERRO GERAL: " . $e->getMessage() . "\n";
    echo "   Arquivo: " . $e->getFile() . "\n";
    echo "   Linha: " . $e->getLine() . "\n";
    exit(1);
}

?>
