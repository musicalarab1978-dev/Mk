<?php
/**
 * api/contact.php
 *
 * Receives the contact form and emails it to the address stored in
 * data/site-data.json (contact.email), using PHP's built-in mail().
 *
 * Note: mail() deliverability depends entirely on how your host has mail
 * configured — on many shared hosts it works out of the box, on others it
 * needs SMTP credentials or lands in spam. If it does not work on your host,
 * consider swapping this for PHPMailer with your host's SMTP details, or a
 * third-party form service such as Formspree or EmailJS.
 */

header('Content-Type: application/json');

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'This endpoint only accepts POST requests.');
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($payload)) {
    http_response_code(400);
    respond(false, 'Invalid request body.');
}

$name    = isset($payload['name']) ? trim(strip_tags($payload['name'])) : '';
$email   = isset($payload['email']) ? trim($payload['email']) : '';
$subject = isset($payload['subject']) ? trim(strip_tags($payload['subject'])) : '';
$message = isset($payload['message']) ? trim(strip_tags($payload['message'])) : '';

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    http_response_code(422);
    respond(false, 'Please fill in every field.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    respond(false, 'Please enter a valid email address.');
}
if (mb_strlen($message) > 5000) {
    http_response_code(422);
    respond(false, 'Message is too long.');
}

$dataFile = __DIR__ . '/../data/site-data.json';
$siteData = @json_decode(@file_get_contents($dataFile), true);
$to = (is_array($siteData) && isset($siteData['contact']['email']) && filter_var($siteData['contact']['email'], FILTER_VALIDATE_EMAIL))
    ? $siteData['contact']['email']
    : null;

if (!$to) {
    http_response_code(500);
    respond(false, 'The site owner has not configured a contact email yet.');
}

$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/[^a-zA-Z0-9\.\-]/', '', $_SERVER['HTTP_HOST']) : 'localhost';
$emailSubject = 'Portfolio contact: ' . $subject;
$body = "New message from your portfolio site:\n\n"
      . "Name: $name\n"
      . "Email: $email\n\n"
      . "Message:\n$message\n";
$headers = "From: no-reply@$host\r\n"
         . "Reply-To: $name <$email>\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($to, $emailSubject, $body, $headers);

if ($sent) {
    respond(true, 'Message sent — thanks! I will get back to you soon.');
} else {
    http_response_code(500);
    respond(false, "The server could not send the email. Check your host's mail() configuration.");
}
