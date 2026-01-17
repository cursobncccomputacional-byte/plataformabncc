<?php
/**
 * Script de teste para inserção de usuário no banco de dados
 * 
 * Este script testa a inserção de um usuário passo a passo
 * para identificar onde está o problema.
 * 
 * Acesse: https://novaedubncc.com.br/api/test-insert-user.php
 */

// Definir headers para retornar texto simples (não JSON)
header('Content-Type: text/plain; charset=utf-8');

echo "═══════════════════════════════════════════════════════════\n";
echo "  TESTE DE INSERÇÃO DE USUÁRIO NO BANCO DE DADOS\n";
echo "═══════════════════════════════════════════════════════════\n\n";

// Incluir configuração do banco
require_once __DIR__ . '/config/database.php';

global $pdo;

// Dados de teste
$testData = [
    'name' => 'Usuário Teste',
    'usuario' => 'teste.' . time(), // Usuário único baseado em timestamp
    'password' => 'senha123',
    'role' => 'professor',
    'school' => 'Escola Teste',
    'subjects' => []
];

echo "📋 DADOS DE TESTE:\n";
echo "   Nome: {$testData['name']}\n";
echo "   Usuário: {$testData['usuario']}\n";
echo "   Senha: {$testData['password']}\n";
echo "   Role: {$testData['role']}\n";
echo "   Escola: {$testData['school']}\n";
echo "\n";

// ============================================
// PASSO 1: Verificar conexão
// ============================================
echo "🔍 PASSO 1: Verificando conexão com o banco...\n";
try {
    $pdo->query("SELECT 1");
    echo "   ✅ Conexão estabelecida com sucesso!\n";
} catch (PDOException $e) {
    echo "   ❌ ERRO na conexão: " . $e->getMessage() . "\n";
    exit(1);
}
echo "\n";

// ============================================
// PASSO 2: Verificar estrutura da tabela
// ============================================
echo "🔍 PASSO 2: Verificando estrutura da tabela 'usuarios'...\n";
try {
    $stmt = $pdo->query("DESCRIBE usuarios");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   ✅ Tabela 'usuarios' encontrada!\n";
    echo "   📊 Colunas da tabela:\n";
    foreach ($columns as $col) {
        $null = $col['Null'] === 'YES' ? 'NULL' : 'NOT NULL';
        $default = $col['Default'] !== null ? " (default: {$col['Default']})" : '';
        echo "      - {$col['Field']} ({$col['Type']}) {$null}{$default}\n";
    }
} catch (PDOException $e) {
    echo "   ❌ ERRO ao verificar tabela: " . $e->getMessage() . "\n";
    exit(1);
}
echo "\n";

// ============================================
// PASSO 3: Verificar se usuário já existe
// ============================================
echo "🔍 PASSO 3: Verificando se usuário já existe...\n";
try {
    $checkStmt = $pdo->prepare("SELECT id, nome, usuario FROM usuarios WHERE usuario = ?");
    $checkStmt->execute([$testData['usuario']]);
    $existingUser = $checkStmt->fetch();
    
    if ($existingUser) {
        echo "   ⚠️  Usuário já existe:\n";
        echo "      ID: {$existingUser['id']}\n";
        echo "      Nome: {$existingUser['nome']}\n";
        echo "      Usuário: {$existingUser['usuario']}\n";
        echo "   ℹ️  Usando usuário diferente para teste...\n";
        $testData['usuario'] = 'teste.' . time() . '.' . rand(1000, 9999);
        echo "   Novo usuário: {$testData['usuario']}\n";
    } else {
        echo "   ✅ Usuário não existe, pode prosseguir\n";
    }
} catch (PDOException $e) {
    echo "   ❌ ERRO ao verificar usuário: " . $e->getMessage() . "\n";
    exit(1);
}
echo "\n";

// ============================================
// PASSO 4: Gerar ID e hash da senha
// ============================================
echo "🔍 PASSO 4: Gerando ID único e hash da senha...\n";
$userId = $testData['role'] . '-' . strtolower(str_replace([' ', '.'], ['-', ''], $testData['usuario'])) . '-' . substr(md5($testData['usuario'] . time()), 0, 8);
$hashedPassword = password_hash($testData['password'], PASSWORD_BCRYPT);
$materiasJson = !empty($testData['subjects']) ? json_encode($testData['subjects']) : null;

echo "   ID gerado: $userId\n";
echo "   Hash da senha: " . substr($hashedPassword, 0, 30) . "...\n";
echo "   Materias JSON: " . ($materiasJson ?? 'NULL') . "\n";
echo "   ✅ Dados preparados com sucesso!\n";
echo "\n";

