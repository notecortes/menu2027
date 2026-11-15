FROM php:8.2-apache

# Instalar extensiones requeridas para MySQL / MariaDB (PDO, PDO_MySQL y MySQLi)
RUN docker-php-ext-install pdo pdo_mysql mysqli && docker-php-ext-enable pdo_mysql mysqli

# Habilitar mod_rewrite y mod_headers de Apache para rutas amigables y CORS local
RUN a2enmod rewrite headers

# Configurar charset UTF-8 por defecto en PHP
RUN echo "default_charset = \"UTF-8\"" > /usr/local/etc/php/conf.d/charset.ini \
    && echo "upload_max_filesize = 16M" >> /usr/local/etc/php/conf.d/charset.ini \
    && echo "post_max_size = 16M" >> /usr/local/etc/php/conf.d/charset.ini

# Permitir .htaccess en /var/www/html
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

WORKDIR /var/www/html
COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

EXPOSE 80
