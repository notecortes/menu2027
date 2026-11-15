<?php
/**
 * MedDiet Pro — Instalador Web Automático en 1 Clic (cPanel / Plesk / Hosting Compartido)
 * Verifica la conexión a MySQL configurada en config/db.php e importa /sql/database_install.sql
 */

declare(strict_types=1);

require_once __DIR__ . '/config/db.php';

$status = null;
$errorMsg = null;
$stats = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['run_install'])) {
    try {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            PDO::MYSQL_ATTR_MULTI_STATEMENTS => true
        ];

        // 1. Intento de conexión directa con la base de datos (óptimo para Hosting Compartido / cPanel)
        try {
            $dsnWithDb = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
            $pdoRoot = new PDO($dsnWithDb, DB_USER, DB_PASS, $options);
        } catch (PDOException $eDb) {
            // 2. Fallback: Conexión al servidor sin base de datos seleccionada para crearla (Docker / Local / VPS)
            $dsnNoDb = sprintf('mysql:host=%s;port=%s;charset=%s', DB_HOST, DB_PORT, DB_CHARSET);
            $pdoRoot = new PDO($dsnNoDb, DB_USER, DB_PASS, $options);
            $dbNameSafe = str_replace('`', '``', DB_NAME);
            $pdoRoot->exec("CREATE DATABASE IF NOT EXISTS `{$dbNameSafe}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdoRoot->exec("USE `{$dbNameSafe}`");
        }

        $sqlFile = __DIR__ . '/sql/database_install.sql';
        if (!file_exists($sqlFile)) {
            throw new RuntimeException('No se encontró el archivo /sql/database_install.sql');
        }

        $sqlContent = (string)file_get_contents($sqlFile);
        $pdoRoot->exec($sqlContent);

        $stats['recipes'] = (int)$pdoRoot->query("SELECT COUNT(*) FROM recipes")->fetchColumn();
        $stats['ingredients'] = (int)$pdoRoot->query("SELECT COUNT(*) FROM ingredients")->fetchColumn();
        $stats['steps'] = (int)$pdoRoot->query("SELECT COUNT(*) FROM recipe_steps")->fetchColumn();
        $stats['weekly_slots'] = (int)$pdoRoot->query("SELECT COUNT(*) FROM weekly_plans")->fetchColumn();

        $status = 'installed';
    } catch (Throwable $e) {
        $status = 'error';
        $errorMsg = $e->getMessage();
    }
} else {
    try {
        $pdo = getDbConnection();
        $stats['recipes'] = (int)$pdo->query("SELECT COUNT(*) FROM recipes")->fetchColumn();
        $stats['ingredients'] = (int)$pdo->query("SELECT COUNT(*) FROM ingredients")->fetchColumn();
        $stats['steps'] = (int)$pdo->query("SELECT COUNT(*) FROM recipe_steps")->fetchColumn();
        $stats['weekly_slots'] = (int)$pdo->query("SELECT COUNT(*) FROM weekly_plans")->fetchColumn();
        $status = 'ready';
    } catch (Throwable $e) {
        $status = 'pending';
        $errorMsg = $e->getMessage();
    }
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Instalador Web — MedDiet Pro (LAMP / Hosting Compartido)</title>
  <link rel="stylesheet" href="assets/css/styles.css" />
</head>
<body class="installer-body">
  <main class="installer-card">
    <p class="eyebrow">Asistente de Despliegue LAMP · MySQL / MariaDB</p>
    <h1>Instalador Web de MedDiet Pro</h1>
    <p class="subtitle">
      Configuración detectada en <code>config/db.php</code>: Host <strong><?= htmlspecialchars(DB_HOST) ?></strong> · Base de datos <strong><?= htmlspecialchars(DB_NAME) ?></strong> · Usuario <strong><?= htmlspecialchars(DB_USER) ?></strong>
    </p>

    <?php if ($status === 'installed'): ?>
      <div class="alert alert-success">
        <strong>¡Instalación completada con éxito!</strong> Se han importado <?= $stats['recipes'] ?> recetas españolas hipocalóricas, <?= $stats['ingredients'] ?> ingredientes, <?= $stats['steps'] ?> pasos cronometrados y <?= $stats['weekly_slots'] ?> tomas semanales.
        <p style="margin-top: 0.5rem; font-size: 0.85rem;"><em>Recomendación de seguridad:</em> Una vez verificado el funcionamiento, elimina o renombra este archivo <code>install.php</code> para proteger tu servidor de producción.</p>
      </div>
    <?php elseif ($status === 'ready'): ?>
      <div class="alert alert-info">
        <strong>Base de datos operativa:</strong> Conectado correctamente. Actualmente existen <?= $stats['recipes'] ?> recetas cargadas en MySQL.
      </div>
    <?php elseif ($status === 'error'): ?>
      <div class="alert alert-danger">
        <strong>Error durante la instalación:</strong> <?= htmlspecialchars((string)$errorMsg) ?>
      </div>
    <?php else: ?>
      <div class="alert alert-warning">
        <strong>Base de datos pendiente de inicializar:</strong> <?= htmlspecialchars((string)$errorMsg) ?>
      </div>
    <?php endif; ?>

    <form method="post" class="installer-actions">
      <button type="submit" name="run_install" value="1" class="btn-primary">
        Instalar / Reinicializar Base de Datos (1 Clic)
      </button>
      <a href="index.php" class="btn-secondary">Abrir MedDiet Pro</a>
    </form>
  </main>
</body>
</html>