// ============================================
// PASSO 5: Preparar e executar INSERT
// ============================================
echo "🔍 PASSO 5: Preparando e executando INSERT...\n";
try {
    $pdo->beginTransaction();
    echo "   ✅ Transação iniciada\n";
    
    $insertStmt = $pdo->prepare("
        INSERT INTO usuarios (id, nome, usuario, senha, nivel_acesso, escola, materias, ativo, data_criacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
    ");
    
    echo "   📝 Valores a serem inseridos:\n";
    echo "      id: $userId\n";
    echo "      nome: {$testData['name']}\n";
    echo "      usuario: {$testData['usuario']}\n";
    echo "      senha: [hash bcrypt]\n";
    echo "      nivel_acesso: {$testData['role']}\n";
    echo "      escola: {$testData['school']}\n";
    echo "      materias: " . ($materiasJson ?? 'NULL') . "\n";
    echo "      ativo: 1\n";
    echo "      data_criacao: NOW()\n";
    echo "\n";
    
    echo "   ⚙️  Executando INSERT...\n";
    $insertResult = $insertStmt->execute([
        $userId,
        $testData['name'],
        $testData['usuario'],
        $hashedPassword,
        $testData['role'],
        $testData['school'],
        $materiasJson
    ]);
    
    if (!$insertResult) {
        $errorInfo = $insertStmt->errorInfo();
        echo "   ❌ ERRO ao executar INSERT:\n";
        echo "      SQLSTATE: {$errorInfo[0]}\n";
        echo "      Código: {$errorInfo[1]}\n";
        echo "      Mensagem: {$errorInfo[2]}\n";
        $pdo->rollBack();
        exit(1);
    }
    
    $rowCount = $insertStmt->rowCount();
    echo "   ✅ INSERT executado!\n";
    echo "   📊 Linhas afetadas: $rowCount\n";
    
    if ($rowCount === 0) {
        echo "   ⚠️  AVISO: INSERT executado mas nenhuma linha foi afetada!\n";
        echo "   🔍 Verificando possíveis causas...\n";
        
        // Verificar se há triggers ou constraints
        $stmt = $pdo->query("SHOW TRIGGERS LIKE 'usuarios'");
        $triggers = $stmt->fetchAll();
        if (count($triggers) > 0) {
            echo "   ⚠️  Triggers encontrados na tabela!\n";
        }
        
        $pdo->rollBack();
        exit(1);
    }
    
    // Commit da transação
    $pdo->commit();
    echo "   ✅ Transação commitada com sucesso!\n";
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        echo "   ⚠️  Transação revertida (rollback)\n";
    }
    echo "   ❌ ERRO PDO: " . $e->getMessage() . "\n";
    echo "   Código: " . $e->getCode() . "\n";
    echo "   SQLSTATE: " . $e->errorInfo[0] . "\n";
    exit(1);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        echo "   ⚠️  Transação revertida (rollback)\n";
    }
    echo "   ❌ ERRO: " . $e->getMessage() . "\n";
    exit(1);
}
echo "\n";

// ============================================
// PASSO 6: Verificar se o usuário foi inserido
// ============================================
echo "🔍 PASSO 6: Verificando se o usuário foi inserido...\n";
try {
    $selectStmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
    $selectStmt->execute([$userId]);
    $newUser = $selectStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$newUser) {
        echo "   ❌ ERRO CRÍTICO: Usuário inserido mas não encontrado ao buscar!\n";
        echo "   🔍 Verificando se há algum problema com o ID...\n";
        
        // Tentar buscar pelo usuário
        $selectStmt2 = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ?");
        $selectStmt2->execute([$testData['usuario']]);
        $userByUsuario = $selectStmt2->fetch(PDO::FETCH_ASSOC);
        
        if ($userByUsuario) {
            echo "   ✅ Usuário encontrado pelo campo 'usuario'!\n";
            echo "   📊 Dados do usuário:\n";
            print_r($userByUsuario);
        } else {
            echo "   ❌ Usuário não encontrado nem pelo ID nem pelo usuario\n";
        }
        exit(1);
    }
    
    echo "   ✅ Usuário encontrado com sucesso!\n";
    echo "   📊 Dados do usuário inserido:\n";
    foreach ($newUser as $key => $value) {
        if ($key === 'senha') {
            echo "      $key: [hash oculto - " . strlen($value) . " caracteres]\n";
        } else {
            echo "      $key: " . ($value ?? 'NULL') . "\n";
        }
    }
    
} catch (PDOException $e) {
    echo "   ❌ ERRO ao buscar usuário: " . $e->getMessage() . "\n";
    exit(1);
}
echo "\n";

// ============================================
// PASSO 7: Verificar total de usuários
// ============================================
echo "🔍 PASSO 7: Verificando total de usuários na tabela...\n";
try {
    $countStmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios");
    $count = $countStmt->fetch(PDO::FETCH_ASSOC);
    echo "   📊 Total de usuários na tabela: {$count['total']}\n";
} catch (PDOException $e) {
    echo "   ⚠️  Erro ao contar usuários: " . $e->getMessage() . "\n";
}
echo "\n";

// ============================================
// PASSO 8: Limpar usuário de teste (opcional)
// ============================================
echo "🔍 PASSO 8: Removendo usuário de teste...\n";
try {
    $deleteStmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
    $deleteResult = $deleteStmt->execute([$userId]);
    $deletedRows = $deleteStmt->rowCount();
    
    if ($deletedRows > 0) {
        echo "   ✅ Usuário de teste removido com sucesso!\n";
    } else {
        echo "   ⚠️  Nenhuma linha foi removida\n";
    }
} catch (PDOException $e) {
    echo "   ⚠️  Erro ao remover usuário de teste: " . $e->getMessage() . "\n";
    echo "   ℹ️  Você pode remover manualmente o usuário com ID: $userId\n";
}
echo "\n";

// ============================================
// RESULTADO FINAL
// ============================================
echo "═══════════════════════════════════════════════════════════\n";
echo "  ✅ TESTE CONCLUÍDO COM SUCESSO!\n";
echo "═══════════════════════════════════════════════════════════\n";
echo "\n";
echo "📝 CONCLUSÃO:\n";
echo "   A inserção de usuários está funcionando corretamente!\n";
echo "   Se o problema persistir na aplicação, verifique:\n";
echo "   1. Se a sessão do usuário root está ativa\n";
echo "   2. Se há algum problema de permissões na API\n";
echo "   3. Se há algum erro nos logs do servidor\n";
echo "   4. Se o endpoint POST /api/users está sendo chamado corretamente\n";
echo "\n";

?>
