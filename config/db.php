<?php
/**
 * MedDiet Pro — Configuración de Conexión a Base de Datos (PDO)
 * Compatible automáticamente con Docker (puerto 6666) y Hosting Compartido (cPanel, Plesk, Hostinger, Raiola).
 *
 * Para Hosting Compartido: edita únicamente las 4 constantes del bloque else.
 */

declare(strict_types=1);

$isDocker = (getenv('DOCKER_ENV') === 'true') || (getenv('DB_HOST') === 'db');

if ($isDocker) {
    define('DB_HOST', getenv('DB_HOST') ?: 'db');
    define('DB_NAME', getenv('DB_NAME') ?: 'meddiet_pro');
    define('DB_USER', getenv('DB_USER') ?: 'meddiet_user');
    define('DB_PASS', getenv('DB_PASS') ?: 'meddiet_secret_2026');
    define('DB_PORT', getenv('DB_PORT') ?: '3306');
} else {
    // =========================================================================
    // CONFIGURACIÓN PARA SERVIDOR COMPARTIDO (cPanel / Plesk / Hostinger)
    // Lee variables de entorno si existen, o edita directamente estas constantes:
    // =========================================================================
    define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
    define('DB_NAME', getenv('DB_NAME') ?: 'meddiet_pro');
    define('DB_USER', getenv('DB_USER') ?: 'root');
    define('DB_PASS', getenv('DB_PASS') !== false ? (string)getenv('DB_PASS') : '');
    define('DB_PORT', getenv('DB_PORT') ?: '3306');
}

define('DB_CHARSET', 'utf8mb4');

/**
 * Obtiene una instancia singleton de conexión PDO segura con consultas preparadas nativas.
 *
 * @return PDO
 * @throws PDOException
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
