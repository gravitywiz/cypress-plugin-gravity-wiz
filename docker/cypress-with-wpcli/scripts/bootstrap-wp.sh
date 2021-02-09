#!/usr/bin/env bash
# Make sure the database is up and running.
while ! mysqladmin ping -hmysql --silent; do
	echo 'Waiting for the database'
	sleep 1
done

echo 'The database is ready'
echo 'Installing WordPress...'

wp core install --url=wordpress --title=tests --admin_user=admin --admin_password=admin --admin_email=test@test.com

# The development version of Gravity Flow requires SCRIPT_DEBUG
wp core config --dbhost=mysql --dbname=wordpress --dbuser=wordpress --dbpass=wordpress --extra-php="define( 'SCRIPT_DEBUG', true );" --force

echo "WordPress version: $(wp core version)"
echo "Installing the --version ${GF_VERSION:-hotfix} of Gravity Forms using the CLI"

wp plugin install gravityformscli --force --activate
wp gf install --key=${GF_KEY} --version=${GF_VERSION:-hotfix} --activate --force --quiet
echo "Gravity Forms installation complete"

wp gf tool verify-checksums
