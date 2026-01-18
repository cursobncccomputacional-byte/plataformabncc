<?php
/**
 * Autenticação EAD
 * Pode usar o mesmo sistema de autenticação ou criar um separado
 */

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function getCurrentUser(): ?array {
    if (!isset($_SESSION['user'])) {
        return null;
    }
    return $_SESSION['user'];
}

function requireAuth(): array {
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => true, 'message' => 'Não autenticado']);
        exit;
    }
    return $user;
}
