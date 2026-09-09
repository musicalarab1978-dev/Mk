<?php
/**
 * api/save.php
 *
 * Receives the current site content from the admin panel and writes it to
 * data/site-data.json, so every visitor (not just the browser that made the
 * edit) sees the change. This requires the project to be hosted on a server
 * with PHP support — it will not run from a local double-click preview.
 *
 * Security note: this checks a single shared access code (kept in
 * data/config.json) before writing. That is enough to stop casual/opportunistic
 * requests, but it is NOT a full authentication system. If this site will
 * hold anything sensitive, put a real login system in front of this file,
 * serve the whole site over HTTPS, and consider restricting api/save.php by
 * IP address in .htaccess.
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

if (json_last_error() !== JSON_ERROR_NONE || !is_array($payload) || !isset($payload['code']) || !isset($payload['data'])) {
    http_response_code(400);
    respond(false, 'Invalid request body.');
}

// Load the current access code from data/config.json (falls back to 2708
// if that file is missing, so the site still works right after download).
$configFile = __DIR__ . '/../data/config.json';
$config = @json_decode(@file_get_contents($configFile), true);
$validCode = (is_array($config) && !empty($config['adminCode'])) ? (string) $config['adminCode'] : '2708';

if ((string) $payload['code'] !== $validCode) {
    http_response_code(403);
    respond(false, 'Invalid access code.');
}

$dataDir = __DIR__ . '/../data';
$dataFile = $dataDir . '/site-data.json';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$jsonToSave = json_encode($payload['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($jsonToSave === false) {
    http_response_code(400);
    respond(false, 'Could not encode the submitted content as JSON.');
}

$written = @file_put_contents($dataFile, $jsonToSave);

if ($written === false) {
    http_response_code(500);
    respond(false, 'Could not write data/site-data.json. Check that the data/ folder is writable by the server (try chmod 755 or 775).');
}

respond(true, 'Saved. This content is now live for every visitor.');
