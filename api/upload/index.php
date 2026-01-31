<?php
/**
 * API de Upload de Arquivos
 * POST /api/upload/index.php
 * 
 * Body: multipart/form-data com campo 'file'
 * Retorna: { "error": false, "url": "caminho/do/arquivo.jpg" }
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

// Preflight CORS (OPTIONS): responder 200 para o navegador aceitar o POST cross-origin.
// Sem isso, requisições de outro computador/origem falham com CORS bloqueado.
if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_response_upload(int $status, array $payload): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response_upload(405, ['error' => true, 'message' => 'Método não permitido']);
}

// Verificar autenticação
$currentUser = getCurrentUser();
if (!$currentUser) {
    // Tentar obter do header X-User-Id como fallback
    $userId = $_SERVER['HTTP_X_USER_ID'] ?? null;
    $userRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;
    
    if ($userId && $userRole) {
        global $pdo;
        try {
            $stmt = $pdo->prepare("SELECT id, usuario, role, can_manage_activities, can_manage_courses FROM usuarios WHERE id = ?");
            $stmt->execute([$userId]);
            $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Erro ao buscar usuário: ' . $e->getMessage());
        }
    }
}

if (!$currentUser) {
    json_response_upload(401, ['error' => true, 'message' => 'Não autenticado']);
}

// Verificar permissão (root ou can_manage_activities ou can_manage_courses)
$isRoot = ($currentUser['role'] ?? '') === 'root';
$canManageActivities = (bool)($currentUser['can_manage_activities'] ?? false);
$canManageCourses = (bool)($currentUser['can_manage_courses'] ?? false);

if (!$isRoot && !$canManageActivities && !$canManageCourses) {
    json_response_upload(403, ['error' => true, 'message' => 'Acesso negado']);
}

// Verificar se arquivo foi enviado
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = 'Nenhum arquivo enviado';
    if (isset($_FILES['file']['error'])) {
        switch ($_FILES['file']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMsg = 'Arquivo muito grande';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMsg = 'Upload parcial';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMsg = 'Nenhum arquivo enviado';
                break;
            default:
                $errorMsg = 'Erro no upload: ' . $_FILES['file']['error'];
        }
    }
    json_response_upload(400, ['error' => true, 'message' => $errorMsg]);
}

$file = $_FILES['file'];
$fileName = $file['name'];
$fileTmpPath = $file['tmp_name'];
$fileSize = $file['size'];
$fileType = $file['type'];

// Validar tipo de arquivo (apenas imagens)
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($fileType, $allowedTypes, true)) {
    json_response_upload(400, ['error' => true, 'message' => 'Tipo de arquivo não permitido. Apenas imagens (JPG, PNG, GIF, WEBP)']);
}

// Validar tamanho (máximo 20MB)
$maxSize = 20 * 1024 * 1024; // 20MB
if ($fileSize > $maxSize) {
    json_response_upload(400, ['error' => true, 'message' => 'Arquivo muito grande. Máximo: 20MB']);
}

// Validar extensão
$fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
$allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($fileExt, $allowedExts, true)) {
    json_response_upload(400, ['error' => true, 'message' => 'Extensão não permitida']);
}

// Criar nome único para o arquivo
$uniqueName = uniqid('thumb_', true) . '.' . $fileExt;

// Determinar diretório de upload
// Tentar diferentes caminhos possíveis
$uploadDirs = [
    __DIR__ . '/../../public/thumbnails',
    __DIR__ . '/../../../public/thumbnails',
    __DIR__ . '/../../thumbnails',
    __DIR__ . '/../../../thumbnails',
];

$uploadDir = null;
foreach ($uploadDirs as $dir) {
    if (is_dir($dir) && is_writable($dir)) {
        $uploadDir = $dir;
        break;
    }
}

// Se não encontrou, tentar criar
if (!$uploadDir) {
    $baseDir = __DIR__ . '/../../public';
    if (!is_dir($baseDir)) {
        $baseDir = __DIR__ . '/../../..';
    }
    $uploadDir = $baseDir . '/thumbnails';
    
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            json_response_upload(500, ['error' => true, 'message' => 'Não foi possível criar diretório de upload']);
        }
    }
}

// Caminho completo do arquivo
$filePath = $uploadDir . '/' . $uniqueName;

// Mover arquivo
if (!move_uploaded_file($fileTmpPath, $filePath)) {
    json_response_upload(500, ['error' => true, 'message' => 'Erro ao salvar arquivo']);
}

// Determinar URL relativa baseada na estrutura real do servidor
// Se o arquivo está em public_html/public/thumbnails/, a URL deve ser /public/thumbnails/arquivo.jpg
// Se o arquivo está em public_html/thumbnails/, a URL deve ser /thumbnails/arquivo.jpg

$relativePath = 'thumbnails/' . $uniqueName;

// Detectar se está dentro de uma pasta 'public'
if (strpos($uploadDir, '/public/') !== false) {
    // Extrair a parte após /public/
    $parts = explode('/public/', $uploadDir);
    if (count($parts) > 1) {
        // Se está em public_html/public/thumbnails/, URL será /public/thumbnails/arquivo.jpg
        $relativePath = 'public/thumbnails/' . $uniqueName;
    }
} else {
    // Se está diretamente em public_html/thumbnails/, URL será /thumbnails/arquivo.jpg
    $relativePath = 'thumbnails/' . $uniqueName;
}

// URL completa (ajustar conforme estrutura do servidor)
// Detectar protocolo e host automaticamente
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'novaedubncc.com.br';
$baseUrl = $protocol . '://' . $host;

// DocumentRoot geralmente é public_html/, então arquivos em public_html/public/thumbnails/
// são acessíveis via /public/thumbnails/
$fileUrl = $baseUrl . '/' . $relativePath;

json_response_upload(200, [
    'error' => false,
    'message' => 'Upload realizado com sucesso',
    'url' => $fileUrl,
    'filename' => $uniqueName
]);
