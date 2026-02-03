<?php
/**
 * Endpoint de usuários (JSON)
 *
 * GET    /api/users/index.php            -> lista usuários
 * POST   /api/users/index.php            -> cria usuário
 * DELETE /api/users/index.php            -> remove usuário (body: { user_id })
 *
 * Obs: este arquivo estava com trechos corrompidos e causava erro 500 (parse error).
 * Esta versão é propositalmente simples e robusta.
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// CORS + preflight (mantém o comportamento esperado no frontend)
require_once __DIR__ . '/../config/cors.php';

// Preflight CORS (OPTIONS): precisa responder 200 ANTES do requireAuth(),
// senão o navegador bloqueia (401/403 no preflight vira erro de CORS).
if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        json_response(400, ['error' => true, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }
    return $data;
}

// Autenticação + autorização
$currentUser = requireAuth();
if (($currentUser['role'] ?? null) !== 'admin' && ($currentUser['role'] ?? null) !== 'root') {
    json_response(403, ['error' => true, 'message' => 'Acesso negado']);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

try {
    global $pdo;
    if (!isset($pdo)) {
        json_response(500, ['error' => true, 'message' => 'Conexão com banco não disponível']);
    }

    if ($method === 'GET') {
        // Root vê todos os usuários, Admin vê apenas os que criou
        if ($currentUser['role'] === 'root') {
            $stmt = $pdo->query("SELECT * FROM usuarios ORDER BY data_criacao DESC");
        } else {
            // Admin: apenas usuários criados por ele
            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE criado_por = ? ORDER BY data_criacao DESC");
            $stmt->execute([$currentUser['id']]);
        }
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $usersList = [];
        foreach ($users as $user) {
            $usersList[] = [
                'id' => $user['id'],
                'name' => $user['nome'],
                'email' => $user['usuario'],
                'role' => $user['nivel_acesso'],
                'school' => $user['escola'] ?? '',
                'subjects' => json_decode($user['materias'] ?? '[]', true),
                'created_at' => $user['data_criacao'],
                'last_login' => $user['ultimo_login'] ?? null,
                'is_active' => (bool)($user['ativo'] ?? 0),
                'formacao_continuada' => (bool)($user['formacao_continuada'] ?? 0),
                'can_manage_activities' => (bool)($user['can_manage_activities'] ?? 0),
                'can_manage_courses' => (bool)($user['can_manage_courses'] ?? 0),
                // Campos de limite para admins
                'max_professores' => isset($user['max_professores']) ? (int)$user['max_professores'] : null,
                'max_alunos' => isset($user['max_alunos']) ? (int)$user['max_alunos'] : null,
                'professores_criados' => isset($user['professores_criados']) ? (int)$user['professores_criados'] : 0,
                'alunos_criados' => isset($user['alunos_criados']) ? (int)$user['alunos_criados'] : 0,
                'pacote' => $user['pacote'] ?? null,
                'data_contratacao' => $user['data_contratacao'] ?? null,
                'data_expiracao' => $user['data_expiracao'] ?? null,
                'criado_por' => $user['criado_por'] ?? null,
            ];
        }

        json_response(200, ['error' => false, 'users' => $usersList]);
    }

    if ($method === 'POST') {
        $data = read_json_body();

        $name = trim((string)($data['name'] ?? ''));
        $usuario = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');
        $role = (string)($data['role'] ?? '');
        $school = isset($data['school']) && trim((string)$data['school']) !== '' ? trim((string)$data['school']) : null;
        $subjects = isset($data['subjects']) && is_array($data['subjects']) ? $data['subjects'] : [];

        if ($name === '' || $usuario === '' || $password === '' || $role === '') {
            json_response(400, ['error' => true, 'message' => 'Campos obrigatórios: name, email, password, role']);
        }
        if (strlen($password) < 6) {
            json_response(400, ['error' => true, 'message' => 'A senha deve ter pelo menos 6 caracteres']);
        }

        $allowedRoles = ['root', 'admin', 'professor', 'teste_professor', 'aluno', 'professor_cursos'];
        if (!in_array($role, $allowedRoles, true)) {
            json_response(400, ['error' => true, 'message' => 'Nível de acesso inválido']);
        }

        // Admin não cria admin/root
        if ($currentUser['role'] === 'admin' && ($role === 'root' || $role === 'admin')) {
            json_response(403, ['error' => true, 'message' => 'Administradores não podem criar Admin/Root']);
        }

        // VALIDAÇÃO DE LIMITES PARA ADMINS
        if ($currentUser['role'] === 'admin') {
            // Buscar informações de limite do admin atual
            $adminStmt = $pdo->prepare("SELECT max_professores, max_alunos, professores_criados, alunos_criados, data_expiracao FROM usuarios WHERE id = ?");
            $adminStmt->execute([$currentUser['id']]);
            $adminData = $adminStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($adminData) {
                // Verificar se o pacote expirou
                if (!empty($adminData['data_expiracao'])) {
                    $dataExpiracao = new DateTime($adminData['data_expiracao']);
                    $hoje = new DateTime();
                    if ($dataExpiracao < $hoje) {
                        json_response(403, ['error' => true, 'message' => 'Seu pacote expirou. Entre em contato para renovar.']);
                    }
                }
                
                // Validar limite de professores
                if ($role === 'professor') {
                    $maxProf = $adminData['max_professores'] ?? null;
                    $profCriados = (int)($adminData['professores_criados'] ?? 0);
                    
                    if ($maxProf !== null && $profCriados >= $maxProf) {
                        json_response(403, [
                            'error' => true, 
                            'message' => "Limite de professores atingido. Você pode criar até {$maxProf} professores. ({$profCriados}/{$maxProf} utilizados)"
                        ]);
                    }
                }
                
                // Validar limite de alunos
                if ($role === 'aluno') {
                    $maxAlunos = $adminData['max_alunos'] ?? null;
                    $alunosCriados = (int)($adminData['alunos_criados'] ?? 0);
                    
                    if ($maxAlunos !== null && $alunosCriados >= $maxAlunos) {
                        json_response(403, [
                            'error' => true, 
                            'message' => "Limite de alunos atingido. Você pode criar até {$maxAlunos} alunos. ({$alunosCriados}/{$maxAlunos} utilizados)"
                        ]);
                    }
                }
            }
        }

        // Escola obrigatória apenas para professor e aluno (não para professor_cursos)
        if (($role === 'professor' || $role === 'aluno') && empty($school)) {
            json_response(400, ['error' => true, 'message' => 'Escola é obrigatória para professores e alunos']);
        }

        // Verificar duplicidade
        $checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $checkStmt->execute([$usuario]);
        if ($checkStmt->fetch()) {
            json_response(409, ['error' => true, 'message' => 'Este usuário já está cadastrado']);
        }

        $userId = $role . '-' . strtolower(str_replace([' ', '.'], ['-', ''], $usuario)) . '-' . substr(md5($usuario . microtime(true)), 0, 8);
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $materiasJson = !empty($subjects) ? json_encode($subjects, JSON_UNESCAPED_UNICODE) : null;

        $pdo->beginTransaction();
        $insertStmt = $pdo->prepare("
            INSERT INTO usuarios (id, nome, usuario, senha, nivel_acesso, escola, materias, ativo, data_criacao, criado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?)
        ");
        $insertStmt->execute([$userId, $name, $usuario, $hashedPassword, $role, $school, $materiasJson, $currentUser['id']]);

        // LGPD: registrar aceite da Política de Privacidade (se colunas existirem)
        if (!empty($data['aceite_politica_privacidade'])) {
            $versaoPolitica = trim((string)($data['versao_politica_privacidade'] ?? '1.0')) ?: '1.0';
            try {
                $updLgpd = $pdo->prepare("UPDATE usuarios SET data_aceite_politica_privacidade = NOW(), versao_politica_privacidade = ? WHERE id = ?");
                $updLgpd->execute([$versaoPolitica, $userId]);
            } catch (PDOException $e) {
                // Colunas LGPD podem não existir ainda; executar add-lgpd-consent-usuarios.sql
            }
        }
        
        // INCREMENTAR CONTADORES SE FOR ADMIN CRIANDO PROFESSOR OU ALUNO
        if ($currentUser['role'] === 'admin' && ($role === 'professor' || $role === 'aluno')) {
            if ($role === 'professor') {
                $updateStmt = $pdo->prepare("UPDATE usuarios SET professores_criados = COALESCE(professores_criados, 0) + 1 WHERE id = ?");
            } else {
                $updateStmt = $pdo->prepare("UPDATE usuarios SET alunos_criados = COALESCE(alunos_criados, 0) + 1 WHERE id = ?");
            }
            $updateStmt->execute([$currentUser['id']]);
        }
        
        $pdo->commit();

        // Retornar usuário criado
        $selectStmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
        $selectStmt->execute([$userId]);
        $newUser = $selectStmt->fetch(PDO::FETCH_ASSOC);
        if (!$newUser) {
            json_response(500, ['error' => true, 'message' => 'Usuário criado mas não encontrado']);
        }

        json_response(201, [
            'error' => false,
            'message' => 'Usuário criado com sucesso',
            'user' => [
                'id' => $newUser['id'],
                'name' => $newUser['nome'],
                'email' => $newUser['usuario'],
                'role' => $newUser['nivel_acesso'],
                'school' => $newUser['escola'] ?? '',
                'subjects' => json_decode($newUser['materias'] ?? '[]', true),
                'created_at' => $newUser['data_criacao'],
                'last_login' => $newUser['ultimo_login'] ?? null,
                'is_active' => (bool)($newUser['ativo'] ?? 0),
            ],
        ]);
    }

    if ($method === 'PATCH') {
        $data = read_json_body();
        $userId = trim((string)($data['user_id'] ?? ''));
        $isActive = isset($data['is_active']) ? (bool)$data['is_active'] : null;
        
        // Atualizar limites de admin (apenas root)
        $updateLimits = isset($data['update_limits']) && $data['update_limits'] === true;
        $maxProfessores = isset($data['max_professores']) ? (int)$data['max_professores'] : null;
        $maxAlunos = isset($data['max_alunos']) ? (int)$data['max_alunos'] : null;
        $pacote = isset($data['pacote']) ? trim((string)$data['pacote']) : null;
        $dataContratacao = isset($data['data_contratacao']) ? trim((string)$data['data_contratacao']) : null;
        $dataExpiracao = isset($data['data_expiracao']) ? trim((string)$data['data_expiracao']) : null;

        if ($userId === '') {
            json_response(400, ['error' => true, 'message' => 'ID do usuário não fornecido']);
        }

        $checkStmt = $pdo->prepare("SELECT id, nivel_acesso, criado_por FROM usuarios WHERE id = ?");
        $checkStmt->execute([$userId]);
        $userToUpdate = $checkStmt->fetch(PDO::FETCH_ASSOC);
        if (!$userToUpdate) {
            json_response(404, ['error' => true, 'message' => 'Usuário não encontrado']);
        }

        // Atualizar limites (apenas root pode fazer isso)
        if ($updateLimits) {
            if ($currentUser['role'] !== 'root') {
                json_response(403, ['error' => true, 'message' => 'Apenas root pode atualizar limites de admins']);
            }
            
            if ($userToUpdate['nivel_acesso'] !== 'admin') {
                json_response(400, ['error' => true, 'message' => 'Limites só podem ser definidos para usuários admin']);
            }
            
            $updateFields = [];
            $updateValues = [];
            
            if ($maxProfessores !== null) {
                $updateFields[] = "max_professores = ?";
                $updateValues[] = $maxProfessores;
            }
            if ($maxAlunos !== null) {
                $updateFields[] = "max_alunos = ?";
                $updateValues[] = $maxAlunos;
            }
            if ($pacote !== null) {
                $updateFields[] = "pacote = ?";
                $updateValues[] = $pacote;
            }
            if ($dataContratacao !== null) {
                $updateFields[] = "data_contratacao = ?";
                $updateValues[] = $dataContratacao;
            }
            if ($dataExpiracao !== null) {
                $updateFields[] = "data_expiracao = ?";
                $updateValues[] = $dataExpiracao;
            }
            
            if (!empty($updateFields)) {
                $updateValues[] = $userId;
                $updateSql = "UPDATE usuarios SET " . implode(", ", $updateFields) . " WHERE id = ?";
                $updateStmt = $pdo->prepare($updateSql);
                $updateStmt->execute($updateValues);
                
                json_response(200, [
                    'error' => false,
                    'message' => 'Limites atualizados com sucesso'
                ]);
            } else {
                json_response(400, ['error' => true, 'message' => 'Nenhum campo de limite fornecido']);
            }
            return;
        }

        // Atualizar status (is_active)
        if ($isActive === null) {
            json_response(400, ['error' => true, 'message' => 'is_active é obrigatório']);
        }

        if ($userId === ($currentUser['id'] ?? '')) {
            json_response(403, ['error' => true, 'message' => 'Você não pode inativar sua própria conta']);
        }

        // Admin só pode atualizar usuários que criou
        if ($currentUser['role'] === 'admin') {
            $criadoPor = $userToUpdate['criado_por'] ?? null;
            if ($criadoPor !== $currentUser['id']) {
                json_response(403, ['error' => true, 'message' => 'Você só pode atualizar usuários que você criou']);
            }
        }

        // Só root pode inativar root
        if (($userToUpdate['nivel_acesso'] ?? '') === 'root' && ($currentUser['role'] ?? '') !== 'root') {
            json_response(403, ['error' => true, 'message' => 'Apenas root pode inativar usuários root']);
        }

        $updateStmt = $pdo->prepare("UPDATE usuarios SET ativo = ? WHERE id = ?");
        $updateStmt->execute([$isActive ? 1 : 0, $userId]);
        if ($updateStmt->rowCount() === 0) {
            json_response(500, ['error' => true, 'message' => 'Erro ao atualizar status do usuário']);
        }

        json_response(200, [
            'error' => false,
            'message' => $isActive ? 'Usuário ativado com sucesso' : 'Usuário inativado com sucesso'
        ]);
    }

    if ($method === 'DELETE') {
        $data = read_json_body();
        $userId = (string)($data['user_id'] ?? ($_GET['id'] ?? ''));
        $userId = trim($userId);
        if ($userId === '') {
            json_response(400, ['error' => true, 'message' => 'ID do usuário não fornecido']);
        }

        if ($userId === ($currentUser['id'] ?? '')) {
            json_response(403, ['error' => true, 'message' => 'Você não pode deletar sua própria conta']);
        }

        $checkStmt = $pdo->prepare("SELECT id, nivel_acesso, criado_por FROM usuarios WHERE id = ?");
        $checkStmt->execute([$userId]);
        $userToDelete = $checkStmt->fetch(PDO::FETCH_ASSOC);
        if (!$userToDelete) {
            json_response(404, ['error' => true, 'message' => 'Usuário não encontrado']);
        }

        // Só root pode apagar root
        if (($userToDelete['nivel_acesso'] ?? '') === 'root' && ($currentUser['role'] ?? '') !== 'root') {
            json_response(403, ['error' => true, 'message' => 'Apenas root pode deletar usuários root']);
        }

        // Admin só pode deletar usuários que ele criou
        if ($currentUser['role'] === 'admin') {
            $criadoPor = $userToDelete['criado_por'] ?? null;
            if ($criadoPor !== $currentUser['id']) {
                json_response(403, ['error' => true, 'message' => 'Você só pode deletar usuários que você criou']);
            }
        }

        // DECREMENTAR CONTADORES SE FOR ADMIN DELETANDO PROFESSOR OU ALUNO QUE ELE CRIOU
        $roleToDelete = $userToDelete['nivel_acesso'] ?? '';
        if ($currentUser['role'] === 'admin' && ($roleToDelete === 'professor' || $roleToDelete === 'aluno')) {
            $criadoPor = $userToDelete['criado_por'] ?? null;
            // Só decrementa se foi o admin atual que criou
            if ($criadoPor === $currentUser['id']) {
                if ($roleToDelete === 'professor') {
                    $decrementStmt = $pdo->prepare("UPDATE usuarios SET professores_criados = GREATEST(COALESCE(professores_criados, 0) - 1, 0) WHERE id = ?");
                } else {
                    $decrementStmt = $pdo->prepare("UPDATE usuarios SET alunos_criados = GREATEST(COALESCE(alunos_criados, 0) - 1, 0) WHERE id = ?");
                }
                $decrementStmt->execute([$currentUser['id']]);
            }
        }

        $deleteStmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
        $deleteStmt->execute([$userId]);
        if ($deleteStmt->rowCount() === 0) {
            json_response(500, ['error' => true, 'message' => 'Erro ao deletar usuário']);
        }

        json_response(200, ['error' => false, 'message' => 'Usuário deletado com sucesso']);
    }

    json_response(405, ['error' => true, 'message' => 'Método não permitido']);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(500, ['error' => true, 'message' => 'Erro no banco de dados', 'details' => $e->getMessage()]);
} catch (Throwable $e) {
    json_response(500, ['error' => true, 'message' => 'Erro no servidor', 'details' => $e->getMessage()]);
}

// Método não suportado
if (ob_get_level() > 0) {
    ob_clean();
}
header('Content-Type: application/json; charset=utf-8');
http_response_code(405);
echo json_encode(['error' => true, 'message' => 'Método não permitido']);
if (ob_get_level() > 0) {
    ob_end_flush();
}
exit;