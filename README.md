# MedDiet Pro — Planificador Semanal Mediterráneo Español Hipocalórico

Aplicación web profesional desarrollada con arquitectura **LAMP (Linux, Apache, MySQL/MariaDB, PHP 8.2 PDO)** + **HTML5, CSS3 y Vanilla JavaScript moderno (ES6+)** con **CERO dependencias de Node.js en producción**, diseñada tanto para contenedores Docker como para despliegue directo por FTP en cualquier hosting compartido (cPanel, Plesk, Hostinger, Raiola Networks).

---

## 1. Reglas Nutricionales y Gastronómicas Verificadas
1. **Cocina Mediterránea Española Real (< 35 min):** 42 recetas tradicionales españolas reales (lentejas pardinas estofadas con verduras, garbanzos con espinacas, pisto manchego con huevo escalfado, salmorejo cordobés sin pan, merluza a la plancha al ajillo, lubina al horno con patata panadera medida, pechuga de pollo con escalivada, etc.).
2. **Déficit Calórico Saludable:** Ajustado entre **1.350 y 1.600 kcal/día** por comensal.
3. **Exclusiones Radicales (0% Tolerancia):**
   - **SIN MARISCO** (sin gambas, langostinos, mejillones, almejas, sepia, calamar ni caldos de marisco).
   - **SIN BACALAO.**
   - **SIN RAPE.**
4. **Distribución Semanal Obligatoria:**
   - **Viernes para comer (Mediodía):** SIEMPRE fijo **"Arroz blanco a la cubana (versión ligera)"**.
   - **Comidas (Mediodía):** Exactamente **2 días por semana de legumbres**.
   - **Cenas (Noche):** Exactamente **2 noches por semana de pescado permitido**.

---

## 2. Despliegue Local con Docker (Puerto `5566`)

### Requisitos
- Docker y Docker Compose instalados.

### Pasos
```bash
# 1. Levantar los contenedores en segundo plano (Apache+PHP 8.2 + MariaDB 10.6 + phpMyAdmin)
docker compose up -d --build
```

