ARG CYPRESS_VERSION
FROM cypress/included:$CYPRESS_VERSION

RUN apt-get update && apt-get install -y --no-install-recommends \
    mariadb-client \
    apache2 \
    sudo \
    php \
    php-mysqli \
    php-curl \
    php-zip \
    php-dom \
    ca-certificates \
    libapache2-mod-php \
    php-gd \
    php-ssh2 \
    curl \
    openssh-client

COPY ./scripts /scripts

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
RUN chmod +x wp-cli.phar
COPY wp-cli.yml /

# Move phar in as wp-cli so we can add a shell script as wp that handles switching users and passing the --path param
RUN mv wp-cli.phar /usr/local/bin/wp-cli
RUN chmod +x /scripts/wp.sh
RUN ln -s /scripts/wp.sh /usr/local/bin/wp

RUN rm -rf /var/www/html
RUN ln -s /wordpress /var/www/html

RUN mkdir /wordpress
RUN chown www-data:www-data /wordpress

RUN mkdir /plugins
RUN chown www-data:www-data /plugins

RUN a2enmod rewrite
COPY virtual-host.conf /etc/apache2/sites-available/000-default.conf

RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
RUN php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN composer --version

ENTRYPOINT ["bash", "/scripts/docker-entrypoint.sh"]
