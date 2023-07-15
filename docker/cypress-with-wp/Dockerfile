ARG CYPRESS_VERSION
FROM cypress/included:$CYPRESS_VERSION

# Add packages for Sury
RUN apt-get update && apt-get install -y --no-install-recommends \
    lsb-release \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    curl \
    openssh-client \
    gnupg2

# Add PPA
RUN echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" | tee /etc/apt/sources.list.d/sury-php.list
RUN curl -fsSL  https://packages.sury.org/php/apt.gpg| gpg --dearmor -o /etc/apt/trusted.gpg.d/sury-keyring.gpg

# Install what we need
RUN apt-get update && apt-get install -y --no-install-recommends \
    mariadb-client \
    apache2 \
    sudo \
    php8.1 \
    php8.1-mysqli \
    php8.1-curl \
    php8.1-zip \
    php8.1-dom \
    ca-certificates \
    libapache2-mod-php \
    php8.1-gd \
    php8.1-ssh2 \

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