- **Aplicación Web MedDiet Pro:** [http://localhost:5566](http://localhost:5566)
- **Gestor Visual phpMyAdmin:** [http://localhost:5567](http://localhost:5567) (Usuario: `meddiet_user` / Contraseña: `meddiet_secret_2026`)
- **Persistencia de Datos MySQL:** Los datos se guardan automáticamente en `./data/mysql` y el script `/sql/database_install.sql` se importa automáticamente al iniciar el contenedor `db` por primera vez.

---

## 3. Despliegue en Cualquier Servidor Web o Hosting (cPanel / Plesk / Hostinger / Raiola / VPS)

La aplicación está diseñada con arquitectura pura **LAMP (PHP 8 + MySQL + Vanilla JS)** sin necesidad de Node.js, npm, Composer ni pasos de compilación en el servidor. Puede ejecutarse tanto en la raíz de un dominio como en una subcarpeta (ej. `midominio.com/menu/`).

### Requisitos del Servidor
- **Servidor Web:** Apache, LiteSpeed o Nginx.
- **PHP:** 7.4 o superior (recomendado PHP 8.1, 8.2 o 8.3) con extensiones `pdo` y `pdo_mysql` (activas por defecto en la totalidad de proveedores de hosting).
- **Base de Datos:** MySQL 5.7+ o MariaDB 10.3+.

---

### Paso a Paso para Desplegar en un Nuevo Hosting

#### Paso 1. Subir los archivos al servidor
Sube todos los archivos del proyecto a la carpeta pública de tu hosting (habitualmente `public_html` en cPanel o `httpdocs` en Plesk) mediante FTP (FileZilla) o el Administrador de Archivos de tu panel.
> **Importante:** No subas la carpeta `data/` ni la carpeta `docs/` (la carpeta `data/` solo la utiliza el contenedor Docker local para guardar ficheros binarios).

#### Paso 2. Configurar credenciales privadas seguras (Sin riesgo de subirlas a Git)
Para que tus claves del hosting **nunca** se suban a GitHub:
1. En la carpeta `config/`, encontrarás la plantilla `config/db.local.php.example`.
2. Haz una copia de ese archivo y renómbralo a:
   ```text
   config/db.local.php
   ```
3. Edita `config/db.local.php` con las credenciales de la base de datos creada en tu hosting:
   ```php
   <?php
   define('DB_HOST', 'localhost');        // Generalmente 'localhost' en cPanel/Plesk
   define('DB_NAME', 'u123456_meddiet');  // Nombre asignado en tu hosting
   define('DB_USER', 'u123456_user');    // Usuario con permisos en la BD
   define('DB_PASS', 'TuClaveSegura2026'); // Contraseña del usuario MySQL
   define('DB_PORT', '3306');
   ```
4. **Seguridad garantizada:** El archivo `config/db.local.php` está registrado en `.gitignore`. Puedes realizar `git add .`, commits y `git push` con total tranquilidad: tus credenciales locales **jamás** se enviarán a GitHub.

*(Opcional: Si tu hosting permite configurar variables de entorno en el panel o en `.htaccess` mediante directivas `SetEnv DB_USER ...`, la aplicación las detectará automáticamente si no existe `db.local.php`).*

#### Paso 3. Instalar la Base de Datos (200 Recetas y Tablas)
Dispones de dos métodos para cargar la estructura y las recetas:
- **Método A — Asistente Web en 1 Clic (Recomendado):**  
  Abre en tu navegador la URL:
  ```text
  https://tudominio.com/install.php
  ```
  El instalador validará la conexión con `config/db.local.php`. Pulsa **"Instalar / Reinicializar Base de Datos (1 Clic)"**. Se crearán las tablas y se importarán automáticamente las 200 recetas mediterráneas hipocalóricas, ingredientes y pasos cronometrados.
- **Método B — Importación manual vía phpMyAdmin:**  
  Accede a phpMyAdmin desde el panel de tu hosting, entra en tu base de datos y en la pestaña **Importar** selecciona el archivo `sql/database_install.sql`.

#### Paso 4. Seguridad Post-Instalación
Una vez que hayas comprobado que la aplicación carga correctamente en tu navegador:
1. **Elimina o renombra** el archivo `install.php` en tu servidor para evitar reinicializaciones no deseadas.
2. El archivo `.htaccess` incluido bloquea automáticamente accesos web directos a volcados `.sql`, configuraciones (`config/`) y archivos sensibles.

---

## 4. Estructura del Proyecto
```text
├── Dockerfile                     # Imagen PHP 8.2 + Apache con pdo_mysql, mysqli y mod_rewrite
├── docker-compose.yml             # Servicios web (5566:80), db (MariaDB 10.6 en 55060) y phpmyadmin (5567:80)
├── .gitignore                     # Protege credenciales (db.local.php), docs/ y datos de Docker
├── .htaccess                      # Reglas Apache para rutas, seguridad y caché
├── index.php                      # Enrutador raíz nativo para Apache
├── install.php                    # Instalador web automático en 1 clic para hosting compartido
├── config/
│   ├── db.php                     # Conexión PDO con carga segura de credenciales locales
│   └── db.local.php.example       # Plantilla de credenciales privadas para hosting (copiar a db.local.php)
├── sql/
│   └── database_install.sql       # Esquema completo + 200 recetas españolas reales + ingredientes + pasos
├── api/
│   ├── get_menu.php               # Obtiene el plan semanal activo, calorías y menús guardados
│   ├── swap_recipe.php            # Motor de intercambio de platos y regeneración estacional
│   ├── get_recipe_details.php     # Ficha completa con ingredientes escalados y pasos con timer
│   ├── get_shopping_list.php      # Consulta SQL SUM(amount * :diners) GROUP BY ingredient_id
│   └── save_menu.php              # Guardado y carga de menús semanales en MySQL
└── public/
    ├── index.php                  # Interfaz principal HTML5 semántica
    └── assets/
        ├── css/styles.css         # Estilos Mediterranean Modern con Modo Claro/Oscuro y @media print
        ├── js/engine.js           # Motor relacional y clínico-nutricional ES6+
        ├── js/recipes_catalog.js  # Catálogo complementario de recetas
        ├── js/app.js              # Controlador SPA Vanilla JS (Fetch API + Web Audio API Timers)
        └── img/                   # Fotografías gastronómicas verificadas de alta resolución
```
