<?php
/**
 * MedDiet Pro — Configuración y Conexión Segura a Base de Datos (PDO Singleton)
 * Compatible con Docker local y cualquier Hosting Compartido (cPanel, Plesk, Hostinger, Raiola, etc.).
 *
 * GESTIÓN DE CREDENCIALES PRIVADAS:
 * 1. En Docker local: Se utiliza de forma automática la red interna de contenedores (db:3306).
 * 2. En Servidor Web / Hosting: Se cargan las credenciales desde `config/db.local.php`.
 * 3. `config/db.local.php` está en `.gitignore`, por lo que NUNCA se sube a GitHub.
 */

declare(strict_types=1);

// 1. Detección automática de entorno Docker
$isDocker = (getenv('DOCKER_ENV') === 'true') || (getenv('DB_HOST') === 'db');

if ($isDocker) {
    // Entorno Docker local: siempre usar las credenciales del contenedor db
    define('DB_HOST', getenv('DB_HOST') ?: 'db');
    define('DB_NAME', getenv('DB_NAME') ?: 'meddiet_pro');
    define('DB_USER', getenv('DB_USER') ?: 'meddiet_user');
    define('DB_PASS', getenv('DB_PASS') ?: 'meddiet_secret_2026');
    define('DB_PORT', getenv('DB_PORT') ?: '3306');
    define('DB_CHARSET', 'utf8mb4');
    define('IS_PRODUCTION_HOSTING', false);
} else {
    // Entorno de hosting compartido / servidor web: cargar db.local.php si existe (ignorado por Git)
    $localConfigFile = __DIR__ . '/db.local.php';
    if (is_file($localConfigFile)) {
        require_once $localConfigFile;
    }

    if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
    if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'meddiet_pro');
    if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'root');
    if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') !== false ? (string)getenv('DB_PASS') : '');
    if (!defined('DB_PORT')) define('DB_PORT', getenv('DB_PORT') ?: '3306');
    if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');
    define('IS_PRODUCTION_HOSTING', true);
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
            PDO::ATTR_TIMEOUT            => 5,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }

    return $pdo;
}

/**
 * Lee y valida de forma segura el cuerpo JSON de una petición POST (máx. 64 KB para prevenir ataques DoS).
 *
 * @param int $maxBytes Límite de bytes permitidos en la petición
 * @return array<string, mixed> Array asociativo con los datos recibidos
 */
function readJsonInput(int $maxBytes = 65536): array
{
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || $raw === '') {
        return [];
    }
    if (strlen($raw) > $maxBytes) {
        sendJsonResponse(['ok' => false, 'error' => 'Payload demasiado grande.'], 413);
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Valida que el día de la semana sea uno de los 7 valores permitidos en español.
 *
 * @param string $day Día a validar
 * @param string $default Valor devuelto si el día no es válido
 * @return string
 */
function sanitizeDayOfWeek(string $day, string $default = 'lunes'): string
{
    $clean = strtolower(trim($day));
    $allowed = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    return in_array($clean, $allowed, true) ? $clean : $default;
}

/**
 * Valida que el tipo de toma sea 'comida' o 'cena'.
 *
 * @param string $meal Toma a validar
 * @param string $default Valor por defecto
 * @return string
 */
function sanitizeMealType(string $meal, string $default = 'comida'): string
{
    $clean = strtolower(trim($meal));
    return in_array($clean, ['comida', 'cena'], true) ? $clean : $default;
}

/**
 * Valida que la estación sea una de las 4 permitidas.
 *
 * @param string $season Estación a validar
 * @param string $default Valor por defecto
 * @return string
 */
function sanitizeSeason(string $season, string $default = 'primavera'): string
{
    $clean = strtolower(trim($season));
    return in_array($clean, ['primavera', 'verano', 'otono', 'invierno'], true) ? $clean : $default;
}

/**
 * Registra el error técnico en el log del servidor y devuelve un mensaje seguro al cliente.
 *
 * @param Throwable $e Excepción capturada
 * @param string $publicContext Descripción para el usuario
 * @return void
 */
function handleApiException(Throwable $e, string $publicContext = 'Error interno del servidor'): void
{
    error_log('[MedDiet Pro API Error] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    $msg = (defined('IS_PRODUCTION_HOSTING') && IS_PRODUCTION_HOSTING)
        ? $publicContext . ' (Verifica tus credenciales en config/db.local.php).'
        : $publicContext . ': ' . $e->getMessage();
    sendJsonResponse(['ok' => false, 'error' => $msg], 500);
}

/**
 * Envía una respuesta JSON estandarizada con cabeceras de seguridad UTF-8 y finaliza la ejecución.
 *
 * @param array<string, mixed> $payload Datos a serializar en formato JSON
 * @param int $statusCode Código de estado HTTP (por defecto 200)
 * @return void
 */
function sendJsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    echo json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP
    );
    exit;
}
