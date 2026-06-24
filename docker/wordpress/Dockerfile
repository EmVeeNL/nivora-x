FROM wordpress:7.0.0-php8.5-apache

# Install system deps needed by Xdebug and WP-CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    less \
    && rm -rf /var/lib/apt/lists/*

# Install Xdebug via PECL
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

# Install WP-CLI
RUN curl -sS https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    -o /usr/local/bin/wp \
    && chmod +x /usr/local/bin/wp

# PHP config — drop-ins are loaded alphabetically after php.ini
COPY php/xdebug.ini  /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini
COPY php/uploads.ini /usr/local/etc/php/conf.d/uploads.ini
