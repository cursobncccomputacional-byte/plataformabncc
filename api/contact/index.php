<?php
/**
 * Formulário de contato / inscrição — envia os dados para o e-mail da Nova Edu.
 * Destinatário: contato@novaedubncc.com.br (configurável abaixo).
 * Não armazena senha de e-mail no código; o envio usa a configuração de mail do servidor.
 */

require_once __DIR__ . '/../config/cors.php';

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$CONTACT_EMAIL = 'contato@novaedubncc.com.br';
$FROM_EMAIL = 'contato@novaedubncc.com.br';
$FROM_NAME = 'Plataforma BNCC - Formulário';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => true, 'message' => 'Método não permitido']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$nome = trim((string) ($data['nome'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$celular = trim((string) ($data['celular'] ?? ''));
$cidade = trim((string) ($data['cidade'] ?? ''));
$nome_escola = trim((string) ($data['nome_escola'] ?? ''));
$cargo = trim((string) ($data['cargo'] ?? ''));
$tipo_escola = trim((string) ($data['tipo_escola'] ?? ''));

if ($nome === '' || $email === '' || $celular === '' || $cidade === '' || $nome_escola === '' || $cargo === '' || $tipo_escola === '') {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'Preencha todos os campos obrigatórios.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'E-mail inválido.']);
    exit;
}

$assunto = '[Plataforma BNCC] Novo contato / inscrição: ' . $nome;

$corpo = "Formulário de contato / inscrição — Plataforma BNCC\n\n";
$corpo .= "Nome: $nome\n";
$corpo .= "E-mail: $email\n";
$corpo .= "Celular: $celular\n";
$corpo .= "Cidade: $cidade\n";
$corpo .= "Nome da escola: $nome_escola\n";
$corpo .= "Cargo na escola: $cargo\n";
$corpo .= "Tipo de escola: $tipo_escola\n";
$corpo .= "\n---\nEnviado em " . date('d/m/Y H:i:s') . " (Plataforma BNCC)\n";

$headers = [
    'From: ' . $FROM_NAME . ' <' . $FROM_EMAIL . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/plain; charset=UTF-8',
];

$enviado = @mail($CONTACT_EMAIL, $assunto, $corpo, implode("\r\n", $headers));

if ($enviado) {
    echo json_encode(['error' => false, 'message' => 'Mensagem enviada com sucesso. Em breve entraremos em contato.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Não foi possível enviar a mensagem. Tente novamente ou entre em contato por e-mail.']);
}
