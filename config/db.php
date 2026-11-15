<?php
/**
 * MedDiet Pro — Configuración y Conexión a Base de Datos (PDO Singleton)
 * Compatible con Docker local y cualquier Hosting Compartido (cPanel, Plesk, Hostinger, Raiola, etc.).
 *
 * GESTIÓN DE CREDENCIALES PRIVADAS:
 * Para evitar subir tus contraseñas privadas a GitHub:
 * 1. Copia "config/db.local.php.example" a "config/db.local.php".
 * 2. Escribe tus credenciales en "config/db.local.php".
 * 3. Ese archivo está protegido en .gitignore y NUNCA se subirá a GitHub.
 */

declare(strict_types=1);

// 1. Cargar archivo local de credenciales privadas si existe (ignorado por Git)
$localConfigFile = __DIR__ . '/db.local.php';
if (file_exists($localConfigFile)) {
    require_once $localConfigFile;
}

// 2. Detección automática de entorno Docker
$isDocker = (getenv('DOCKER_ENV') === 'true') || (getenv('DB_HOST') === 'db');

// 3. Definición de constantes si no fueron definidas previamente en db.local.php
if (!defined('DB_HOST')) {
    define('DB_HOST', $isDocker ? (getenv('DB_HOST') ?: 'db') : (getenv('DB_HOST') ?: 'localhost'));
}

if (!defined('DB_NAME')) {
    define('DB_NAME', getenv('DB_NAME') ?: 'meddiet_pro');
}

if (!defined('DB_USER')) {
    define('DB_USER', $isDocker ? (getenv('DB_USER') ?: 'meddiet_user') : (getenv('DB_USER') ?: 'root'));
}

if (!defined('DB_PASS')) {
    if ($isDocker) {
        define('DB_PASS', getenv('DB_PASS') ?: 'meddiet_secret_2026');
    } else {
        define('DB_PASS', getenv('DB_PASS') !== false ? (string)getenv('DB_PASS') : '');
    }
}

if (!defined('DB_PORT')) {
    define('DB_PORT', getenv('DB_PORT') ?: '3306');
}

if (!defined('DB_CHARSET')) {
    define('DB_CHARSET', 'utf8mb4');
}

/**
 * Obtiene una instancia singleton de conexión PDO segura con consultas preparadas nativas.
 *
 * @return PDO Instancia activa de conexión MySQL
 * @throws PDOException Si las credenciales o el servidor no son accesibles
 */
function getDbConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }

    return $pdo;
}

/**
 * Envía una respuesta JSON estandarizada con cabeceras UTF-8 y finaliza la ejecución.
 *
 * @param array<string, mixed> $payload Datos a serializar en formato JSON
 * @param int $statusCode Código de estado HTTP (por defecto 200)
 * @return void
 */
function sendJsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
