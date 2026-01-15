<?php
/**
 * Script para gerar hashes das senhas dos usuários iniciais
 * Execute este arquivo no servidor ou localmente com PHP CLI
 * 
 * Uso: php gerar-hashes-senhas.php
 */

echo "========================================\n";
echo "GERADOR DE HASHES DE SENHAS\n";
echo "========================================\n\n";

// Senhas padrão
$senhas = [
    'root' => 'root123',
    'admin' => 'admin123'
];

echo "Gerando hashes das senhas...\n\n";

foreach ($senhas as $tipo => $senha) {
    $hash = password_hash($senha, PASSWORD_DEFAULT);
    
    echo "----------------------------------------\n";
    echo "Usuário: {$tipo}\n";
    echo "Senha original: {$senha}\n";
    echo "Hash gerado: {$hash}\n";
    echo "\n";
    echo "SQL para atualizar:\n";
    echo "UPDATE users SET password = '{$hash}' WHERE email = '{$tipo}@plataformabncc.com';\n";
    echo "\n";
}

echo "========================================\n";
echo "IMPORTANTE:\n";
echo "1. Copie os comandos SQL acima\n";
echo "2. Execute no PHPMyAdmin\n";
echo "3. Ou use o script atualizar-senhas.php\n";
echo "========================================\n";
