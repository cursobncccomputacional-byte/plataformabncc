<?php
/**
 * Script para testar se a sessão está sendo mantida
 * 
 * Acesse: https://novaedubncc.com.br/api/test-session.php
 */

header('Content-Type: text/plain; charset=utf-8');

echo "═══════════════════════════════════════════════════════════\n";
echo "  TESTE DE SESSÃO\n";
echo "═══════════════════════════════════════════════════════════\n\n";

session_start();

echo "📋 INFORMAÇÕES DA SESSÃO:\n";
echo "   Session ID: " . session_id() . "\n";
echo "   Session Name: " . session_name() . "\n";
echo "   Session Status: " . (session_status() === PHP_SESSION_ACTIVE ? 'Ativa' : 'Inativa') . "\n";
echo "\n";

echo "📋 DADOS DA SESSÃO:\n";
if (isset($_SESSION['user_id'])) {
    echo "   ✅ user_id encontrado: {$_SESSION['user_id']}\n";
} else {
    echo "   ❌ user_id NÃO encontrado na sessão\n";
}

if (isset($_SESSION['user_role'])) {
    echo "   ✅ user_role encontrado: {$_SESSION['user_role']}\n";
} else {
    echo "   ❌ user_role NÃO encontrado na sessão\n";
}

echo "\n";
echo "📋 TODOS OS DADOS DA SESSÃO:\n";
if (empty($_SESSION)) {
    echo "   ⚠️  Sessão vazia\n";
} else {
    foreach ($_SESSION as $key => $value) {
        echo "   - $key: " . (is_string($value) ? $value : json_encode($value)) . "\n";
    }
}

echo "\n";
echo "📋 COOKIES ENVIADOS:\n";
if (empty($_COOKIE)) {
    echo "   ⚠️  Nenhum cookie encontrado\n";
} else {
    foreach ($_COOKIE as $key => $value) {
        echo "   - $key: $value\n";
    }
}

echo "\n";
echo "📋 HEADERS DA REQUISIÇÃO:\n";
$headers = getallheaders();
if ($headers) {
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'cookie') {
            echo "   - $key: [cookie presente]\n";
        } else {
            echo "   - $key: $value\n";
        }
    }
} else {
    echo "   ⚠️  Nenhum header encontrado\n";
}

echo "\n";
echo "═══════════════════════════════════════════════════════════\n";
echo "  INSTRUÇÕES:\n";
echo "═══════════════════════════════════════════════════════════\n";
echo "1. Faça login na aplicação web\n";
echo "2. Com a sessão ativa, acesse este script novamente\n";
echo "3. Verifique se 'user_id' aparece na sessão\n";
echo "\n";

?>
