<?php
/**
 * LGPD - Portabilidade e acesso aos dados do titular
 * GET /api/users/me-dados.php
 * Retorna os dados pessoais do usuário logado em formato estruturado (JSON).
 * Não inclui senha (hash).
 */

require_once __DIR__ . '/../config/cors.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

$userId = isAuthenticated();
if (!$userId) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(401);
    echo json_encode(['error' => true, 'message' => 'Não autenticado']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nome, usuario, nivel_acesso, escola, materias, biografia, data_criacao, ultimo_login, ativo FROM usuarios WHERE id = ?");
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(404);
        echo json_encode(['error' => true, 'message' => 'Usuário não encontrado']);
        exit;
    }

    $dadosPessoais = [
        'id' => $row['id'],
        'nome' => $row['nome'],
        'usuario_email' => $row['usuario'],
        'nivel_acesso' => $row['nivel_acesso'],
        'escola' => $row['escola'],
        'materias_disciplinas' => json_decode($row['materias'] ?? '[]', true),
        'biografia' => $row['biografia'],
        'data_criacao' => $row['data_criacao'],
        'ultimo_login' => $row['ultimo_login'],
        'ativo' => (bool)$row['ativo'],
    ];
    $dados = [
        'exportado_em' => date('c'),
        'dados_pessoais' => $dadosPessoais,
    ];

    header('Content-Type: application/json; charset=utf-8');
    http_response_code(200);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Erro ao exportar dados']);
}
