<?php
/**
 * Load environment variables from .env file
 * Looks for .env in current directory, then parent directories
 */
function loadEnv($path = null) {
    if ($path === null) {
        // Try multiple locations: current dir, parent dir, project root
        $paths = [
            __DIR__ . '/.env',
            __DIR__ . '/../.env',
            dirname(__DIR__) . '/.env',
            $_SERVER['DOCUMENT_ROOT'] . '/.env',
        ];
        
        foreach ($paths as $tryPath) {
            if (file_exists($tryPath)) {
                $path = $tryPath;
                break;
            }
        }
    }
    
    if ($path && file_exists($path)) {
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            // Parse KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                // Remove quotes if present
                $value = trim($value, '"\'');
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

// Load environment variables
loadEnv();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

// Sanitize and validate email
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// PocketBase API configuration from environment variables
$apiUrl = getenv('POCKETBASE_API_URL') ?: 'https://api.arkr.ca/api/collections/arkr_manual_emails/records';
$secretKey = getenv('POCKETBASE_SECRET_KEY');

if (empty($secretKey)) {
    error_log('PocketBase secret key not found in environment variables');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error. Please contact support.']);
    exit;
}

// Prepare data for PocketBase
$data = [
    'email' => $email
];

// Initialize cURL
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-PB-Secret: ' . $secretKey
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
$curlErrno = curl_errno($ch);

// Close cURL handle
if (is_resource($ch)) {
    curl_close($ch);
}

// Handle cURL errors
if ($curlError || $curlErrno) {
    error_log('PocketBase API cURL Error [' . $curlErrno . ']: ' . $curlError);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to connect to server. Please try again.']);
    exit;
}

// Handle HTTP response codes
if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Submitted!']);
} else {
    // Log error for debugging (server-side only)
    error_log('PocketBase API HTTP Error: ' . $httpCode . ' - Response: ' . substr($response, 0, 500));
    
    // Try to parse error response from PocketBase
    $errorMessage = 'Failed to save email. Please try again.';
    if ($response) {
        $errorData = json_decode($response, true);
        if (isset($errorData['message'])) {
            $errorMessage = $errorData['message'];
        } elseif (isset($errorData['data']) && isset($errorData['data']['email'])) {
            // Handle duplicate email case
            $errorMessage = 'This email is already registered.';
        }
    }
    
    http_response_code($httpCode >= 400 && $httpCode < 500 ? $httpCode : 500);
    echo json_encode(['success' => false, 'message' => $errorMessage]);
}
?>

