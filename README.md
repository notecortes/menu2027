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

## 3. Despliegue en Servidor Web Compartido (cPanel / Plesk / Hostinger / FTP)

1. **Crear Base de Datos MySQL:** En el panel de tu hosting (cPanel > *Bases de datos MySQL*), crea una base de datos y un usuario con todos los privilegios.
2. **Configurar Credenciales:** Abre el archivo `config/db.php` y edita las constantes del bloque de servidor compartido:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'tu_base_de_datos');
   define('DB_USER', 'tu_usuario_mysql');
   define('DB_PASS', 'tu_contraseña_mysql');
   ```
3. **Subir Archivos vía FTP:** Sube los archivos (`api/`, `config/`, `public/`, `assets/`, `sql/`, `index.php`, `install.php`, `.htaccess`) a la carpeta `public_html` de tu servidor. No es necesario subir la carpeta `data/` (esta sólo la usa MariaDB en Docker local).
4. **Importar las 200 Recetas y Tablas:**
   - **Opción A (1 Clic):** Visita `https://tudominio.com/install.php` y pulsa **"Instalar / Reinicializar Base de Datos (1 Clic)"**. Una vez instalado, borra `install.php` por seguridad.
   - **Opción B (phpMyAdmin):** Abre phpMyAdmin en tu hosting, selecciona tu base de datos y en la pestaña *Importar* sube el archivo `/sql/database_install.sql`.

---

## 4. Estructura del Proyecto
```text
├── Dockerfile                     # Imagen PHP 8.2 + Apache con pdo_mysql, mysqli y mod_rewrite
├── docker-compose.yml             # Servicios web (5566:80), db (MariaDB 10.6 en 55060) y phpmyadmin (5567:80)
├── .htaccess                      # Reglas Apache para rutas, seguridad y caché
├── index.php                      # Enrutador raíz nativo para Apache
├── install.php                    # Instalador web automático en 1 clic para hosting compartido
├── config/
│   └── db.php                     # Detección automática Docker / Hosting compartido con PDO seguro
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
