FROM cimg/node:16.16-browsers

RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
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
RUN sudo mv wp-cli.phar /usr/local/bin/wp-cli
RUN sudo chmod +x /scripts/wp.sh
RUN sudo ln -s /scripts/wp.sh /usr/local/bin/wp

RUN sudo rm -rf /var/www/html
RUN sudo ln -s /wordpress /var/www/html

RUN sudo mkdir /wordpress
RUN sudo chown www-data:www-data /wordpress

RUN sudo mkdir /plugins
RUN sudo chown www-data:www-data /plugins

RUN sudo a2enmod rewrite
COPY virtual-host.conf /etc/apache2/sites-available/000-default.conf

RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
RUN sudo php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN composer --version

RUN sudo chown www-data:www-data /var/www
RUN sudo chown -R www-data:www-data /home/circleci
RUN sudo chown -R www-data:www-data /root/
RUN sudo usermod -aG sudo www-data

USER root

ENTRYPOINT ["bash", "/scripts/docker-entrypoint.sh"]
