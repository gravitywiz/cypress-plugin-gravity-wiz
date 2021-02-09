FROM cypress/included:6.4.0
RUN apt-get update && apt-get install -y mariadb-client sudo php php-mysqli

COPY ./scripts /scripts

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
RUN chmod +x wp-cli.phar

# Move phar in as wp-cli so we can add a shell script as wp that handles switching users and passing the --path param
RUN mv wp-cli.phar /usr/local/bin/wp-cli
RUN chmod +x /scripts/wp.sh
RUN ln -s /scripts/wp.sh /usr/local/bin/wp

ENTRYPOINT ["bash", "/scripts/entrypoint.sh"]
