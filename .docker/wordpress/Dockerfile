FROM wordpress:7.1.2-php8.3-apache


RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install PHP Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install WP-CLI
RUN curl -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x /usr/local/bin/wp

# Copy PHP upload config
COPY uploads.ini /usr/local/etc/php/conf.d/uploads.ini

# Copy Redis object cache drop-in
COPY object-cache.php /usr/src/wordpress/wp-content/object-cache.php

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/clog-entrypoint.sh
RUN chmod +x /usr/local/bin/clog-entrypoint.sh

CMD ["clog-entrypoint.sh"]
